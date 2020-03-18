import { IncomingMessage, ServerResponse } from "http";

import { Http2ServerRequest, Http2ServerResponse } from "http2";

import { URL } from "url";

import { Route, RouteMethods, RouteCorsSettings } from "./route";

import { Router } from "./router";

export interface Operation {
    cors?: RouteCorsSettings;

    fulfil: Fulfil;

    method: keyof typeof RouteMethods;

    path: string;
}

interface Fulfil {
    (context: OperationContext, request: Http2ServerRequest | IncomingMessage, response: Http2ServerResponse | ServerResponse): Promise<void>;
}

interface OperationContext {
    pathArgs: Map<string, string>;

    url: URL;
}

export class HttpRequestHandler {
    protected readonly operations: Operation[];

    protected memoizedRouter: Router;

    constructor(operations: Operation[]) {
        this.operations = operations;
    }

    get router(): Router {
        if (this.memoizedRouter) {
            return this.memoizedRouter;
        }

        return this.memoizedRouter = new Router(this.operations.map((operation: Operation) => {
            return new Route(operation.method, operation.path, operation.fulfil, operation.cors);
        }));
    }

    public async handleRequest(request: Http2ServerRequest | IncomingMessage, response: Http2ServerResponse | ServerResponse): Promise<void> {
        const urlBase = request.headers[":scheme"] + '://' + request.headers[":authority"];

        const requestUrl = new URL(request.url, urlBase);

        if (request.method == "OPTIONS") {
            const allowedMethods = this.router.listMethodsForPath(requestUrl.pathname);

            if (!allowedMethods) {
                response.writeHead(404);

                response.end();

                return;
            }

            if (request.headers["origin"] && request.headers["access-control-request-method"]) {
                const matchedRoute = this.router.match(request.headers["access-control-request-method"] as string, requestUrl.pathname);

                if (!matchedRoute) {
                    // TODO: Handle no match for route.
                }

                const responseHeaders = {
                    "access-control-allow-origin": matchedRoute.route.cors.origin,
                    "access-control-allow-methods": allowedMethods.join(", "),
                };

                if (request.headers["access-control-request-headers"]) {
                    // TODO: Handle difference between access-control-request-headers and matchedRoute.route.cors.headers.
                    responseHeaders["access-control-allow-headers"] = matchedRoute.route.cors.headers ? matchedRoute.route.cors.headers.map((name: string) => name.split("-").map((nameChunk: string) => nameChunk.substr(0, 1).toUpperCase() + nameChunk.substr(1).toLowerCase()).join("-")).join(", ") : "";
                }

                response.writeHead(204, responseHeaders);

                return;
            }

            response.writeHead(204, {
                "allow": allowedMethods.join(", "),
            });

            response.end();

            return;
        }

        const matchedRoute = this.router.match(request.method, requestUrl.pathname);

        if (!matchedRoute) {
            const allowedMethods = this.router.listMethodsForPath(requestUrl.pathname);

            if (!allowedMethods) {
                response.writeHead(404);

                response.end();

                return;
            }

            response.writeHead(405, {
                "allow": allowedMethods.join(", "),
            });

            response.end();

            return;
        }

        const operationTargetFn = matchedRoute.route.targetFn as Fulfil;

        const context: OperationContext = {
            pathArgs: matchedRoute.args,
            url: requestUrl,
        };

        await operationTargetFn(context, request, response)
            .catch(() => {
                response.statusCode = 500;

                response.end();
            });
    }
}
