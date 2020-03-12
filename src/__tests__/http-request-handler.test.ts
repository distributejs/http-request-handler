import { HttpRequestHandler, Operation } from "../http-request-handler";

import { createServer as createHttp2Server, Http2Server } from "http2";

import { HttpCheck } from "@distributejs/http-check";
import { URL } from "url";

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

        describe("On request with OPTIONS method, a URI matching at least one route, and no Access-Control headers", () => {
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

            test("Sends a response with status code 200 OK and an Allow header containing allowed methods for the resource", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                });

                expect(response.headers[":status"]).toEqual(200);

                expect(response.headers).toHaveProperty("allow", "GET, HEAD, OPTIONS, POST");
            });
        });

        describe("On request with OPTIONS method, a URI matching no routes, and no Access-Control headers", () => {
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

            test("Sends a response with status code 404 Not Found and no allow header", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/orders",
                });

                expect(response.headers[":status"]).toEqual(404);

                expect(response.headers).not.toHaveProperty("allow");
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
