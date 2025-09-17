import {ExcelConverter, Utils} from "../../../services/util/Utils.ts";
import {ErrorObject} from "ajv";

describe("Utils", () => {
    describe("toFormatErrors", () => {
        it("formats error with instancePath and message", () => {
            const error = { instancePath: "/foo", message: "bar" };
            expect(Utils.toFormatErrors(error)).toBe('Error at "/foo": bar');
        });

        it("formats error with only message", () => {
            const error = { message: "bar" };
            expect(Utils.toFormatErrors(error)).toBe('Error: bar');
        });

        it("formats error with only instancePath", () => {
            const error = { instancePath: "/foo" };
            expect(Utils.toFormatErrors(error)).toBe('Error at "/foo"');
        });

        it("formats error with neither", () => {
            const error = {};
            expect(Utils.toFormatErrors(error)).toBe('Error');
        });
    });

    describe("toFeature", () => {
        it("just should fail", () => {
            expect(true).toBe(false);
        })
        it("returns feature if validateProject returns true", () => {
            Utils.validateProject = () => true;
            const feature = { foo: "bar" };
            expect(Utils.toFeature(feature)).toBe(feature);
        });

        it("returns null if validateProject returns false", () => {
            Utils.validateProject = () => false;
            const feature = { foo: "bar" };
            expect(Utils.toFeature(feature)).toBeNull();
        });

        it("returns null if validateProject is not set", () => {
            delete Utils.validateProject;
            const feature = { foo: "bar" };
            expect(Utils.toFeature(feature)).toBeNull();
        });
    });

    describe("notNull", () => {
        it("returns true for non-null value", () => {
            expect(Utils.notNull(1)).toBe(true);
        });

        it("returns false for null", () => {
            expect(Utils.notNull(null)).toBe(false);
        });
    });

    describe("notUndefined", () => {
        it("returns true for defined value", () => {
            expect(Utils.notUndefined(1)).toBe(true);
        });

        it("returns false for undefined", () => {
            expect(Utils.notUndefined(undefined)).toBe(false);
        });
    });

    describe("formatAjvErrorsCSVExcel", () => {
        it("returns empty array if errors is falsy", () => {
            expect(Utils.formatAjvErrorsCSVExcel(null, 1)).toEqual([]);
        });

        it("consolidates coordinate errors", () => {
            const errors: ErrorObject[] = [
                { instancePath: "/geometry/coordinates", message: "must be array" } as ErrorObject,
                { instancePath: "/geometry/type", message: "must be string" } as ErrorObject
            ];
            expect(Utils.formatAjvErrorsCSVExcel(errors, 2)).toEqual([
                "Row 2: Invalid or missing coordinates (latitude/longitude values). The project location is not printed on the map."
            ]);
        });

        it("formats non-coordinate errors", () => {
            const errors: ErrorObject[] = [
                { instancePath: "/foo", message: "bar" } as ErrorObject
            ];
            expect(Utils.formatAjvErrorsCSVExcel(errors, 3)).toEqual([
                'Row 3 at "/foo": bar'
            ]);
        });

        it("skips coordinate errors and formats others", () => {
            const errors: ErrorObject[] = [
                { instancePath: "/geometry/coordinates", message: "must be array" } as ErrorObject,
                { instancePath: "/foo", message: "bar" } as ErrorObject
            ];
            expect(Utils.formatAjvErrorsCSVExcel(errors, 4)).toEqual([
                "Row 4: Invalid or missing coordinates (latitude/longitude values). The project location is not printed on the map.",
                'Row 4 at "/foo": bar'
            ]);
        });
    });
});

describe("ExcelConverter", () => {
    describe("removeWhiteSpaceInOneFeatureProperty", () => {
        it("removes all spaces from kfwProjectNoINPRO", () => {
            const feature = { properties: { kfwProjectNoINPRO: "A B C 123" } };
            expect(ExcelConverter.removeWhiteSpaceInOneFeatureProperty(feature)).toBe("ABC123");
        });
    });
});

