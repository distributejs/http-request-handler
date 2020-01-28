import { Route, RouteMethods } from "./route";

export interface RouterMatch {
    route: Route;
}

export class Router {
    protected readonly routes: Route[];

    protected memoizedRoutesToRouteMethodsMap: Map<RouteMethods, Route[]>;

    constructor(routes: Route[]) {
        this.routes = routes;

        this.memoizedRoutesToRouteMethodsMap = new Map();
    }

    public match(method: string, uri: string): RouterMatch {
        let matchedRoute: Route;

        const routeMethod = RouteMethods[method];

        const routesForRouteMethod = this.listRoutesForRouteMethod(routeMethod);

        for (let i = routesForRouteMethod.length - 1; i >= 0; --i) {
            const regExpResult = routesForRouteMethod[i].pathRegExpAndParameters.pathRegExp.exec(uri);

            if (regExpResult && regExpResult.length) {
                matchedRoute = routesForRouteMethod[i];

                break;
            }
        }

        return {
            route: matchedRoute,
        };
    }

    protected listRoutesForRouteMethod(routeMethod: RouteMethods): Route[] {
        if (this.memoizedRoutesToRouteMethodsMap.has(routeMethod)) {
            return this.memoizedRoutesToRouteMethodsMap.get(routeMethod);
        }

        const routesForRouteMethod = this.routes.filter((route) => {
            return route.method == routeMethod;
        });

        this.memoizedRoutesToRouteMethodsMap.set(routeMethod, routesForRouteMethod);

        return routesForRouteMethod;
    }
}
