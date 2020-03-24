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

            response.writeHead(204, {
                "allow": allowedMethods.join(", "),
            });

            response.end();

            return;
        }

        const routerMatch = this.router.match(request.method, requestUrl.pathname);

        if (!routerMatch) {
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

        if (request.headers.origin && routerMatch.route.cors && routerMatch.route.cors.enabled) {
            const matchedAllowedOrigin = this.matchAllowedOrigin(routerMatch.route, request.headers.origin as string);

            if (matchedAllowedOrigin) {
                if (routerMatch.route.cors.credentialsSupported) {
                    response.setHeader("access-control-allow-origin", request.headers.origin);

                    response.setHeader("access-control-allow-credentials", "true");

                    response.setHeader("vary", "Origin");
                }
                else {
                    response.setHeader("access-control-allow-origin", matchedAllowedOrigin);

                    if (matchedAllowedOrigin != "*") {
                        response.setHeader("vary", "Origin");
                    }
                }

                if (routerMatch.route.cors.exposedHeaders) {
                    response.setHeader("access-control-expose-headers", routerMatch.route.cors.exposedHeaders.map((unformattedHeaderName: string) => {
                        return this.formatHeaderName(unformattedHeaderName);
                    }).join(", "));
                }
            }
        }

        const operationTargetFn = routerMatch.route.targetFn as Fulfil;

        const context: OperationContext = {
            pathArgs: routerMatch.args,
            url: requestUrl,
        };

        await operationTargetFn(context, request, response)
            .catch(() => {
                response.statusCode = 500;

                response.end();
            });
    }

    protected formatHeaderName(unformattedHeaderName: string): string {
        return unformattedHeaderName.split("-").map((chunk: string) => chunk.substr(0, 1).toUpperCase() + chunk.substr(1).toLowerCase()).join("-");
    }

    protected matchAllowedOrigin(route: Route, origin: string): string {
        if (route.cors.origins.includes(origin)) {
            return origin;
        } else if (route.cors.origins.includes("*")) {
            return "*";
        }

        return null;
    }
}
