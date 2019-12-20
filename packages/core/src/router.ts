import { OpenAPIV3 } from "openapi-types";
import * as uriTemplates from "uri-templates";
import { Core } from "./core";
import { Context } from "./utils/context";

/**
 * Manage Route resolution
 * @category CoreFeatures
 */
export class Router {
  protected routes: Map<string, any> = new Map();
  protected initiated: boolean = false;
  protected pathMap: any[];
  protected webda: Core;

  constructor(webda: Core) {
    this.webda = webda;
  }
  /**
   * Add a route dynamicaly
   *
   * @param {String} url of the route can contains dynamic part like {uuid}
   * @param {Object} info the type of executor
   */
  addRoute(url, info): void {
    this.routes[url] = info;
    if (this.initiated) {
      this.remapRoutes();
    }
  }

  /**
   * Remove a route dynamicly
   *
   * @param {String} url to remove
   */
  removeRoute(url): void {
    delete this.routes[url];
    this.remapRoutes();
  }

  public remapRoutes() {
    this.initURITemplates(this.routes);

    // Order path desc
    this.pathMap = [];
    for (var i in this.routes) {
      // Might need to trail the query string
      this.pathMap.push({
        url: i,
        config: this.routes[i]
      });
    }
    this.pathMap.sort(this.comparePath);
    this.initiated = true;
  }

  protected comparePath(a, b): number {
    // Normal node works with localeCompare but not Lambda...
    // Local compare { to a return: 26 on Lambda
    let bs = b.url.split("/");
    let as = a.url.split("/");
    for (let i in as) {
      if (bs[i] === undefined) return -1;
      if (as[i] === bs[i]) continue;
      if (as[i][0] === "{" && bs[i][0] !== "{") return 1;
      if (as[i][0] !== "{" && bs[i][0] === "{") return -1;
      return bs[i] < as[i] ? -1 : 1;
    }
    return 1;
  }

  /**
   * @hidden
   */
  protected initURITemplates(config: any): void {
    // Prepare tbe URI parser
    for (var map in config) {
      if (map.indexOf("{") != -1) {
        config[map]["_uri-template-parse"] = uriTemplates(map);
      }
    }
  }

  /**
   * Get all method for a specific url
   * @param config
   * @param method
   * @param url
   */
  getRouteMethodsFromUrl(url): string[] {
    let methods = [];
    for (let i in this.pathMap) {
      var routeUrl = this.pathMap[i].url;
      var map = this.pathMap[i].config;

      if (
        routeUrl !== url &&
        (map["_uri-template-parse"] === undefined || map["_uri-template-parse"].fromUri(url) === undefined)
      ) {
        continue;
      }

      if (Array.isArray(map["method"])) {
        methods = methods.concat(map["method"]);
      } else {
        methods.push(map["method"]);
      }
    }
    return methods;
  }

  /**
   * Get the route from a method / url
   */
  public getRouteFromUrl(ctx: Context, method, url): any {
    let parameters = this.webda.getConfiguration().parameters;
    for (let i in this.pathMap) {
      var routeUrl = this.pathMap[i].url;
      var map = this.pathMap[i].config;

      // Check method
      if (Array.isArray(map["method"])) {
        if (map["method"].indexOf(method) === -1) {
          continue;
        }
      } else if (map["method"] !== method) {
        continue;
      }

      if (routeUrl === url) {
        ctx.setServiceParameters(parameters);
        return map;
      }

      if (map["_uri-template-parse"] === undefined) {
        continue;
      }
      var parse_result = map["_uri-template-parse"].fromUri(url);
      if (parse_result !== undefined) {
        ctx.setServiceParameters(parameters);
        ctx.setPathParameters(parse_result);

        return map;
      }
    }
  }

  /**
   * Add all known routes to paths
   *
   * @param swagger2 to complete
   * @param skipHidden add hidden routes or not
   */
  completeSwagger(swagger2: OpenAPIV3.Document, skipHidden: boolean = true) {
    let hasTag = (tag: string) => {
      for (let t in swagger2.tags) {
        if (swagger2.tags[t].name === tag) {
          return true;
        }
      }
      return false;
    };
    for (let i in this.routes) {
      let route = this.routes[i];
      if (!route.swagger) {
        route.swagger = {
          methods: {}
        };
      }
      if (route.swagger.hidden && skipHidden) {
        continue;
      }
      route.swagger.hidden = false;
      let urlParameters = [];
      if (i.indexOf("{?") >= 0) {
        urlParameters = i.substring(i.indexOf("{?") + 2, i.length - 1).split(",");
        i = i.substr(0, i.indexOf("{?"));
      }
      swagger2.paths[i] = {};
      if (!Array.isArray(route.method)) {
        route.method = [route.method];
      }
      if (route["_uri-template-parse"]) {
        swagger2.paths[i].parameters = [];
        route["_uri-template-parse"].varNames.forEach(varName => {
          if (urlParameters.indexOf(varName) >= 0) {
            let name = varName;
            if (name.startsWith("*")) {
              name = name.substr(1);
            }
            swagger2.paths[i].parameters.push({
              name,
              in: "query",
              required: !varName.startsWith("*")
            });
            return;
          }
          swagger2.paths[i].parameters.push({
            name: varName,
            in: "path",
            required: true
          });
        });
      }
      route.method.forEach(method => {
        let responses;
        let schema;
        let description;
        let summary;
        let operationId;
        if (route.swagger[method.toLowerCase()]) {
          responses = route.swagger[method.toLowerCase()].responses;
          schema = route.swagger[method.toLowerCase()].schema;
          description = route.swagger[method.toLowerCase()].description;
          summary = route.swagger[method.toLowerCase()].summary;
          operationId = route.swagger[method.toLowerCase()].operationId;
        }
        schema = schema || {
          $ref: "#/definitions/" + (route.swagger.model || "Object")
        };
        responses = responses || {
          200: {
            description: "Operation success"
          }
        };
        for (let i in responses) {
          if (typeof responses[i] === "string") {
            responses[i] = {
              description: responses[i]
            };
          }
          if (!responses[i].schema && responses[i].model) {
            responses[i].schema = {
              $ref: "#/definitions/" + responses[i].model
            };
            delete responses[i].model;
          }
          let code = parseInt(i);
          if (code < 300 && code >= 200 && !responses[i].description) {
            responses[i].description = "Operation success";
          }
        }
        let desc: any = {
          tags: route.swagger.tags || [route.executor],
          responses: responses,
          description,
          summary,
          operationId
        };
        if (method.toLowerCase().startsWith("p")) {
          desc.parameters = [
            {
              in: "body",
              name: "body",
              description: "",
              required: true,
              schema: schema
            }
          ];
        }
        swagger2.paths[i][method.toLowerCase()] = desc;
      });
      if (route.swagger.tags) {
        route.swagger.tags.forEach(tag => {
          if (!hasTag(tag)) {
            swagger2.tags.push({
              name: tag
            });
          }
        });
      }
      if (!route.swagger.tags) {
        if (!hasTag(route.executor)) {
          swagger2.tags.push({
            name: route.executor
          });
        }
      }
    }
  }
}
