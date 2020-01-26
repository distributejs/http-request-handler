import { Route, RouteMethods } from "./route";

export interface RouterMatch {
    route: Route;
}

export class Router {
    protected readonly reverseOrderRoutes: Route[];

    protected memoizedRoutesToRouteMethodsMap: Map<RouteMethods, Route[]>;

    constructor(routes: Route[]) {
        this.reverseOrderRoutes = routes.slice().reverse();

        this.memoizedRoutesToRouteMethodsMap = new Map();
    }

    public match(method: string, uri: string): RouterMatch {
        let matchedRoute: Route;

        const routeMethod = RouteMethods[method];

        const reverseOrderRoutesForRouteMethod = this.listReverseOrderRoutesForRouteMethod(routeMethod);

        for (const route of reverseOrderRoutesForRouteMethod) {
            const regExpResult = route.pathRegExpAndParameters.pathRegExp.exec(uri);

            if (regExpResult && regExpResult.length) {
                matchedRoute = route;

                break;
            }
        }

        return {
            route: matchedRoute,
        };
    }

    protected listReverseOrderRoutesForRouteMethod(routeMethod: RouteMethods): Route[] {
        if (this.memoizedRoutesToRouteMethodsMap.has(routeMethod)) {
            return this.memoizedRoutesToRouteMethodsMap.get(routeMethod);
        }

        const routesForRouteMethod = this.reverseOrderRoutes.filter((route) => {
            return route.method == routeMethod;
        });

        this.memoizedRoutesToRouteMethodsMap.set(routeMethod, routesForRouteMethod);

        return routesForRouteMethod;
    }
}
