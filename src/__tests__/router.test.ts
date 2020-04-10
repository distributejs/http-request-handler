import { Route } from "../route";

import { Router } from "../router";

describe("Class Router", () => {
    const routes: Route[] = [
        new Route("GET", "/items", jest.fn()),
        new Route("POST", "/items", jest.fn()),
        new Route("DELETE", "/items/:itemSlug", jest.fn()),
        new Route("GET", "/items/:itemSlug", jest.fn()),
        new Route("PATCH", "/items/:itemSlug", jest.fn()),
        new Route("PUT", "/items/:itemSlug", jest.fn()),
        new Route("GET", "/items/:itemSlug/images", jest.fn()),
        new Route("POST", "/items/:itemSlug/images", jest.fn()),
        new Route("DELETE", "/items/:itemSlug/images/:imageNumber", jest.fn()),
        new Route("GET", "/items/:itemSlug/images/:imageNumber", jest.fn()),
        new Route("PATCH", "/items/:itemSlug/images/:imageNumber", jest.fn()),
        new Route("PUT", "/items/:itemSlug/images/:imageNumber", jest.fn()),
        new Route("GET", "/orders", jest.fn()),
        new Route("POST", "/orders", jest.fn()),
        new Route("GET", "/orders/:orderRef", jest.fn()),
        new Route("PATCH", "/orders/:orderRef", jest.fn()),
        new Route("GET", "/orders/:orderRef/items", jest.fn()),
        new Route("POST", "/orders/:orderRef/items", jest.fn()),
        new Route("GET", "/orders/:orderRef/items/:itemNumber", jest.fn()),
        new Route("DELETE", "/images/:imagePath+", jest.fn()),
        new Route("GET", "/images/:imagePath+", jest.fn()),
        new Route("PUT", "/images/:imagePath+", jest.fn()),
        new Route("DELETE", "/campaigns/:campaignPath+/images/:imagePath+", jest.fn()),
        new Route("GET", "/campaigns/:campaignPath+/images/:imagePath+", jest.fn()),
        new Route("PUT", "/campaigns/:campaignPath+/images/:imagePath+", jest.fn()),
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

        test("Returns a RouteMatch with correct route value, regardless of trailing slashes in URI", () => {
            expect(router.match("GET", "/items/")).toHaveProperty("route", routes[0]);

            expect(router.match("POST", "/items/")).toHaveProperty("route", routes[1]);

            expect(router.match("GET", "/orders/")).toHaveProperty("route", routes[12]);

            expect(router.match("POST", "/orders/")).toHaveProperty("route", routes[13]);
        });

        test("Returns a RouteMatch with correct args value, regardless of trailing slashes in URI", () => {
            expect(router.match("GET", "/items/")).toHaveProperty("args", new Map());

            expect(router.match("POST", "/items/")).toHaveProperty("args", new Map());

            expect(router.match("GET", "/orders/")).toHaveProperty("args", new Map());

            expect(router.match("POST", "/orders/")).toHaveProperty("args", new Map());
        });
    });

    describe("On calling match() with method and URI matching a route with a single expression with no operators in pathTemplate", () => {
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

        test("Returns a RouteMatch with correct route value, regardless of trailing slashes in URI", () => {
            expect(router.match("DELETE", "/items/orange/")).toHaveProperty("route", routes[2]);

            expect(router.match("PUT", "/items/apples-pack-of-4/")).toHaveProperty("route", routes[5]);

            expect(router.match("GET", "/items/apples-pack-of-4/images/")).toHaveProperty("route", routes[6]);

            expect(router.match("GET", "/orders/AC8752/")).toHaveProperty("route", routes[14]);

            expect(router.match("PATCH", "/orders/AC8752/")).toHaveProperty("route", routes[15]);

            expect(router.match("POST", "/orders/AC8752/items/")).toHaveProperty("route", routes[17]);
        });

        test("Returns a RouteMatch with correct args value, regardless of trailing slashes in URI", () => {
            expect(router.match("DELETE", "/items/orange/")).toHaveProperty("args", new Map([
                ["itemSlug", "orange"],
            ]));

            expect(router.match("PUT", "/items/apples-pack-of-4/")).toHaveProperty("args", new Map([
                ["itemSlug", "apples-pack-of-4"],
            ]));

            expect(router.match("GET", "/items/apples-pack-of-4/images/")).toHaveProperty("args", new Map([
                ["itemSlug", "apples-pack-of-4"],
            ]));

            expect(router.match("GET", "/orders/AC8752/")).toHaveProperty("args", new Map([
                ["orderRef", "AC8752"],
            ]));

            expect(router.match("PATCH", "/orders/AC8752/")).toHaveProperty("args", new Map([
                ["orderRef", "AC8752"],
            ]));

            expect(router.match("POST", "/orders/AC8752/items/")).toHaveProperty("args", new Map([
                ["orderRef", "AC8752"],
            ]));
        });
    });

    describe("On calling match() with method and URI matching a route with multiple expressions with no operators in pathTemplate", () => {
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

        test("Returns a RouteMatch with correct route value, regardless of trailing slashes in URI", () => {
            expect(router.match("GET", "/items/apples-pack-of-4/images/2/")).toHaveProperty("route", routes[9]);

            expect(router.match("PUT", "/items/pear/images/2/")).toHaveProperty("route", routes[11]);

            expect(router.match("GET", "/orders/AC8752/items/3/")).toHaveProperty("route", routes[18]);
        });

        test("Returns a RouteMatch with correct args value, regardless of trailing slashes in URI", () => {
            expect(router.match("GET", "/items/apples-pack-of-4/images/2/")).toHaveProperty("args", new Map([
                ["itemSlug", "apples-pack-of-4"],
                ["imageNumber", "2"],
            ]));

            expect(router.match("PUT", "/items/pear/images/3/")).toHaveProperty("args", new Map([
                ["itemSlug", "pear"],
                ["imageNumber", "3"],
            ]));

            expect(router.match("GET", "/orders/AC8752/items/3/")).toHaveProperty("args", new Map([
                ["orderRef", "AC8752"],
                ["itemNumber", "3"],
            ]));
        });
    });

    describe("On calling match() with method and URI matching a route with a single expression with `+` operator in pathTemplate", () => {
        let router: Router;

        beforeAll(() => {
            router = new Router(routes);
        });

        test("Returns a RouteMatch with correct route value", () => {
            expect(router.match("PUT", "/images/2020/01/20/image.jpg")).toHaveProperty("route", routes[21]);
        });

        test("Returns a RouteMatch with correct args value", () => {
            expect(router.match("PUT", "/images/2020/01/20/image.jpg")).toHaveProperty("args", new Map([
                ["imagePath", ["2020", "01", "20", "image.jpg"]],
            ]));
        });

        test("Returns a RouteMatch with correct route value, regardless of trailing slashes in URI", () => {
            expect(router.match("GET", "/images/2020/01/20/")).toHaveProperty("route", routes[20]);
        });

        test("Returns a RouteMatch with correct args value, regardless of trailing slashes in URI", () => {
            expect(router.match("GET", "/images/2020/01/20/")).toHaveProperty("args", new Map([
                ["imagePath", ["2020", "01", "20"]],
            ]));
        });
    });

    describe("On calling match() with method and URI matching a route with a multiple expressions with `+` operator in pathTemplate", () => {
        let router: Router;

        beforeAll(() => {
            router = new Router(routes);
        });

        test("Returns a RouteMatch with correct route value", () => {
            expect(router.match("PUT", "/campaigns/2020/winter/images/2020/01/20/image.jpg")).toHaveProperty("route", routes[24]);
        });

        test("Returns a RouteMatch with correct args value", () => {
            expect(router.match("PUT", "/campaigns/2020/winter/images/2020/01/20/image.jpg")).toHaveProperty("args", new Map([
                ["campaignPath", ["2020", "winter"]],
                ["imagePath", ["2020", "01", "20", "image.jpg"]],
            ]));
        });

        test("Returns a RouteMatch with correct route value, regardless of trailing slashes in URI", () => {
            expect(router.match("GET", "/campaigns/2020/winter/images/2020/01/20/")).toHaveProperty("route", routes[23]);
        });

        test("Returns a RouteMatch with correct args value, regardless of trailing slashes in URI", () => {
            expect(router.match("GET", "/campaigns/2020/winter/images/2020/01/20/")).toHaveProperty("args", new Map([
                ["campaignPath", ["2020", "winter"]],
                ["imagePath", ["2020", "01", "20"]],
            ]));
        });
    });

    describe("On calling match() with method and URI matching more than route", () => {
        test("Returns a RouteMatch with route value for the most recently defined of the matching routes", () => {
            const overridingRoutes: Route[] = [
                new Route("GET", "/items/:itemSlug", jest.fn()),
                new Route("POST", "/items/:itemSlug/images", jest.fn()),
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

            expect(router.match("POST", "/items/orange")).toBeNull();

            expect(router.match("DELETE", "/orders/AC8752")).toBeNull();
        });
    });

    describe("On calling listMethodsForPath() with a URI matching at least one route", () => {
        let router: Router;

        beforeAll(() => {
            router = new Router(routes);
        });

        test("Returns an alphabetically sorted list of methods of routes matching the request URI", () => {
            expect(router.listMethodsForPath("/items")).toEqual(["GET", "HEAD", "OPTIONS", "POST"]);

            expect(router.listMethodsForPath("/orders")).toEqual(["GET", "HEAD", "OPTIONS", "POST"]);

            expect(router.listMethodsForPath("/items/orange")).toEqual(["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "PUT"]);

            expect(router.listMethodsForPath("/items/apples-pack-of-4")).toEqual(["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "PUT"]);

            expect(router.listMethodsForPath("/items/apples-pack-of-4/images")).toEqual(["GET", "HEAD", "OPTIONS", "POST"]);

            expect(router.listMethodsForPath("/orders/AC8752")).toEqual(["GET", "HEAD", "OPTIONS", "PATCH"]);

            expect(router.listMethodsForPath("/orders/AC8752/items")).toEqual(["GET", "HEAD", "OPTIONS", "POST"]);

            expect(router.listMethodsForPath("/items/apples-pack-of-4/images/2")).toEqual(["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "PUT"]);

            expect(router.listMethodsForPath("/items/pear/images/2")).toEqual(["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "PUT"]);

            expect(router.listMethodsForPath("/orders/AC8752/items/3")).toEqual(["GET", "HEAD", "OPTIONS"]);
        });
    });

    describe("On calling listMethodsForPath() with a URI not matching any routes", () => {
        test("Returns null", () => {
            const router = new Router(routes);

            expect(router.listMethodsForPath("/brands")).toBeNull();

            expect(router.listMethodsForPath("/posts")).toBeNull();
        });
    });
});
