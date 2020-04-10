import { Route, RouteMethods } from "./route";

export enum RouterMethods {
    DELETE,
    GET,
    HEAD,
    OPTIONS,
    PATCH,
    POST,
    PUT,
}

export interface RouterMatch {
    args: Map<string, string | string[]>;

    route: Route;
}

export class Router {
    protected readonly routes: Route[];

    protected memoizedRoutesToRouteMethodsMap: Map<RouteMethods, Route[]>;

    constructor(routes: Route[]) {
        this.routes = routes;

        this.memoizedRoutesToRouteMethodsMap = new Map();
    }

    public listMethodsForPath(path: string): (keyof typeof RouterMethods)[] {
        const methods: (keyof typeof RouterMethods)[] = [];

        let matchedRoute: Route;

        for (const route of this.routes) {
            if (route.pathRegExpAndParameters.pathRegExp.test(path)) {
                methods.push(RouteMethods[route.method] as keyof typeof RouteMethods);

                if (route.method == RouteMethods.GET) {
                    methods.push("HEAD");
                }

                matchedRoute = route;
            }
        }

        if (!matchedRoute) {
            return null;
        }

        methods.push("OPTIONS");

        methods.sort();

        return methods;
    }

    public match(method: string, path: string): RouterMatch {
        const args: Map<string, string | string[]> = new Map();

        let matchedRoute: Route;

        const routeMethod = RouteMethods[method];

        const routesForRouteMethod = this.listRoutesForRouteMethod(routeMethod);

        for (let i = routesForRouteMethod.length - 1; i >= 0; --i) {
            const regExpResult = routesForRouteMethod[i].pathRegExpAndParameters.pathRegExp.exec(path);

            if (regExpResult && regExpResult.length) {
                matchedRoute = routesForRouteMethod[i];

                if (regExpResult.length > 1) {
                    for (let i = 0; i < matchedRoute.pathRegExpAndParameters.parameters.length; ++i) {
                        const n = (regExpResult.length - 1) * i / 2 + 1;

                        const paramInTemplate = matchedRoute.pathRegExpAndParameters.parameters[i];

                        const lastChar = paramInTemplate.charAt(paramInTemplate.length - 1);

                        let key: string;

                        let value: string | string[];

                        switch (lastChar) {
                            case "+":
                                key = paramInTemplate.substr(0, paramInTemplate.length - 1);

                                value = regExpResult[n].substr(1).split("/");

                                break;

                            default:
                                key = paramInTemplate;

                                value = regExpResult[n].substr(1);

                                break;
                        }

                        args.set(key, value);
                    }
                }

                break;
            }
        }

        if (!matchedRoute) {
            return null;
        }

        return {
            args,
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
