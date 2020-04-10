import { HttpRequestHandler, Operation } from "../http-request-handler";

import { createServer as createHttp2Server,  Http2Server, Http2ServerResponse } from "http2";

import { URL } from "url";

import { HttpCheck } from "@distributejs/http-check";
import { ServerResponse } from "http";

describe("Class HttpRequestHandler", () => {
    describe("Provided a server that is an instance of Http2Server and a HTTP/2 client", () => {
        let httpCheck: HttpCheck;

        let server: Http2Server;

        beforeAll(async() => {
            server = createHttp2Server();

            httpCheck = new HttpCheck(server);

            await httpCheck.start();
        });

        afterAll(async() => {
            await httpCheck.end();
        });

        describe("On request with method and URI matching a route with no expressions in pathTemplate", () => {
            let httpRequestHandler: HttpRequestHandler;

            let operations: Operation[];

            let capturedPathArgs: Map<string, string | string[]>;

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

            let capturedPathArgs: Map<string, string | string[]>;

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

            let capturedPathArgs: Map<string, string | string[]>;

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

        describe("On request with a method and a URI, where the method is not implemented by the request handler", () => {
            let httpRequestHandler: HttpRequestHandler;

            beforeEach(() => {
                const operations: Operation[] = [
                    {
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.end();
                        }),
                        method: "GET",
                        path: "/items",
                    },
                    {
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
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

            test("Sends a response with status code 501 Not Implemented", async() => {
                const response = await httpCheck.send({
                    ":method": "TRACE",
                    ":path": "/items",
                });

                expect(response.headers[":status"]).toEqual(501);
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

        describe("On request with HEAD method, where a route with the same URI and GET method exists", () => {
            let httpRequestHandler: HttpRequestHandler;

            let lastBytesWritten: number;

            beforeEach(() => {
                const operations: Operation[] = [
                    {
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: async(context, request, response): Promise<void> => {
                            response.setHeader("content-length", 12);

                            response.end(JSON.stringify({
                                "items": [],
                            }));
                        },
                        method: "GET",
                        path: "/items",
                    },
                    {
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: async(context, request, response): Promise<void> => {
                            response.end();
                        },
                        method: "POST",
                        path: "/items",
                    },
                ];

                httpRequestHandler = new HttpRequestHandler(operations);

                server.on("request", (request, response: Http2ServerResponse) => {
                    httpRequestHandler.handleRequest(request, response);

                    lastBytesWritten = response.stream.writableLength;
                });
            });

            afterEach(() => {
                server.removeAllListeners("request");

                lastBytesWritten = undefined;
            });

            test("Sends a response with status code 200", async() => {
                const response = await httpCheck.send({
                    ":method": "HEAD",
                    ":path": "/items",
                });

                expect(response.headers).toHaveProperty(":status", 200);
            });

            test("Sends a response with headers from corresponding operation with GET method", async() => {
                const response = await httpCheck.send({
                    ":method": "HEAD",
                    ":path": "/items",
                });

                expect(response.headers).toHaveProperty("content-length", "12");
            });

            test("Sends a response with headers only", async() => {
                await httpCheck.send({
                    ":method": "HEAD",
                    ":path": "/items",
                });

                const bytesWrittenOnHead = lastBytesWritten;

                await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items",
                });

                const bytesWrittenOnGet = lastBytesWritten;

                expect(bytesWrittenOnGet - bytesWrittenOnHead).toEqual(12);
            });
        });

        describe("On request with HEAD method, where a route with the same URI and GET method does not exist", () => {
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
                    ":method": "HEAD",
                    ":path": "/favorites/",
                });

                expect(response.headers[":status"]).toEqual(404);
            });
        });

        describe("On request with method and URI matching a route with CORS handling enabled with credentials not supported, classed as a simple CORS request", () => {
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
                            credentialsSupported: false,
                            enabled: true,
                            exposedHeaders: ["x-CUSTOM-header", "Content-Length"],
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
                    {
                        cors: {
                            enabled: true,
                            exposedHeaders: ["*"],
                            origins: ["*", "https://developers.distributejs.org"],
                        },
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.statusCode = 200;

                            response.end();
                        }),
                        method: "GET",
                        path: "/status",
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

            test("Sends a response with Access-Control-Allow-Origin header set to `*`, if the matched route `cors.origins` value has only `*`", async() => {
                const response = await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-origin", "*");

                expect(response).not.toHaveProperty("headers.access-control-allow-credentials");
            });

            test("Sends a response with Access-Control-Allow-Origin header set to the value of Origin and a Vary header with value `Origin`, but no Access-Control-Allow-Credentials header, if the value of Origin is found in `cors.origins` of the matched route", async() => {
                const response = await httpCheck.send({
                    ":method": "POST",
                    ":path": "/items",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-origin", "https://developers.distributejs.org");

                expect(response).toHaveProperty("headers.vary", "Origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-credentials");
            });

            test("Sends a response with Access-Control-Allow-Origin header set to the value of Origin and a Vary header with value `Origin`, but no Access-Control-Allow-Credentials header, if `cors.origins` of the matched route contains both `*` and the value of Origin header", async() => {
                const response = await httpCheck.send({
                    ":method": "GET",
                    ":path": "/status",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-origin", "https://developers.distributejs.org");

                expect(response).toHaveProperty("headers.vary", "Origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-credentials");
            });

            test("Sends a response without Access-Control-Allow-Origin header, if the value of Origin is not found in `cors.origins` of the matched route", async() => {
                expect((await httpCheck.send({
                    ":method": "POST",
                    ":path": "/items",
                    "origin": "https://unknown.distributejs.org",
                }))).not.toHaveProperty("headers.access-control-allow-origin");
            });

            test("Sends a response with formatted Access-Control-Expose-Headers, if the matched route has any `cors.exposedHeaders` and the value of Origin is found in `cors.origins` of the matched route", async() => {
                expect((await httpCheck.send({
                    ":method": "POST",
                    ":path": "/items",
                    "origin": "https://developers.distributejs.org",
                }))).toHaveProperty("headers.access-control-expose-headers", "X-Custom-Header, Content-Length");

                expect((await httpCheck.send({
                    ":method": "GET",
                    ":path": "/status",
                    "origin": "https://developers.distributejs.org",
                }))).toHaveProperty("headers.access-control-expose-headers", "*");
            });
        });

        describe("On request with method and URI matching a route with CORS handling enabled with credentials supported, classed as a simple CORS request", () => {
            let httpRequestHandler: HttpRequestHandler;

            beforeEach(() => {
                const operations: Operation[] = [
                    {
                        cors: {
                            credentialsSupported: true,
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
                            credentialsSupported: true,
                            enabled: true,
                            exposedHeaders: ["x-CUSTOM-header", "Content-Length"],
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
                    {
                        cors: {
                            credentialsSupported: true,
                            enabled: true,
                            exposedHeaders: ["*"],
                            origins: ["*", "https://developers.distributejs.org"],
                        },
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.statusCode = 200;

                            response.end();
                        }),
                        method: "GET",
                        path: "/status",
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

            test("Sends a response with Access-Control-Allow-Origin header set to `*`, if the matched route `cors.origins` value has only `*`", async() => {
                const response = await httpCheck.send({
                    ":method": "GET",
                    ":path": "/items",
                    "origin": "https://developers.distributejs.org",
                })

                expect(response).toHaveProperty("headers.access-control-allow-origin", "https://developers.distributejs.org");

                expect(response).toHaveProperty("headers.access-control-allow-credentials", "true");
            });

            test("Sends a response with Access-Control-Allow-Origin header set to the value of Origin, Access-Control-Allow-Credentials with value true, and a Vary header with value `Origin`, if the value of Origin is found in `cors.origins` of the matched route", async() => {
                const response = await httpCheck.send({
                    ":method": "POST",
                    ":path": "/items",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-origin", "https://developers.distributejs.org");

                expect(response).toHaveProperty("headers.access-control-allow-credentials", "true");

                expect(response).toHaveProperty("headers.vary", "Origin");
            });

            test("Sends a response with Access-Control-Allow-Origin header set to the value of Origin, Access-Control-Allow-Credentials with value true, and a Vary header with value `Origin`, if `cors.origins` of the matched route contains both `*` and the value of Origin header", async() => {
                const response = await httpCheck.send({
                    ":method": "GET",
                    ":path": "/status",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-origin", "https://developers.distributejs.org");

                expect(response).toHaveProperty("headers.access-control-allow-credentials", "true");

                expect(response).toHaveProperty("headers.vary", "Origin");
            });

            test("Sends a response without Access-Control-Allow-Origin header, if the value of Origin is not found in `cors.origins` of the matched route", async() => {
                expect((await httpCheck.send({
                    ":method": "POST",
                    ":path": "/items",
                    "origin": "https://unknown.distributejs.org",
                }))).not.toHaveProperty("headers.access-control-allow-origin");
            });

            test("Sends a response with formatted Access-Control-Expose-Headers, if the matched route has any `cors.exposedHeaders` and the value of Origin is found in `cors.origins` of the matched route", async() => {
                expect((await httpCheck.send({
                    ":method": "POST",
                    ":path": "/items",
                    "origin": "https://developers.distributejs.org",
                }))).toHaveProperty("headers.access-control-expose-headers", "X-Custom-Header, Content-Length");

                expect((await httpCheck.send({
                    ":method": "GET",
                    ":path": "/status",
                    "origin": "https://developers.distributejs.org",
                }))).toHaveProperty("headers.access-control-expose-headers", "*");
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
                    "origin": "https://developers.distributejs.org",
                }))).not.toHaveProperty("headers.access-control-allow-origin");

                expect((await httpCheck.send({
                    ":method": "POST",
                    ":path": "/items",
                    "origin": "https://developers.distributejs.org",
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

                expect(response).not.toHaveProperty("headers.access-control-allow-origin");
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

        describe("On request with OPTIONS method and a URI which matches at least one route with CORS handling enabled with credentials not supported, classed as a preflight request", () => {
            let httpRequestHandler: HttpRequestHandler;

            beforeEach(() => {
                const operations: Operation[] = [
                    {
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
                            credentialsSupported: false,
                            enabled: true,
                            allowedHeaders: ["x-forwarded-for", "Content-Type"],
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
                    {
                        cors: {
                            enabled: true,
                            allowedHeaders: [],
                            origins: ["*"],
                        },
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.statusCode = 201;

                            response.end();
                        }),
                        method: "PATCH",
                        path: "/items/{itemSlug}",
                    },
                    {
                        cors: {
                            enabled: true,
                            maxAge: 3600,
                            origins: ["*", "https://developers.distributejs.org"],
                        },
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.statusCode = 201;

                            response.end();
                        }),
                        method: "PUT",
                        path: "/items/{itemSlug}",
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

            test("Sends a response with status code 204 No Content and no Allow header, if Origin and Access-Control-Allow-Methods are valid for URI", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).not.toHaveProperty("headers.allow");
            });

            test("Sends a response without Access-Control-Allow-Origin, if Origin is not present", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://unknown.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-allow-origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-methods");

                expect(response).not.toHaveProperty("headers.access-control-allow-headers");
            });

            test("Sends a response with status 204 and a Allow header listing allowed methods, if Origin is not present", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).toHaveProperty("headers.allow", "GET, HEAD, OPTIONS, POST");
            });

            test("Sends a response without Access-Control-Allow-Origin, if Origin is not valid for URI", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://unknown.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-allow-origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-methods");

                expect(response).not.toHaveProperty("headers.access-control-allow-headers");
            });

            test("Sends a response with status 204 and a Allow header listing allowed methods, if Origin is not valid for URI", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://unknown.distributejs.org",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).toHaveProperty("headers.allow", "GET, HEAD, OPTIONS, POST");
            });

            test("Sends a response without Access-Control-Allow-Origin, Access-Control-Allow-Methods and Access-Control-Allow-Headers header, if Access-Control-Request-Method is not present", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-allow-origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-methods");

                expect(response).not.toHaveProperty("headers.access-control-allow-headers");
            });

            test("Sends a response with status 204 and a Allow header listing allowed methods, if Access-Control-Request-Method is not present", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).toHaveProperty("headers.allow", "GET, HEAD, OPTIONS, POST");
            });

            test("Sends a response without Access-Control-Allow-Origin, Access-Control-Allow-Methods and Access-Control-Allow-Headers header, if Access-Control-Request-Method is not valid for URI", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "GET",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-allow-origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-methods");

                expect(response).not.toHaveProperty("headers.access-control-allow-headers");
            });

            test("Sends a response with status 204 and a Allow header listing allowed methods, if Access-Control-Request-Method is not valid for URI", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "PUT",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).toHaveProperty("headers.allow", "GET, HEAD, OPTIONS, POST");
            });

            test("Sends a response without Access-Control-Allow-Origin, Access-Control-Allow-Methods and Access-Control-Allow-Headers header, if Access-Control-Request-Headers is not valid for URI", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-headers": "x-unknown",
                    "access-control-request-method": "POST",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-allow-origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-methods");

                expect(response).not.toHaveProperty("headers.access-control-allow-headers");
            });

            test("Sends a response with status 204 and a Allow header listing allowed methods, if Access-Control-Request-Headers is not valid for URI", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-headers": "x-unknown",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).toHaveProperty("headers.allow", "GET, HEAD, OPTIONS, POST");
            });

            test("Sends a response with status 204 and a Allow header listing allowed methods, if Access-Control-Request-Headers is not empty and the route has no `cors.allowedHeaders` specified", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items/strawberries",
                    "access-control-request-headers": "x-unknown",
                    "access-control-request-method": "PUT",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).toHaveProperty("headers.allow", "OPTIONS, PATCH, PUT");
            });

            test("Sends a response with Access-Control-Allow-Origin header set to `*`, if the matched route `cors.origins` value has only `*`", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items/strawberries",
                    "access-control-request-method": "PATCH",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-origin", "*");

                expect(response).not.toHaveProperty("headers.access-control-allow-credentials");
            });

            test("Sends a response with Access-Control-Allow-Origin header set to the value of Origin and a Vary header with value `Origin`, but no Access-Control-Allow-Credentials header, if the value of Origin is found in `cors.origins` of the matched route", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-origin", "https://developers.distributejs.org");

                expect(response).toHaveProperty("headers.vary", "Origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-credentials");
            });

            test("Sends a response with Access-Control-Allow-Origin header set to the value of Origin and a Vary header with value `Origin`, but no Access-Control-Allow-Credentials header, if `cors.origins` of the matched route contains both `*` and the value of Origin header", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items/strawberries",
                    "access-control-request-method": "PUT",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-origin", "https://developers.distributejs.org");

                expect(response).toHaveProperty("headers.vary", "Origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-credentials");
            });

            test("Sends a response with Access-Control-Max-Age header, if `cors.maxAge` is set for route", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items/strawberries",
                    "access-control-request-method": "PUT",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-max-age", "3600");
            });

            test("Sends a response without Access-Control-Max-Age header, if `cors.maxAge` is set not for route", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-max-age");
            });

            test("Sends a response with Access-Control-Allow-Methods header, if the Access-Control-Request-Method is valid for the URI and is not a simple method", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items/strawberries",
                    "access-control-request-method": "PUT",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-methods", "PUT");
            });

            test("Sends a response without Access-Control-Allow-Methods header, if the Access-Control-Request-Method is valid for the URI and is a simple method", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-allow-methods");
            });

            test("Sends a response with Access-Control-Allow-Headers header with formatted supported header names, if the `cors.allowedHeaders` for the route exists and is not empty", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-headers", "X-Forwarded-For, Content-Type");
            });

            test("Sends a response without Access-Control-Allow-Headers header, if the `cors.allowedHeaders` for the route does not exist or is empty", async() => {
                const response1 = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items/strawberries",
                    "access-control-request-method": "PUT",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response1).not.toHaveProperty("headers.access-control-allow-headers");

                const response2 = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items/strawberries",
                    "access-control-request-method": "PATCH",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response2).not.toHaveProperty("headers.access-control-allow-headers");
            });
        });

        describe("On request with OPTIONS method and a URI which matches at least one route with CORS handling enabled with credentials supported, classed as a preflight request", () => {
            let httpRequestHandler: HttpRequestHandler;

            beforeEach(() => {
                const operations: Operation[] = [
                    {
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
                            credentialsSupported: true,
                            enabled: true,
                            allowedHeaders: ["x-forwarded-for", "Content-Type"],
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
                    {
                        cors: {
                            credentialsSupported: true,
                            enabled: true,
                            allowedHeaders: [],
                            origins: ["*"],
                        },
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.statusCode = 201;

                            response.end();
                        }),
                        method: "PATCH",
                        path: "/items/{itemSlug}",
                    },
                    {
                        cors: {
                            credentialsSupported: true,
                            enabled: true,
                            maxAge: 3600,
                            origins: ["*", "https://developers.distributejs.org"],
                        },
                        // eslint-disable-next-line @typescript-eslint/require-await
                        fulfil: jest.fn(async(context, request, response): Promise<void> => {
                            response.statusCode = 201;

                            response.end();
                        }),
                        method: "PUT",
                        path: "/items/{itemSlug}",
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

            test("Sends a response with status code 204 No Content and no Allow header, if Origin and Access-Control-Allow-Methods are valid for URI", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).not.toHaveProperty("headers.allow");
            });

            test("Sends a response without Access-Control-Allow-Origin, if Origin is not present", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://unknown.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-allow-origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-methods");

                expect(response).not.toHaveProperty("headers.access-control-allow-headers");
            });

            test("Sends a response with status 204 and a Allow header listing allowed methods, if Origin is not present", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).toHaveProperty("headers.allow", "GET, HEAD, OPTIONS, POST");
            });

            test("Sends a response without Access-Control-Allow-Origin, if Origin is not valid for URI", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://unknown.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-allow-origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-methods");

                expect(response).not.toHaveProperty("headers.access-control-allow-headers");
            });

            test("Sends a response with status 204 and a Allow header listing allowed methods, if Origin is not valid for URI", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://unknown.distributejs.org",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).toHaveProperty("headers.allow", "GET, HEAD, OPTIONS, POST");
            });

            test("Sends a response without Access-Control-Allow-Origin, Access-Control-Allow-Methods and Access-Control-Allow-Headers header, if Access-Control-Request-Method is not present", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-allow-origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-methods");

                expect(response).not.toHaveProperty("headers.access-control-allow-headers");
            });

            test("Sends a response with status 204 and a Allow header listing allowed methods, if Access-Control-Request-Headers is not empty and the route has no `cors.allowedHeaders` specified", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items/strawberries",
                    "access-control-request-headers": "x-unknown",
                    "access-control-request-method": "PUT",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).toHaveProperty("headers.allow", "OPTIONS, PATCH, PUT");
            });

            test("Sends a response with status 204 and a Allow header listing allowed methods, if Access-Control-Request-Method is not present", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).toHaveProperty("headers.allow", "GET, HEAD, OPTIONS, POST");
            });

            test("Sends a response without Access-Control-Allow-Origin, Access-Control-Allow-Methods and Access-Control-Allow-Headers header, if Access-Control-Request-Method is not valid for URI", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "GET",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-allow-origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-methods");

                expect(response).not.toHaveProperty("headers.access-control-allow-headers");
            });

            test("Sends a response with status 204 and a Allow header listing allowed methods, if Access-Control-Request-Method is not valid for URI", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "PUT",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).toHaveProperty("headers.allow", "GET, HEAD, OPTIONS, POST");
            });

            test("Sends a response without Access-Control-Allow-Origin, Access-Control-Allow-Methods and Access-Control-Allow-Headers header, if Access-Control-Request-Headers is not valid for URI", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-headers": "x-unknown",
                    "access-control-request-method": "POST",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-allow-origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-methods");

                expect(response).not.toHaveProperty("headers.access-control-allow-headers");
            });

            test("Sends a response with status 204 and a Allow header listing allowed methods, if Access-Control-Request-Headers is not valid for URI", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-headers": "x-unknown",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).toHaveProperty("headers.allow", "GET, HEAD, OPTIONS, POST");
            });

            test("Sends a response with Access-Control-Allow-Origin header set to `*`, if the matched route `cors.origins` value has only `*`", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items/strawberries",
                    "access-control-request-method": "PATCH",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-origin", "https://developers.distributejs.org");

                expect(response).toHaveProperty("headers.access-control-allow-credentials", "true");
            });

            test("Sends a response with Access-Control-Allow-Origin header set to the value of Origin and a Vary header with value `Origin`, but no Access-Control-Allow-Credentials header, if the value of Origin is found in `cors.origins` of the matched route", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-origin", "https://developers.distributejs.org");

                expect(response).toHaveProperty("headers.access-control-allow-credentials", "true");

                expect(response).toHaveProperty("headers.vary", "Origin");
            });

            test("Sends a response with Access-Control-Allow-Origin header set to the value of Origin and a Vary header with value `Origin`, but no Access-Control-Allow-Credentials header, if `cors.origins` of the matched route contains both `*` and the value of Origin header", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items/strawberries",
                    "access-control-request-method": "PUT",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-origin", "https://developers.distributejs.org");

                expect(response).toHaveProperty("headers.access-control-allow-credentials", "true");

                expect(response).toHaveProperty("headers.vary", "Origin");
            });

            test("Sends a response with Access-Control-Max-Age header, if `cors.maxAge` is set for route", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items/strawberries",
                    "access-control-request-method": "PUT",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-max-age", "3600");
            });

            test("Sends a response without Access-Control-Max-Age header, if `cors.maxAge` is set not for route", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-max-age");
            });

            test("Sends a response with Access-Control-Allow-Methods header, if the Access-Control-Request-Method is valid for the URI and is not a simple method", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items/strawberries",
                    "access-control-request-method": "PUT",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-methods", "PUT");
            });

            test("Sends a response without Access-Control-Allow-Methods header, if the Access-Control-Request-Method is valid for the URI and is a simple method", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-allow-methods");
            });

            test("Sends a response with Access-Control-Allow-Headers header with formatted supported header names, if the `cors.allowedHeaders` for the route exists and is not empty", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).toHaveProperty("headers.access-control-allow-headers", "X-Forwarded-For, Content-Type");
            });

            test("Sends a response without Access-Control-Allow-Headers header, if the `cors.allowedHeaders` for the route does not exist or is empty", async() => {
                const response1 = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items/strawberries",
                    "access-control-request-method": "PUT",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response1).not.toHaveProperty("headers.access-control-allow-headers");

                const response2 = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items/strawberries",
                    "access-control-request-method": "PATCH",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response2).not.toHaveProperty("headers.access-control-allow-headers");
            });
        });

        describe("On request with OPTIONS method and a URI, with URI matching a route with CORS handling not enabled, classed as preflight request", () => {
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

            test("Sends a response without Access-Control-Allow-Origin, Access-Control-Allow-Methods and Access-Control-Allow-Headers header", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                    "access-control-request-method": "POST",
                    "content-type": "application/json",
                    "origin": "https://developers.distributejs.org",
                });

                expect(response).not.toHaveProperty("headers.access-control-allow-origin");

                expect(response).not.toHaveProperty("headers.access-control-allow-methods");

                expect(response).not.toHaveProperty("headers.access-control-allow-headers");
            });

            test("Sends a response with status 204 and a Allow header listing allowed methods", async() => {
                const response = await httpCheck.send({
                    ":method": "OPTIONS",
                    ":path": "/items",
                });

                expect(response).toHaveProperty("headers.:status", 204);

                expect(response).toHaveProperty("headers.allow", "GET, HEAD, OPTIONS, POST");
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
