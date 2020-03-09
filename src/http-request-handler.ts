import { IncomingMessage, ServerResponse } from "http";

import { Http2ServerRequest, Http2ServerResponse } from "http2";

import { URL } from "url";

import { Route, RouteMethods } from "./route";

import { Router } from "./router";

export interface Operation {
    fulfil: () => void;
    method: keyof typeof RouteMethods;
    path: string;
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

    public handleRequest(request: Http2ServerRequest | IncomingMessage, response: Http2ServerResponse | ServerResponse): void {
        const urlBase = request.headers[":scheme"] + '://' + request.headers[":authority"];

        const requestUrl = new URL(request.url, urlBase);

        // TODO: Handle method set to OPTIONS.

        const matchedRoute = this.router.match(request.method, requestUrl.pathname);

        // TODO: Handle no route match, attempt to find allowed methods.

        matchedRoute.route.targetFn();

    }
}
