import { IncomingMessage, ServerResponse } from "http";

import { Http2ServerRequest, Http2ServerResponse } from "http2";

import { URL } from "url";

import { Route, RouteMethods } from "./route";

import { Router } from "./router";

export interface Operation {
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

        return this.memoizedRouter = new Router(this.operations.map((operation) => {
            return new Route(operation.method, operation.path, operation.fulfil);
        }));
    }

    public async handleRequest(request: Http2ServerRequest | IncomingMessage, response: Http2ServerResponse | ServerResponse): Promise<void> {
        const urlBase = request.headers[":scheme"] + '://' + request.headers[":authority"];

        const requestUrl = new URL(request.url, urlBase);

        // TODO: Handle method set to OPTIONS.

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
