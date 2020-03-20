import { HttpRequestHandler, Operation } from "../http-request-handler";

import { createServer as createHttp2Server, Http2Server } from "http2";

import { URL } from "url";

import { HttpCheck } from "@distributejs/http-check";

describe("Class HttpRequestHandler", () => {
    describe("Provided a server that is an instance of Http2Server and a HTTP/2 client", () => {
        let httpCheck: HttpCheck;

        let server: Http2Server;

        beforeAll(async() => {
            server = createHttp2Server({
            });

            httpCheck = new HttpCheck(server);

            await httpCheck.start();
        });

        afterAll(async() => {
            await httpCheck.end();
        });

        describe("On request with method and URI matching a route with no expressions in pathTemplate", () => {
            let httpRequestHandler: HttpRequestHandler;

            let operations: Operation[];

            let capturedPathArgs: Map<string, string>;

            let capturedUrl: URL;

            beforeEach(() => {
                operations = [
                    {
                        method: "GET",
                        path: "/items",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            capturedPathArgs = context.pathArgs;

                            capturedUrl = context.url;

                            response.end();
                        }),
                    },
                    {
                        method: "POST",
                        path: "/items",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            capturedPathArgs = context.pathArgs;

                            capturedUrl = context.url;

                            response.end();
                        }),
                    },
                ];

                httpRequestHandler = new HttpRequestHandler(operations);

                server.on("request", (request, response) => {
                    httpRequestHandler.handleRequest(request, response);
                });
            });

            afterEach(() => {
                server.removeAllListeners("request");
            });

            test("Calls fulfil() function only for the corresponding operation", async() => {
                await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items",
                });

                expect(operations[0].fulfil).toHaveBeenCalled();

                expect(operations[1].fulfil).not.toHaveBeenCalled();
            });

            test("Calls the same fulfil() function if the request is repeated", async() => {
                await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items",
                });

                expect(operations[0].fulfil).toHaveBeenCalledTimes(1);

                await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items",
                });

                expect(operations[0].fulfil).toHaveBeenCalledTimes(2);
            });

            test("Passes the request URL to the fulfil function", async() => {
                await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items",
                });

                expect(capturedUrl).toBeInstanceOf(URL);

                expect(capturedUrl).toHaveProperty("pathname", "/items");
            });

            test("Passes an empty map of request URI arguments to the fulfil() function", async() => {
                await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items",
                });

                expect(capturedPathArgs).toEqual(new Map());
            });
        });

        describe("On request with method and URI matching a route with a single expression in pathTemplate", () => {
            let httpRequestHandler: HttpRequestHandler;

            let operations: Operation[];

            let capturedPathArgs: Map<string, string>;

            let capturedUrl: URL;

            beforeEach(() => {
                operations = [
                    {
                        method: "DELETE",
                        path: "/items/{itemSlug}",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            capturedPathArgs = context.pathArgs;

                            capturedUrl = context.url;

                            response.end();
                        }),
                    },
                    {
                        method: "GET",
                        path: "/items/{itemSlug}",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            capturedPathArgs = context.pathArgs;

                            capturedUrl = context.url;

                            response.end();
                        }),
                    },
                    {
                        method: "PATCH",
                        path: "/items/{itemSlug}",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            capturedPathArgs = context.pathArgs;

                            capturedUrl = context.url;

                            response.end();
                        }),
                    },
                    {
                        method: "PUT",
                        path: "/items/{itemSlug}",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            capturedPathArgs = context.pathArgs;

                            capturedUrl = context.url;

                            response.end();
                        }),
                    },
                ];

                httpRequestHandler = new HttpRequestHandler(operations);

                server.on("request", (request, response) => {
                    httpRequestHandler.handleRequest(request, response);
                });
            });

            afterEach(() => {
                server.removeAllListeners("request");

                capturedPathArgs = undefined;
            });

            test("Calls fulfil() function only for the corresponding operation", async() => {
                await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items/orange",
                });

                expect(operations[1].fulfil).toHaveBeenCalled();

                expect(operations[0].fulfil).not.toHaveBeenCalled();

                expect(operations[2].fulfil).not.toHaveBeenCalled();

                expect(operations[3].fulfil).not.toHaveBeenCalled();
            });

            test("Calls the same fulfil() function if the request is repeated", async() => {
                await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items/apples-pack-of-4",
                });

                expect(operations[1].fulfil).toHaveBeenCalledTimes(1);

                await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items/apples-pack-of-4",
                });

                expect(operations[1].fulfil).toHaveBeenCalledTimes(2);
            });

            test("Passes the request URL to the fulfil function", async() => {
                await httpCheck.send({
                    ":method": "PUT",
                    ":path": "/items/apples-pack-of-4",
                });

                expect(capturedUrl).toBeInstanceOf(URL);

                expect(capturedUrl).toHaveProperty("pathname", "/items/apples-pack-of-4");
            });

            test("Passes arguments found in the request URI to the fulfil() function", async() => {
                await httpCheck.send({
                    ":method": "PUT",
                    ":path": "/items/apples-pack-of-4",
                });

                expect(capturedPathArgs).toEqual(new Map([
                    ["itemSlug", "apples-pack-of-4"],
                ]));
            });
        });

        describe("On request with method and URI matching a route with multiple expressions in pathTemplate", () => {
            let httpRequestHandler: HttpRequestHandler;

            let operations: Operation[];

            let capturedPathArgs: Map<string, string>;

            let capturedUrl: URL;

            beforeEach(() => {
                operations = [
                    {
                        method: "DELETE",
                        path: "/items/{itemSlug}/images/{imageNumber}",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            capturedPathArgs = context.pathArgs;

                            capturedUrl = context.url;

                            response.end();
                        }),
                    },
                    {
                        method: "GET",
                        path: "/items/{itemSlug}/images/{imageNumber}",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            capturedPathArgs = context.pathArgs;

                            capturedUrl = context.url;

                            response.end();
                        }),
                    },
                    {
                        method: "PATCH",
                        path: "/items/{itemSlug}/images/{imageNumber}",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            capturedPathArgs = context.pathArgs;

                            capturedUrl = context.url;

                            response.end();
                        }),
                    },
                    {
                        method: "PUT",
                        path: "/items/{itemSlug}/images/{imageNumber}",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            capturedPathArgs = context.pathArgs;

                            capturedUrl = context.url;

                            response.end();
                        }),
                    },
                ];

                httpRequestHandler = new HttpRequestHandler(operations);

                server.on("request", (request, response) => {
                    httpRequestHandler.handleRequest(request, response);
                });
            });

            afterEach(() => {
                server.removeAllListeners("request");

                capturedPathArgs = undefined;

                capturedUrl = undefined;
            });

            test("Calls fulfil() function only for the corresponding operation", async() => {
                await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items/pear/images/2",
                });

                expect(operations[1].fulfil).toHaveBeenCalled();

                expect(operations[0].fulfil).not.toHaveBeenCalled();

                expect(operations[2].fulfil).not.toHaveBeenCalled();

                expect(operations[3].fulfil).not.toHaveBeenCalled();
            });

            test("Calls the same fulfil() function if the request is repeated", async() => {
                await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items/apples-pack-of-4/images/2",
                });

                expect(operations[1].fulfil).toHaveBeenCalledTimes(1);

                await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items/apples-pack-of-4/images/2",
                });

                expect(operations[1].fulfil).toHaveBeenCalledTimes(2);
            });

            test("Passes the request URL to the fulfil function", async() => {
                await httpCheck.send({
                    ":method": "PUT",
                    ":path": "/items/apples-pack-of-4/images/2",
                });

                expect(capturedUrl).toBeInstanceOf(URL);

                expect(capturedUrl).toHaveProperty("pathname", "/items/apples-pack-of-4/images/2");
            });

            test("Passes arguments found in the request URI to the fulfil() function", async() => {
                await httpCheck.send({
                    ":method": "PUT",
                    ":path": "/items/apples-pack-of-4/images/2",
                });

                expect(capturedPathArgs).toEqual(new Map([
                    ["itemSlug", "apples-pack-of-4"],
                    ["imageNumber", "2"],
                ]));
            });
        });

        describe("On request with a method and a URI, where the method does not match any routes with that URI", () => {
            let httpRequestHandler: HttpRequestHandler;

            beforeEach(() => {
                const operations: Operation[] = [
                    {
                        method: "GET",
                        path: "/items",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.end();
                        }),
                    },
                    {
                        method: "POST",
                        path: "/items",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.end();
                        }),
                    },
                ];

                httpRequestHandler = new HttpRequestHandler(operations);

                server.on("request", (request, response) => {
                    httpRequestHandler.handleRequest(request, response);
                });
            });

            afterEach(() => {
                server.removeAllListeners("request");
            });

            test("Sends a response with status code 405 Method Not Allowed and an Allow header containing allowed methods for the resource", async() => {
                const response = await httpCheck.send({
                    ":method": "PUT",
                    ":path": "/items",
                });

                expect(response.headers[":status"]).toEqual(405);

                expect(response.headers).toHaveProperty("allow", "GET, HEAD, OPTIONS, POST");
            });
        });

        describe("On request with a method and a URI, where the URI does not match any routes", () => {
            let httpRequestHandler: HttpRequestHandler;

            beforeEach(() => {
                const operations: Operation[] = [
                    {
                        method: "GET",
                        path: "/items",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.end();
                        }),
                    },
                    {
                        method: "POST",
                        path: "/items",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.end();
                        }),
                    },
                ];

                httpRequestHandler = new HttpRequestHandler(operations);

                server.on("request", (request, response) => {
                    httpRequestHandler.handleRequest(request, response);
                });
            });

            afterEach(() => {
                server.removeAllListeners("request");
            });

            test("Sends a response with status code 404 Not Found", async() => {
                const response = await httpCheck.send({
                    ":method": "GET",
                    ":path": "/favorites/",
                });

                expect(response.headers[":status"]).toEqual(404);
            });
        });

        describe("On request with method and URI matching a route with CORS handling enabled, classed as a simple CORS request", () => {
            let httpRequestHandler: HttpRequestHandler;

            beforeEach(() => {
                const operations: Operation[] = [
                    {
                        cors: {
                            enabled: true,
                            origins: ["*"],
                        },
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.statusCode = 200;

                            response.end();
                        }),
                        method: "GET",
                        path: "/items",
                    },
                    {
                        cors: {
                            enabled: true,
                            origins: ["https://developers.distributejs.org", "https://sandbox.distributejs.org"],
                        },
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.statusCode = 201;

                            response.end();
                        }),
                        method: "POST",
                        path: "/items",
                    },
                ];

                httpRequestHandler = new HttpRequestHandler(operations);

                server.on("request", (request, response) => {
                    httpRequestHandler.handleRequest(request, response);
                });
            });

            afterEach(() => {
                server.removeAllListeners("request");
            });

            test("Sends a response with status code indicating success e.g. 200 OK, 201 Created", async() => {
                expect((await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items",
                    "origin": "https://developers.distributejs.org",
                }))).toHaveProperty("headers.:status", 200);

                expect((await httpCheck.send({
                    ":method": "POST",
                    ":path": "/items",
                    "origin": "https://developers.distributejs.org",
                }))).toHaveProperty("headers.:status", 201);
            });

            test("Sends a response with Access-Control-Allow-Origin header set to `*`, if the matched route `cors.origin` value is `*`", async() => {
                expect((await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items",
                    "origin": "https://developers.distributejs.org",
                }))).toHaveProperty("headers.access-control-allow-origin", "*");
            });

            test("Sends a response with Access-Control-Allow-Origin header set to the value of Access-Control-Request-Origin and with a Vary header with value `Origin`, if the value of Access-Control-Request-Origin is found in `cors.origin` of the matched route", async() => {
                const response = await httpCheck.send({
                    ":method": "POST",
                    ":path": "/items",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-origin", "https://developers.distributejs.org");

                expect(response).toHaveProperty("headers.vary", "Origin");
            });

            test("Sends a response without Access-Control-Allow-Origin header, if the value of Access-Control-Request-Origin is not found in `cors.origin` of the matched route", async() => {
                expect((await httpCheck.send({
                    ":method": "POST",
                    ":path": "/items",
                    "origin": "https://unknown.distributejs.org",
                }))).not.toHaveProperty("headers.access-control-allow-origin");
            });
        });

        describe("On request with method and URI matching a route with CORS handling not enabled, classed as a simple CORS request", () => {
            let httpRequestHandler: HttpRequestHandler;

            beforeEach(() => {
                const operations: Operation[] = [
                    {
                        cors: {
                            enabled: false,
                            origins: ["*"],
                        },
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.statusCode = 200;

                            response.end();
                        }),
                        method: "GET",
                        path: "/items",
                    },
                    {
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.statusCode = 201;

                            response.end();
                        }),
                        method: "POST",
                        path: "/items",
                    },
                ];

                httpRequestHandler = new HttpRequestHandler(operations);

                server.on("request", (request, response) => {
                    httpRequestHandler.handleRequest(request, response);
                });
            });

            afterEach(() => {
                server.removeAllListeners("request");
            });

            test("Sends a response without Access-Control-Allow-Origin header", async() => {
                expect((await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items",
                    "origin": "https://unknown.distributejs.org",
                }))).not.toHaveProperty("headers.access-control-allow-origin");

                expect((await httpCheck.send({
                    ":method": "POST",
                    ":path": "/items",
                    "origin": "https://unknown.distributejs.org",
                }))).not.toHaveProperty("headers.access-control-allow-origin");
            });
        });

        describe("On request with OPTIONS method and a URI which matches at least one route, not classed as a preflight request", () => {
            let httpRequestHandler: HttpRequestHandler;

            beforeEach(() => {
                const operations: Operation[] = [
                    {
                        cors: {
                            enabled: true,
                            origins: ["*"],
                        },
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.statusCode = 200;

                            response.end();
                        }),
                        method: "GET",
                        path: "/items",
                    },
                    {
                        cors: {
                            enabled: true,
                            origins: ["https://developers.distributejs.org", "https://sandbox.distributejs.org"],
                        },
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.statusCode = 201;

                            response.end();
                        }),
                        method: "POST",
                        path: "/items",
                    },
                ];

                httpRequestHandler = new HttpRequestHandler(operations);

                server.on("request", (request, response) => {
                    httpRequestHandler.handleRequest(request, response);
                });
            });

            afterEach(() => {
                server.removeAllListeners("request");
            });

            test("Sends a response with status 204 and a Allow header listing allowed methods, but no Access-Control-Allow-Origin header", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).toHaveProperty("headers.allow", "GET, HEAD, OPTIONS, POST");

                expect(response).not.toHaveProperty("Access-Control-Allow-Origin");
            });
        });

        describe("On request with OPTIONS method and a URI, where the URI does not match any routes, not classed as a preflight request", () => {
            let httpRequestHandler: HttpRequestHandler;

            beforeEach(() => {
                const operations: Operation[] = [
                    {
                        cors: {
                            enabled: true,
                            origins: ["*"],
                        },
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.statusCode = 200;

                            response.end();
                        }),
                        method: "GET",
                        path: "/items",
                    },
                    {
                        cors: {
                            enabled: true,
                            origins: ["https://developers.distributejs.org", "https://sandbox.distributejs.org"],
                        },
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.statusCode = 201;

                            response.end();
                        }),
                        method: "POST",
                        path: "/items",
                    },
                ];

                httpRequestHandler = new HttpRequestHandler(operations);

                server.on("request", (request, response) => {
                    httpRequestHandler.handleRequest(request, response);
                });
            });

            afterEach(() => {
                server.removeAllListeners("request");
            });

            test("Sends a response with status code 404 Not Found", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/favorites/",
                });

                expect(response.headers[":status"]).toEqual(404);
            });
        });

        describe("On request with OPTIONS method and a URI which matches at least one route with CORS handling enabled, classed as a preflight request", () => {

        });

        describe("On request with OPTIONS method and a URI, where the URI does not match any routes any routes CORS handling enabled, classed as preflight request", () => {

        });

        describe("On request matching a route which has an uncaught error in its fulfil function", () => {
            let httpRequestHandler: HttpRequestHandler;

            beforeEach(() => {
                const operations: Operation[] = [
                    {
                        method: "GET",
                        path: "/items",
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: async(): Promise<void> => {
                            throw new Error("Test error");
                        },
                    },
                ];

                httpRequestHandler = new HttpRequestHandler(operations);

                server.on("request", (request, response) => {
                    httpRequestHandler.handleRequest(request, response);
                });
            });

            afterEach(() => {
                server.removeAllListeners("request");
            });

            test("Sends a response with status code 500 Internal Server Error", async() => {
                const response = await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items",
                });

                expect(response.headers[":status"]).toEqual(500);
            });
        });
    });
});
