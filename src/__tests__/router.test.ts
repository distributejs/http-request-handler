import { Route } from "../route";

import { Router } from "../router";

describe("Class Router", () => {
    const routes: Route[] = [
        new Route("GET", "/items", jest.fn()),
        new Route("POST", "/items", jest.fn()),
        new Route("DELETE", "/items/{itemSlug}", jest.fn()),
        new Route("GET", "/items/{itemSlug}", jest.fn()),
        new Route("PATCH", "/items/{itemSlug}", jest.fn()),
        new Route("PUT", "/items/{itemSlug}", jest.fn()),
        new Route("GET", "/items/{itemSlug}/images", jest.fn()),
        new Route("POST", "/items/{itemSlug}/images", jest.fn()),
        new Route("DELETE", "/items/{itemSlug}/images/{imageNumber}", jest.fn()),
        new Route("GET", "/items/{itemSlug}/images/{imageNumber}", jest.fn()),
        new Route("PATCH", "/items/{itemSlug}/images/{imageNumber}", jest.fn()),
        new Route("PUT", "/items/{itemSlug}/images/{imageNumber}", jest.fn()),
        new Route("GET", "/orders", jest.fn()),
        new Route("POST", "/orders", jest.fn()),
        new Route("GET", "/orders/{orderRef}", jest.fn()),
        new Route("PATCH", "/orders/{orderRef}", jest.fn()),
        new Route("GET", "/orders/{orderRef}/items", jest.fn()),
        new Route("POST", "/orders/{orderRef}/items", jest.fn()),
        new Route("GET", "/orders/{orderRef}/items/{itemNumber}", jest.fn()),
    ];

    describe("On calling match() with method and URI matching a route with no expressions in pathTemplate", () => {
        let router: Router;

        beforeAll(() => {
            router = new Router(routes);
        });

        test("Returns a RouteMatch with correct route value", () => {
            expect(router.match("GET", "/items")).toHaveProperty("route", routes[0]);

            expect(router.match("POST", "/items")).toHaveProperty("route", routes[1]);

            expect(router.match("GET", "/orders")).toHaveProperty("route", routes[12]);

            expect(router.match("POST", "/orders")).toHaveProperty("route", routes[13]);
        });

        test("Returns a RouteMatch with correct args value", () => {
            expect(router.match("GET", "/items")).toHaveProperty("args", new Map());

            expect(router.match("POST", "/items")).toHaveProperty("args", new Map());

            expect(router.match("GET", "/orders")).toHaveProperty("args", new Map());

            expect(router.match("POST", "/orders")).toHaveProperty("args", new Map());
        });
    });

    describe("On calling match() with method and URI matching a route with a single expression in pathTemplate", () => {
        let router: Router;

        beforeAll(() => {
            router = new Router(routes);
        });

        test("Returns a RouteMatch with correct route value", () => {
            expect(router.match("DELETE", "/items/orange")).toHaveProperty("route", routes[2]);

            expect(router.match("PUT", "/items/apples-pack-of-4")).toHaveProperty("route", routes[5]);

            expect(router.match("GET", "/items/apples-pack-of-4/images")).toHaveProperty("route", routes[6]);

            expect(router.match("GET", "/orders/AC8752")).toHaveProperty("route", routes[14]);

            expect(router.match("PATCH", "/orders/AC8752")).toHaveProperty("route", routes[15]);

            expect(router.match("POST", "/orders/AC8752/items")).toHaveProperty("route", routes[17]);
        });

        test("Returns a RouteMatch with correct args value", () => {
            expect(router.match("DELETE", "/items/orange")).toHaveProperty("args", new Map([
                ["itemSlug", "orange"],
            ]));

            expect(router.match("PUT", "/items/apples-pack-of-4")).toHaveProperty("args", new Map([
                ["itemSlug", "apples-pack-of-4"],
            ]));

            expect(router.match("GET", "/items/apples-pack-of-4/images")).toHaveProperty("args", new Map([
                ["itemSlug", "apples-pack-of-4"],
            ]));

            expect(router.match("GET", "/orders/AC8752")).toHaveProperty("args", new Map([
                ["orderRef", "AC8752"],
            ]));

            expect(router.match("PATCH", "/orders/AC8752")).toHaveProperty("args", new Map([
                ["orderRef", "AC8752"],
            ]));

            expect(router.match("POST", "/orders/AC8752/items")).toHaveProperty("args", new Map([
                ["orderRef", "AC8752"],
            ]));
        });
    });

    describe("On calling match() with method and URI matching a route with multiple expressions in pathTemplate", () => {
        let router: Router;

        beforeAll(() => {
            router = new Router(routes);
        });

        test("Returns a RouteMatch with correct route value", () => {
            expect(router.match("GET", "/items/apples-pack-of-4/images/2")).toHaveProperty("route", routes[9]);

            expect(router.match("PUT", "/items/pear/images/2")).toHaveProperty("route", routes[11]);

            expect(router.match("GET", "/orders/AC8752/items/3")).toHaveProperty("route", routes[18]);
        });

        test("Returns a RouteMatch with correct args value", () => {
            expect(router.match("GET", "/items/apples-pack-of-4/images/2")).toHaveProperty("args", new Map([
                ["itemSlug", "apples-pack-of-4"],
                ["imageNumber", "2"],
            ]));

            expect(router.match("PUT", "/items/pear/images/3")).toHaveProperty("args", new Map([
                ["itemSlug", "pear"],
                ["imageNumber", "3"],
            ]));

            expect(router.match("GET", "/orders/AC8752/items/3")).toHaveProperty("args", new Map([
                ["orderRef", "AC8752"],
                ["itemNumber", "3"],
            ]));
        });
    });

    describe("On calling match() with method and URI matching more than route", () => {
        test("Returns a RouteMatch with route value for the most recently defined of the matching routes", () => {
            const overridingRoutes: Route[] = [
                new Route("GET", "/items/{itemSlug}", jest.fn()),
                new Route("POST", "/items/{itemSlug}/images", jest.fn()),
            ];

            const router = new Router([].concat(routes, overridingRoutes));

            expect(router.match("GET", "/items/apples-pack-of-4")).toHaveProperty("route", overridingRoutes[0]);

            expect(router.match("GET", "/items/apples-pack-of-4")).not.toHaveProperty("route", routes[3]);

            expect(router.match("POST", "/items/apples-pack-of-4/images")).toHaveProperty("route", overridingRoutes[1]);

            expect(router.match("POST", "/items/apples-pack-of-4/images")).not.toHaveProperty("route", routes[7]);
        });
    })

    describe("On calling match() with a URI which does not match any routes", () => {
        test("Returns null", () => {
            const router = new Router(routes);

            expect(router.match("GET", "/brands")).toBeNull();

            expect(router.match("GET", "/posts")).toBeNull();
        });
    });

    describe("On calling match() with a method and a URI, where the method does not match any routes with that URI", () => {
        test("Returns null", () => {
            const router = new Router(routes);

            expect(router.match("POST", "/items/{itemSlug}")).toBeNull();

            expect(router.match("DELETE", "/orders/{orderRef}")).toBeNull();
        });
    });
});
