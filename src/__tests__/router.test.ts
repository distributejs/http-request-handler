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
        test("Returns a RouteMatch with correct route.targetFn value", () => {
            const router = new Router(routes);

            expect(router.match("GET", "/items")).toHaveProperty("route.targetFn", routes[0].targetFn);

            expect(router.match("POST", "/items")).toHaveProperty("route.targetFn", routes[1].targetFn);

            expect(router.match("GET", "/orders")).toHaveProperty("route.targetFn", routes[12].targetFn);

            expect(router.match("POST", "/orders")).toHaveProperty("route.targetFn", routes[13].targetFn);
        });
    });

    describe("On calling match() with method and URI matching a route with a single expression in pathTemplate", () => {
        test("Returns a RouteMatch with correct route value", () => {
            const router = new Router(routes);

            expect(router.match("DELETE", "/items/orange")).toHaveProperty("route.targetFn", routes[2].targetFn);

            expect(router.match("PUT", "/items/apples-pack-of-4")).toHaveProperty("route.targetFn", routes[5].targetFn);

            expect(router.match("GET", "/items/apples-pack-of-4/images")).toHaveProperty("route.targetFn", routes[6].targetFn);

            expect(router.match("GET", "/orders/AC8752")).toHaveProperty("route.targetFn", routes[14].targetFn);

            expect(router.match("PATCH", "/orders/AC8752")).toHaveProperty("route.targetFn", routes[15].targetFn);

            expect(router.match("POST", "/orders/AC8752/items")).toHaveProperty("route.targetFn", routes[17].targetFn);
        });
    });

    describe("On calling match() with method and URI matching a route with multiple expressions in pathTemplate", () => {
        test("Returns a RouteMatch with correct route value", () => {
            const router = new Router(routes);

            expect(router.match("GET", "/items/apples-pack-of-4/images/2")).toHaveProperty("route.targetFn", routes[9].targetFn);

            expect(router.match("PUT", "/items/pear/images/2")).toHaveProperty("route.targetFn", routes[11].targetFn);

            expect(router.match("GET", "/orders/AC8752/items/3")).toHaveProperty("route.targetFn", routes[18].targetFn);
        });
    });

    describe("On calling match() with method and URI matching more than route", () => {
        test("Returns a RouteMatch for the most recently defined of the matching routes", () => {
            const overridingRoutes: Route[] = [
                new Route("GET", "/items/{itemSlug}", jest.fn()),
                new Route("POST", "/items/{itemSlug}/images", jest.fn()),
            ];

            const router = new Router([].concat(routes, overridingRoutes));

            expect(router.match("GET", "/items/apples-pack-of-4")).toHaveProperty("route.targetFn", overridingRoutes[0].targetFn);

            expect(router.match("GET", "/items/apples-pack-of-4")).not.toHaveProperty("route.targetFn", routes[3].targetFn);

            expect(router.match("POST", "/items/apples-pack-of-4/images")).toHaveProperty("route.targetFn", overridingRoutes[1].targetFn);

            expect(router.match("POST", "/items/apples-pack-of-4/images")).not.toHaveProperty("route.targetFn", routes[7].targetFn);
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
    })
});
