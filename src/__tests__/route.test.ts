import { Route } from "../route";

const parameterPattern = "([a-zA-Z0-9-_~\\.%]+)";

describe("Class Route", () => {
    describe("When pathTemplate for the Route has no expressions", () => {
        let route: Route;

        beforeEach(() => {
            route = new Route("GET", "/items");
        });

        test("Value of pathRegExpAndParameters.pathRegExp is correct", () => {
            expect(route.pathRegExpAndParameters.pathRegExp).toEqual(/^\/items$/);
        });

        test("Value of pathRegExpAndParameters.parameters is correct", () => {
            expect(route.pathRegExpAndParameters.parameters).toEqual([]);
        });

        test("Subsequent read of pathRegExpAndParameters returns the same value", () => {
            const fistReadValue = route.pathRegExpAndParameters;

            expect(route.pathRegExpAndParameters).toEqual(fistReadValue);
        });
    });

    describe("When pathTemplate for the Route has a single expression", () => {
        let route: Route;

        beforeEach(() => {
            route = new Route("GET", "/items/{itemSlug}");
        });

        test("Value of pathRegExpAndParameters.pathRegExp is correct", () => {
            expect(route.pathRegExpAndParameters.pathRegExp).toEqual(new RegExp("^/items/" + parameterPattern + "$"));
        });

        test("Value of pathRegExpAndParameters.parameters is correct", () => {
            expect(route.pathRegExpAndParameters.parameters).toEqual(["itemSlug"]);
        });

        test("Subsequent read of pathRegExpAndParameters returns the same value", () => {
            const fistReadValue = route.pathRegExpAndParameters;

            expect(route.pathRegExpAndParameters).toEqual(fistReadValue);
        });
    });

    describe("When pathTemplate for the Route has multiple expressions", () => {
        let route: Route;

        beforeEach(() => {
            route = new Route("GET", "/items/{itemSlug}/images/{imageNumber}");
        });

        test("Value of pathRegExpAndParameters.pathRegExp is correct", () => {
            expect(route.pathRegExpAndParameters.pathRegExp).toEqual(new RegExp("^/items/" + parameterPattern + "/images/"  + parameterPattern + "$"));
        });

        test("Value of pathRegExpAndParameters.parameters is correct", () => {
            expect(route.pathRegExpAndParameters.parameters).toEqual(["itemSlug", "imageNumber"]);
        });

        test("Subsequent read of pathRegExpAndParameters returns the same value", () => {
            const fistReadValue = route.pathRegExpAndParameters;

            expect(route.pathRegExpAndParameters).toEqual(fistReadValue);
        });
    });

    describe("When pathTemplate for the Route has a literal occurring after the last expression", () => {
        let route: Route;

        beforeEach(() => {
            route = new Route("GET", "/items/{itemSlug}/images/{imageNumber}/metadata");
        });

        test("Value of pathRegExpAndParameters.pathRegExp is correct", () => {
            expect(route.pathRegExpAndParameters.pathRegExp).toEqual(new RegExp("^/items/" + parameterPattern + "/images/"  + parameterPattern + "/metadata$"));
        });

        test("Value of pathRegExpAndParameters.parameters is correct", () => {
            expect(route.pathRegExpAndParameters.parameters).toEqual(["itemSlug", "imageNumber"]);
        });

        test("Subsequent read of pathRegExpAndParameters returns the same value", () => {
            const fistReadValue = route.pathRegExpAndParameters;

            expect(route.pathRegExpAndParameters).toEqual(fistReadValue);
        });
    });
});
