export enum RouteMethods {
    DELETE,
    GET,
    PATCH,
    POST,
    PUT,
}

interface PathRegExpAndParameters {
    parameters: string[];

    pathRegExp: RegExp;
}

export class Route {
    public readonly method: RouteMethods;

    public readonly pathTemplate: string;

    public readonly targetFn: (request, response) => Promise<void>;

    protected memoizedPathRegExpsAndParameters: PathRegExpAndParameters;

    constructor(method: keyof typeof RouteMethods, pathTemplate: string, targetFn: (request, response) => Promise<void>) {
        this.method = RouteMethods[method];

        this.pathTemplate = pathTemplate;

        this.targetFn = targetFn;
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

        pathPattern += "$";

        const pathRegExpAndParameters: PathRegExpAndParameters = {
            parameters,
            pathRegExp: new RegExp(pathPattern),
        };

        return this.memoizedPathRegExpsAndParameters = pathRegExpAndParameters;
    }
}
