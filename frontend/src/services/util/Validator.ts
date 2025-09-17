import Ajv, {AsyncValidateFunction, ValidateFunction} from "ajv";
import addFormats from "ajv-formats";
import {SupportedLangs} from "./Utils.ts";

export class ValidatorFactory {


    private static toFetchPromiseURLs(url: string) {
        return fetch(url)
            .then(r => r.json())
            .catch(e => {
                console.error(e)
                throw new Error("can not load validation schemas - please check your internet connection")
            })
    }

    public static getProjectValidator(lang: SupportedLangs): Promise<ValidateFunction<unknown> | AsyncValidateFunction<unknown>> {
        console.debug("getProjectValidator");
        const branch = "250729-french-schema"
        const schema_json_urls_en = [
            `https://raw.githubusercontent.com/openkfw/open-geodata-model/${branch}/references/sector_location_schema_en.json`,
            `https://raw.githubusercontent.com/openkfw/open-geodata-model/${branch}/references/dac5_schema.json`,
            `https://raw.githubusercontent.com/openkfw/open-geodata-model/${branch}/references/feature_project_schema.json`,
            `https://raw.githubusercontent.com/openkfw/open-geodata-model/${branch}/references/project_core_schema_en.json`
        ];

        const schema_json_urls_fr = [
            `https://raw.githubusercontent.com/openkfw/open-geodata-model/${branch}/references/sector_location_schema_fr.json`,
            `https://raw.githubusercontent.com/openkfw/open-geodata-model/${branch}/references/dac5_schema.json`,
            `https://raw.githubusercontent.com/openkfw/open-geodata-model/${branch}/references/feature_project_schema.json`,
            `https://raw.githubusercontent.com/openkfw/open-geodata-model/${branch}/references/project_core_schema_fr.json`
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
                        throw new Error(e.message)
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
                        console.debug("return ajv.getSchema()_en");
                        return ajv_fr.getSchema("feature_project_schema.json");
                    })
                    .catch((e: Error) => {
                        throw new Error(e.message)
                    })
            }
            default: {
                throw new Error(`Unsupported language: ${lang}`);
            }
        }
    }

}
