export enum RouteMethods {
    DELETE,
    GET,
    PATCH,
    POST,
    PUT,
}

export interface RouteCorsSettings {
    allowedHeaders?: string[];

    credentialsSupported?: boolean;

    enabled: boolean;

    exposedHeaders?: string[];

    maxAge?: number;

    origins: string[];
}

interface PathRegExpAndParameters {
    parameters: string[];

    pathRegExp: RegExp;
}

export class Route {
    public readonly cors: RouteCorsSettings;

    public readonly method: RouteMethods;

    public readonly pathTemplate: string;

    public readonly targetFn: (...args: unknown[]) => unknown;

    protected memoizedPathRegExpsAndParameters: PathRegExpAndParameters;

    constructor(method: keyof typeof RouteMethods, pathTemplate: string, targetFn: (...args: unknown[]) => unknown, cors?: RouteCorsSettings) {
        this.method = RouteMethods[method];

        this.pathTemplate = pathTemplate;

        this.targetFn = targetFn;

        this.cors = cors;
    }

    get pathRegExpAndParameters(): PathRegExpAndParameters {
        if (this.memoizedPathRegExpsAndParameters) {
            return this.memoizedPathRegExpsAndParameters;
        }

        const parameters = [];

        const parameterPattern = "([a-zA-Z0-9-_~\\.%]+)";

        const expressionRegExp = /{[^}]+}/g;

        let pathPattern = "^";

        let expressionMatches: RegExpExecArray;

        let indexToResumeFrom = 0;

        while ((expressionMatches = expressionRegExp.exec(this.pathTemplate)) !== null) {
            const matchLength = expressionMatches[0].length;

            pathPattern += this.pathTemplate.substring(indexToResumeFrom, expressionMatches.index) + parameterPattern;

            parameters.push(expressionMatches[0].substring(1, matchLength - 1));

            indexToResumeFrom = expressionMatches.index + matchLength;
        }

        if (indexToResumeFrom < this.pathTemplate.length) {
            pathPattern += this.pathTemplate.substr(indexToResumeFrom);
        }

        pathPattern += "\\/??$";

        const pathRegExpAndParameters: PathRegExpAndParameters = {
            parameters,
            pathRegExp: new RegExp(pathPattern),
        };

        return this.memoizedPathRegExpsAndParameters = pathRegExpAndParameters;
    }
}
