import { IncomingMessage, ServerResponse } from "http";

import { Http2ServerRequest, Http2ServerResponse } from "http2";

import { URL } from "url";

import { Route, RouteMethods, RouteCorsSettings } from "./route";

import { Router, RouterMethods } from "./router";

import { TLSSocket } from "tls";

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
        if (!Object.keys(RouterMethods).includes(request.method)) {
            response.writeHead(501);

            response.end();

            return;
        }

        let urlBase: string;

        if ((request as Http2ServerRequest).scheme && (request as Http2ServerRequest).authority) {
            urlBase = (request as Http2ServerRequest).scheme + "://" + (request as Http2ServerRequest).authority;
        }
        else {
            urlBase = (request.socket instanceof TLSSocket ? "https" : "http") + "://" + request.headers.host;
        }

        const requestUrl = new URL(request.url, urlBase);

        if (request.method == "OPTIONS") {
            const allowedMethods = this.router.listMethodsForPath(requestUrl.pathname);

            if (!allowedMethods) {
                response.writeHead(404);

                response.end();

                return;
            }

            if (this.handleAsPreflightRequest(request, requestUrl, response)) {
                return;
            }

            response.writeHead(204, {
                "allow": allowedMethods.join(", "),
            });

            response.end();

            return;
        }

        const routingMethod = request.method == "HEAD" ? "GET" : request.method;

        const routerMatch = this.router.match(routingMethod, requestUrl.pathname);

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
                    response.setHeader(
                        "access-control-expose-headers",
                        routerMatch.route.cors.exposedHeaders.map((unformattedHeaderName: string) => this.formatHeaderName(unformattedHeaderName)).join(", "));
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

    protected handleAsPreflightRequest(request: Http2ServerRequest | IncomingMessage, requestUrl: URL, response: Http2ServerResponse | ServerResponse): boolean {
        if (!request.headers.origin) {
            return false;
        }

        if (!request.headers["access-control-request-method"]) {
            return false;
        }

        const routerMatch = this.router.match(request.headers["access-control-request-method"] as string, requestUrl.pathname);

        if (!routerMatch) {
            return false;
        }

        if (!routerMatch.route.cors || !routerMatch.route.cors.enabled) {
            return false;
        }

        if (request.headers['access-control-request-headers'] && request.headers['access-control-request-headers'] != "") {
            const accessControlHeaderNames = ((request.headers['access-control-request-headers'] as string).split(",")).map(rawHeaderName => rawHeaderName.trim());

            if (accessControlHeaderNames.length && !routerMatch.route.cors.allowedHeaders) {
                return false;
            }

            if (accessControlHeaderNames.filter(headerName => routerMatch.route.cors.allowedHeaders.includes(headerName)).length != accessControlHeaderNames.length) {
                return false;
            }
        }

        const matchedAllowedOrigin = this.matchAllowedOrigin(routerMatch.route, request.headers.origin as string);

        if (!matchedAllowedOrigin) {
            return false;
        }

        if (!["GET", "HEAD", "POST"].includes((request.headers["access-control-request-method"] as string))) {
            response.setHeader("access-control-allow-methods", request.headers["access-control-request-method"]);
        }

        if (routerMatch.route.cors.allowedHeaders && routerMatch.route.cors.allowedHeaders.length) {
            response.setHeader(
                "access-control-allow-headers",
                routerMatch.route.cors.allowedHeaders.map(unformattedHeaderName => this.formatHeaderName(unformattedHeaderName)).join(", "));
        }

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

        if (routerMatch.route.cors.maxAge) {
            response.setHeader("access-control-max-age", routerMatch.route.cors.maxAge);
        }

        response.statusCode = 204;

        response.end();

        return true;
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
