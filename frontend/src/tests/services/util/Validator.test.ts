import {describe, expect, it, jest} from "@jest/globals";
import {ValidatorFactory} from "../../../services/util/Validator.ts";
import { spyOn } from 'jest-mock';


type FetchResponse = { json: () => Promise<any> };

const buildSchemas = (variant: "en" | "fr") => {
    const suffix = variant === "en" ? "_en" : "_fr";
    return {
        [`sector_location_schema${suffix}.json`]: { $id: `sector_location_schema${suffix}.json`, type: "object" },
        "dac5_schema.json": { $id: "dac5_schema.json", type: "object" },
        "feature_project_schema.json": {
            $id: "feature_project_schema.json",
            type: "object",
            properties: { foo: { type: "string" } },
            required: ["foo"]
        },
        [`project_core_schema${suffix}.json`]: { $id: `project_core_schema${suffix}.json`, type: "object" }
    };
};

function mockFetchSuccess(variant: "en" | "fr") {
    const schemas = buildSchemas(variant);
    (global as any).fetch = jest.fn((url: string): Promise<FetchResponse> => {
        const file = url.split("/").pop()!;
        const schema = (schemas as any)[file];
        if (!schema) return Promise.reject(new Error("unexpected url " + url));
        return Promise.resolve({
            json: () => Promise.resolve(schema)
        });
    });
}

function mockFetchFailure(failingFileSubstring: string) {
    (global as any).fetch = jest.fn((url: string) => {
        if (url.includes(failingFileSubstring)) {
            return Promise.reject(new Error("network down"));
        }
        return Promise.resolve({
            json: () => Promise.resolve({ $id: url.split("/").pop(), type: "object" })
        });
    });
}

describe("ValidatorFactory.getProjectValidator", () => {

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("returns a validator function for 'en' and validates correctly", async () => {
        mockFetchSuccess("en");
        const validator = await (ValidatorFactory.getProjectValidator("en") as Promise<any>);
        expect(typeof validator).toBe("function");
        expect(validator({ foo: "bar" })).toBe(true);
        expect(validator({})).toBe(false);
    });

    it("returns a validator function for 'fr' and validates correctly", async () => {
        mockFetchSuccess("fr");
        const validator = await (ValidatorFactory.getProjectValidator("fr") as Promise<any>);
        expect(typeof validator).toBe("function");
        expect(validator({ foo: "baz" })).toBe(true);
        expect(validator({})).toBe(false);
    });

    it("propagates fetch failure as rejected promise for 'en'", async () => {
        mockFetchFailure("dac5_schema");
        await expect(ValidatorFactory.getProjectValidator("en") as Promise<any>)
            .rejects
            .toThrow("can not load validation schemas - please check your internet connection");
    });

    it("propagates fetch failure as rejected promise for 'fr'", async () => {
        mockFetchFailure("dac5_schema");
        await expect(ValidatorFactory.getProjectValidator("fr") as Promise<any>)
            .rejects
            .toThrow("can not load validation schemas - please check your internet connection");
    });

    it("rejects promise for unsupported language", async () => {
        await expect(ValidatorFactory.getProjectValidator("de" as any))
            .rejects
            .toThrow("Unsupported language: de");
    });

    it("validator fails when required field missing", async () => {
        mockFetchSuccess("en");
        const validator = await (ValidatorFactory.getProjectValidator("en") as Promise<any>);
        const ok = validator({ foo: "value" });
        const bad = validator({ other: "x" });
        expect(ok).toBe(true);
        expect(bad).toBe(false);
        expect(Array.isArray(validator.errors) || validator.errors === null).toBe(true);
    });
});
