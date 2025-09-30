import Ajv, {AsyncValidateFunction, ValidateFunction} from "ajv";
import addFormats from "ajv-formats";
import {SupportedLangs} from "./Utils.ts";

export class ValidatorFactory {


    private static toFetchPromiseURLs(url: string) {
        return fetch(url)
            .then(r => r.json())
            .catch(e => {
                //console.error(e)
                return Promise.reject(new Error("can not load validation schemas - please check your internet connection"))
            })
    }

    public static getProjectValidator(lang: SupportedLangs): Promise<ValidateFunction<unknown> | AsyncValidateFunction<unknown>> {
        console.debug("getProjectValidator");
        const branch = "250729-french-schema"
        //avoid raw.githubusercontent.com //https://stackoverflow.com/questions/64792450/avoiding-getting-cached-content-from-raw-githubusercontent-com#:~:text=It%20will%20sometimes%20return%20cached,new%20commit%20to%20that%20branch
        // so we'll try another url: https://github.com/openkfw/open-geodata-model/raw/refs/heads/250729-french-schema/references/generated_sector_location_schema.json
        const URL_PREFIX = "https://github.com/openkfw/open-geodata-model/raw/refs/heads"
        const schema_json_urls_en = [
            `${URL_PREFIX}/${branch}/references/sector_location_schema_en.json`,
            `${URL_PREFIX}/${branch}/references/dac5_schema.json`,
            `${URL_PREFIX}/${branch}/references/feature_project_schema.json`,
            `${URL_PREFIX}/${branch}/references/project_core_schema_en.json`
        ];

        const schema_json_urls_fr = [
            `${URL_PREFIX}/${branch}/references/sector_location_schema_fr.json`,
            `${URL_PREFIX}/${branch}/references/dac5_schema.json`,
            `${URL_PREFIX}/${branch}/references/feature_project_schema.json`,
            `${URL_PREFIX}/${branch}/references/project_core_schema_fr.json`
        ];

        const fetchPromises = schema_json_urls_en.map(this.toFetchPromiseURLs)
        const fetchPromises_fr = schema_json_urls_fr.map(this.toFetchPromiseURLs)

        switch (lang) {
            case "en": {
                const ajv = new Ajv({allErrors: true});
                return Promise.all(fetchPromises)
                    .then(results => {
                        results.forEach(r => ajv.addSchema(r))
                        return ajv
                    })
                    .then(ajv => {
                        addFormats(ajv)
                        console.debug("return ajv.getSchema()_en");
                        return ajv.getSchema("feature_project_schema.json");
                    })
                    .catch(e => {
                        return Promise.reject(new Error("can not load validation schemas - please check your internet connection"));
                    })
            }
            case "fr": {
                const ajv_fr = new Ajv({allErrors: true});
                return Promise.all(fetchPromises_fr)
                    .then(results => {
                        results.forEach(r => ajv_fr.addSchema(r))
                        return ajv_fr
                    })
                    .then(ajv_fr => {
                        addFormats(ajv_fr)
                        console.debug("return ajv.getSchema()_fr");
                        return ajv_fr.getSchema("feature_project_schema.json");
                    })
                    .catch(() => {
                        return Promise.reject(new Error("can not load validation schemas - please check your internet connection"));
                    })
            }
            default: {
                // Der Test erwartet "Unsupported language: de" als Fehlermeldung
                return Promise.reject(new Error(`Unsupported language: ${lang}`));
            }
        }
    }

}
