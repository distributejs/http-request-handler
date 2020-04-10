import { Route } from "../route";

const parameterPattern = "(/[a-zA-Z0-9-_~\\.%]+)";

describe("Class Route", () => {
    describe("When pathTemplate for the Route has no expressions", () => {
        let route: Route;

        beforeEach(() => {
            route = new Route("GET", "/items", jest.fn());
        });

        test("Value of pathRegExpAndParameters.pathRegExp is correct", () => {
            expect(route.pathRegExpAndParameters.pathRegExp).toEqual(/^\/items\/??$/);
        });

        test("Value of pathRegExpAndParameters.parameters is correct", () => {
            expect(route.pathRegExpAndParameters.parameters).toEqual([]);
        });

        test("Subsequent read of pathRegExpAndParameters returns the same value", () => {
            const fistReadValue = route.pathRegExpAndParameters;

            expect(route.pathRegExpAndParameters).toEqual(fistReadValue);
        });
    });

    describe("When pathTemplate for the Route has a single expression with no operators", () => {
        let route: Route;

        beforeEach(() => {
            route = new Route("GET", "/items/:itemSlug", jest.fn());
        });

        test("Value of pathRegExpAndParameters.pathRegExp is correct", () => {
            expect(route.pathRegExpAndParameters.pathRegExp).toEqual(new RegExp("^/items" + parameterPattern + "/??$"));
        });

        test("Value of pathRegExpAndParameters.parameters is correct", () => {
            expect(route.pathRegExpAndParameters.parameters).toEqual(["itemSlug"]);
        });

        test("Subsequent read of pathRegExpAndParameters returns the same value", () => {
            const fistReadValue = route.pathRegExpAndParameters;

            expect(route.pathRegExpAndParameters).toEqual(fistReadValue);
        });
    });

    describe("When pathTemplate for the Route has multiple expressions with no operators", () => {
        let route: Route;

        beforeEach(() => {
            route = new Route("GET", "/items/:itemSlug/images/:imageNumber", jest.fn());
        });

        test("Value of pathRegExpAndParameters.pathRegExp is correct", () => {
            expect(route.pathRegExpAndParameters.pathRegExp).toEqual(new RegExp("^/items" + parameterPattern + "/images"  + parameterPattern + "/??$"));
        });

        test("Value of pathRegExpAndParameters.parameters is correct", () => {
            expect(route.pathRegExpAndParameters.parameters).toEqual(["itemSlug", "imageNumber"]);
        });

        test("Subsequent read of pathRegExpAndParameters returns the same value", () => {
            const fistReadValue = route.pathRegExpAndParameters;

            expect(route.pathRegExpAndParameters).toEqual(fistReadValue);
        });
    });

    describe("When pathTemplate for the Route has a single expression with `+` operator", () => {
        let route: Route;

        beforeEach(() => {
            route = new Route("GET", "/images/:imagePath+", jest.fn());
        });

        test("Value of pathRegExpAndParameters.pathRegExp is correct", () => {
            expect(route.pathRegExpAndParameters.pathRegExp).toEqual(new RegExp("^/images(" + parameterPattern + "+?)/??$"));
        });

        test("Value of pathRegExpAndParameters.parameters is correct", () => {
            expect(route.pathRegExpAndParameters.parameters).toEqual(["imagePath+"]);
        });

        test("Subsequent read of pathRegExpAndParameters returns the same value", () => {
            const fistReadValue = route.pathRegExpAndParameters;

            expect(route.pathRegExpAndParameters).toEqual(fistReadValue);
        });
    });

    describe("When pathTemplate for the Route has multiple expressions with `+` operator", () => {
        let route: Route;

        beforeEach(() => {
            route = new Route("GET", "/campaigns/:campaignPath+/images/:imagePath+", jest.fn());
        });

        test("Value of pathRegExpAndParameters.pathRegExp is correct", () => {
            expect(route.pathRegExpAndParameters.pathRegExp).toEqual(new RegExp("^/campaigns(" + parameterPattern + "+?)/images(" + parameterPattern + "+?)/??$"));
        });

        test("Value of pathRegExpAndParameters.parameters is correct", () => {
            expect(route.pathRegExpAndParameters.parameters).toEqual(["campaignPath+", "imagePath+"]);
        });

        test("Subsequent read of pathRegExpAndParameters returns the same value", () => {
            const fistReadValue = route.pathRegExpAndParameters;

            expect(route.pathRegExpAndParameters).toEqual(fistReadValue);
        });
    });

    describe("When pathTemplate for the Route has a literal occurring after the last expression", () => {
        let route: Route;

        beforeEach(() => {
            route = new Route("GET", "/items/:itemSlug/images/:imageNumber/metadata", jest.fn());
        });

        test("Value of pathRegExpAndParameters.pathRegExp is correct", () => {
            expect(route.pathRegExpAndParameters.pathRegExp).toEqual(new RegExp("^/items" + parameterPattern + "/images"  + parameterPattern + "/metadata/??$"));
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
