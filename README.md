# DistributeJS http-request-handler
![Test](https://github.com/distributejs/http-request-handler/workflows/Test/badge.svg)

## Introduction
DistributeJS http-request-handler is a HTTP request handler for applications in Node.js.

## Supported servers and clients
DistributeJS http-request-handler works with:
- Http2SecureServer with HTTP/2 client
- Http2SecureServer with HTTP/1.x client
- Http2Server with HTTP/2 client
- Server from "http" module with HTTP/1.x client
- Server from "https" module with HTTP/1.x client

## Features
The request handler includes the following features:
- CORS handling
- HEAD method requests handling
- OPTIONS method requests handling
- Routing

## Usage
### Basic usage
Create an instance of HttpRequestHandler with sample operations and call the `handleRequest` method from the server's request handler function, passing `request` and `response` arguments.

```
const operations = [
    {
        fulfil: async(context, request, response) => {
            response.end();
        },
        method: "GET",
        path: "/items",
    },
    {
        fulfil: async(context, request, response) => {
            response.end();
        },
        method: "POST",
        path: "/items",
    },
];

const httpRequestHandler = new HttpRequestHandler(operations);

server.on("request", (request, response) => {
    httpRequestHandler.handleRequest(request, response);
});
```

### Operations
An Operation object must contain properties:
- `fulfil` - async function with custom logic for the Operation
- `method` - HTTP method, one of `DELETE`, `GET`, `PATCH`, `POST`, `PUT`
- `pathTemplate` - path template (see Path templates section below)

An Operation object may also contain properties:
- `cors` - CORS handling settings (see CORS settings below)

### Path templates
Path templates define paths and path parameters for the Operation.

Parameter types available:
- `:parameterName` - parameter matching a single URL segment, produces a string representing matched segment
- `:parameterName+` - parameter matching a one or more URL segments, produces an array string representing matched segments

### CORS settings
A CORS settings object must contain properties:
- `enabled` - boolean indicating whether CORS handling is supported for the Operation
- `origins` - list of allowed origins, may include `*` wildcard

A CORS settings object may contain properties:
- `allowedHeaders` - list of headers against which to verify headers specified in the Access-Control-Request-Headers sent in a preflight request
- `exposedHeaders` - list of headers for Access-Control-Expose-Headers header returned in response to a simple cross-origin request
- `max-age` - value for Access-Control-Max-Age header returned in response to a preflight request

### Fulfil function
The `fulfil` function holds the custom logic for the Operation. This function has 3 parameters:
- `context` - object with properties:
    - `pathArgs` - arguements extracted from the request URI, as per the path pattern for the Operation
    - `url` - request URL, an instance of URL class from "url" module
- `request` - instance of `Http2ServerRequest` or `IncomingMessage` for HTTP/2 and HTTP/1.x requests respectively
- `response` - instance of `Http2ServerResponse` or `ServerResponse` for HTTP/2 and HTTP/1.x requests respectively


## Developers

### Generating test cert and key files
Test cert and key files, necessary for running tests, are not included in the repository and need to be generated. They are automatically generated as part of "pretest" script. If you usually run tests using a different method than calling ```npm test```, run ```npm test``` once to generate these files.
