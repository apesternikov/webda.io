import { EventWithContext, WebdaError } from "../core";
import { ConfigurationProvider } from "../index";
import { CoreModel, CoreModelDefinition, ModelAction } from "../models/coremodel";
import { Route, Service, ServiceParameters } from "../services/service";
import { Context } from "../utils/context";
import { HttpMethodType } from "../utils/httpcontext";
import { WebdaQL } from "./webdaql/query";

export class StoreNotFoundError extends WebdaError {
  constructor(uuid: string, storeName: string) {
    super("STORE_NOTFOUND", `Item not found ${uuid} Store(${storeName})`);
  }
}

export class UpdateConditionFailError extends WebdaError {
  constructor(uuid: string, conditionField: string, condition: string | Date) {
    super(
      "STORE_UPDATE_CONDITION_FAILED",
      `UpdateCondition not met on ${uuid}.${conditionField} === ${
        condition instanceof Date ? condition.toISOString() : condition
      }`
    );
  }
}

interface EventStore {
  /**
   * Target object
   */
  object: CoreModel;
  /**
   * Store emitting
   */
  store: Store;
}
/**
 * Event called before save of an object
 */
export interface EventStoreSave extends EventStore {}
/**
 * Event called after save of an object
 */
export interface EventStoreSaved extends EventStoreSave {}
/**
 * Event called before delete of an object
 */
export interface EventStoreDelete extends EventStore {}
/**
 * Event called after delete of an object
 */
export interface EventStoreDeleted extends EventStoreDelete {}
/**
 * Event called on retrieval of an object
 */
export interface EventStoreGet extends EventStore {}
/**
 * Event called before action on an object
 */
export interface EventStoreAction extends EventWithContext {
  /**
   * Name of the action
   */
  action: string;
  /**
   * Target object unless it is a global action
   */
  object?: CoreModel;
  /**
   * Emitting store
   */
  store: Store;
}
/**
 * Event called after action on an object
 */
export interface EventStoreActioned extends EventStoreAction {
  /**
   * Result of the action
   */
  result: any;
}
/**
 * Event called before update of an object
 */
export interface EventStoreUpdate extends EventStoreUpdated {
  /**
   * Update content
   */
  update: any;
}
/**
 * Event called after update of an object
 */
export interface EventStoreUpdated extends EventStore {}
/**
 * Event called before patch update of an object
 */
export interface EventStorePatchUpdate extends EventStoreUpdate {}
/**
 * Event called after patch update of an object
 */
export interface EventStorePatchUpdated extends EventStoreUpdated {}
/**
 * Event called after partial update of an object
 */
export interface EventStorePartialUpdated {
  /**
   * Object uuid
   */
  object_id: string;
  /**
   * Emitting store
   */
  store: Store;
  /**
   * Update date
   */
  updateDate?: Date;
  /**
   * Info on the update
   */
  partial_update: {
    /**
     * If incremental update
     */
    increment?: {
      /**
       * Increment value
       */
      value: number;
      /**
       * Property to increment
       */
      property: string;
    };
    /**
     * Add item to a collection
     */
    addItem?: {
      /**
       * Item to add
       */
      value: any;
      /**
       * Collection name
       */
      property: string;
      /**
       * Index to add
       */
      index: number;
    };
    /**
     * Delete an item from collection
     */
    deleteItem?: {
      /**
       * Collection name
       */
      property: string;
      /**
       * Index in the collection
       */
      index: number;
    };
    deleteAttribute?: string;
  };
}

/**
 * Event sent when a query on the store is emitted
 */
export interface EventStoreQuery {
  /**
   * Request sent
   */
  query: string;
  /**
   * Emitting store
   */
  store: Store;
  /**
   * The parsed query by our grammar
   */
  parsedQuery: WebdaQL.Query;
}
/**
 * Event sent when query is resolved
 */
export interface EventStoreQueried extends EventStoreQuery {
  /**
   * Results from the query
   */
  results: CoreModel[];
  /**
   * The next continuation token
   */
  continuationToken: string;
}

/**
 * Event sent when object is created via POST request
 */
export interface EventStoreWebCreate extends EventWithContext {
  /**
   * Properties for the object
   */
  values: any;
  /**
   * Target object
   */
  object: CoreModel;
  /**
   * Emitting store
   */
  store: Store;
}

/**
 * Event sent when object is retrieved via GET request
 */
export interface EventStoreWebGet extends EventWithContext {
  /**
   * Emitting store
   */
  store: Store;
  /**
   * Target object
   */
  object: CoreModel;
}

/**
 * Event sent when object is retrieved via GET request
 */
export interface EventStoreWebGetNotFound extends EventWithContext {
  /**
   * Emitting store
   */
  store: Store;
  /**
   * Target object
   */
  uuid: string;
}

/**
 * Event sent when object is updated via PUT request
 */
export interface EventStoreWebUpdate extends EventWithContext {
  /**
   * Type of update
   */
  method: "PATCH" | "PUT";
  /**
   * Updates to do on the object
   */
  updates: any;
  /**
   * Target object
   */
  object: CoreModel;
  /**
   * Emitting store
   */
  store: Store;
}

/**
 * Event sent when object is deleted via DELETE request
 */
export interface EventStoreWebDelete extends EventWithContext {
  /**
   * Object uuid
   */
  object_id: string;
  /**
   * Emitting store
   */
  store: Store;
}

export type ExposeParameters = {
  /**
   * URL endpoint to use to expose REST Resources API
   *
   * @default service.getName().toLowerCase()
   */
  url?: string;
  /**
   * You can restrict any part of the CRUD
   *
   * @default {}
   */
  restrict?: {
    /**
     * Do not expose the POST
     */
    create?: boolean;
    /**
     * Do not expose the PUT and PATCH
     */
    update?: boolean;
    /**
     * Do not expose the GET
     */
    get?: boolean;
    /**
     * Do not expose the DELETE
     */
    delete?: boolean;
    /**
     * Do not expose the query endpoint
     */
    query?: boolean;
  };

  /**
   * For confidentiality sometimes you might prefer to expose query through PUT
   * To avoid GET logging
   *
   * @default "GET"
   */
  queryMethod?: "PUT" | "GET";
};

/**
 * Represent a query result on the Store
 */
export interface StoreFindResult<T> {
  /**
   * Current result objects
   */
  results: T[];
  /**
   * Continuation Token if more results are available
   */
  continuationToken?: string;
  /**
   * Remaining filtering to do as current store cannot filter
   *
   * If `true`, no more filtering is required apart from permissions
   * If `filter === undefined`, a full postquery filtering will happen
   * Otherwise filter.eval while be used on every results
   */
  filter?: WebdaQL.Expression | true;
}

/**
 * Store parameter
 */
export class StoreParameters extends ServiceParameters {
  /**
   * Webda model to use within the Store
   *
   * @default "Webda/CoreModel"
   */
  model?: string;
  /**
   * async delete
   */
  asyncDelete: boolean;
  /**
   * Expose the service to an urls
   */
  expose?: ExposeParameters;
  /**
   * Allow to load object that does not have the type data
   *
   * @default true
   */
  strict?: boolean;
  /**
   * Slow query threshold
   *
   * @default 30000
   */
  slowQueryThreshold: number;

  constructor(params: any, service: Service<any>) {
    super(params);
    this.model ??= "Webda/CoreModel";
    let expose = params.expose;
    if (typeof expose == "boolean") {
      expose = {};
      expose.url = "/" + service.getName().toLowerCase();
    } else if (typeof expose == "string") {
      expose = {
        url: expose
      };
    } else if (typeof expose == "object" && expose.url == undefined) {
      expose.url = "/" + service.getName().toLowerCase();
    }
    if (expose) {
      expose.restrict = expose.restrict || {};
      this.expose = expose;
      this.expose.queryMethod ??= "GET";
      this.url = expose.url;
    }
    if (params.map) {
      throw new Error("Deprecated map usage, use a MapperService");
    }
    if (params.index) {
      throw new Error("Deprecated index usage, use an AggregatorService");
    }
    this.strict ??= true;
    this.slowQueryThreshold ??= 30000;
  }
}

export type StoreEvents = {
  "Store.PartialUpdated": EventStorePartialUpdated;
  "Store.Save": EventStoreSave;
  "Store.Saved": EventStoreSaved;
  "Store.PatchUpdate": EventStorePatchUpdate;
  "Store.PatchUpdated": EventStorePatchUpdated;
  "Store.Update": EventStoreUpdate;
  "Store.Updated": EventStoreUpdated;
  "Store.Delete": EventStoreDelete;
  "Store.Deleted": EventStoreDeleted;
  "Store.Get": EventStoreGet;
  "Store.Query": EventStoreQuery;
  "Store.Queried": EventStoreQueried;
  "Store.WebCreate": EventStoreWebCreate;
  "Store.Action": EventStoreAction;
  "Store.Actioned": EventStoreActioned;
  "Store.WebUpdate": EventStoreWebUpdate;
  "Store.WebGetNotFound": EventStoreWebGetNotFound;
  "Store.WebGet": EventStoreWebGet;
  "Store.WebDelete": EventStoreWebDelete;
};

/**
 * A mapping service allow to link two object together
 *
 * Therefore they need to handle the cascadeDelete
 */
export interface MappingService<T = any> {
  newModel(object: any): T;
}

/**
 * This class handle NoSQL storage and mapping (duplication) between NoSQL object
 * TODO Create the mapping documentation
 *
 * It use basic CRUD, and can expose those 4 to through HTTP
 *
 * It emits events :
 *   Store.Save: Before saving the object
 *   Store.Saved: After saving the object
 *   Store.Update: Before updating the object
 *   Store.Updated: After updating the object
 *   Store.Delete: Before deleting the object
 *   Store.Deleted: After deleting the object
 *   Store.Get: When getting the object
 *   Store.Action: When an action will be done on an object
 *   Store.Actioned: When an action has been done on an object
 *
 * Mapping:
 *
 *
 * Parameters
 *
 *  map: { ... }
 *  expose: { // Enable the HTTP exposure
 *      url: '', // The url to expose to by default it is service name in lowercase ( users for example )
 *      restrict: {
 *	       create: true, // Don't expose the POST /users
 *         update: true, // Don't expose the PUT /users/{uuid}
 *         delete: true, // Don't expose the DELETE /users/{uuid}
 *         get: true // Don't expose the GET /users/{uuid}
 *      }
 *   }
 * @category CoreServices
 */
abstract class Store<
    T extends CoreModel = CoreModel,
    K extends StoreParameters = StoreParameters,
    E extends StoreEvents = StoreEvents
  >
  extends Service<K, E>
  implements ConfigurationProvider, MappingService<T>
{
  /**
   * Cache store
   */
  _cacheStore: Store<T>;
  /**
   * Contain the reverse map
   */
  _reverseMap: { mapper: MappingService; property: string }[] = [];
  /**
   * Contains the current model
   */
  _model: CoreModelDefinition;
  /**
   * Contain the model update date
   */
  _lastUpdateField: string;
  /**
   * Contain the model creation date
   */
  _creationDateField: string;
  /**
   * Contain the model uuid field
   */
  protected _uuidField: string = "uuid";
  /**
   * Add metrics counter
   */
  metrics = {
    save: 0,
    update: 0,
    partialUpdate: 0,
    get: 0,
    increment: 0,
    delete: 0,
    collectionUpsert: 0,
    collectionDelete: 0,
    attributeDelete: 0,
    query: 0,
    queryDuration: 0,
    slowQueries: 0
  };

  /**
   * Load the parameters for a service
   */
  abstract loadParameters(params: any): StoreParameters;

  /**
   * Retrieve the Model
   *
   * @throws Error if model is not found
   */
  computeParameters(): void {
    super.computeParameters();
    const p = this.parameters;
    this._model = <CoreModelDefinition>this._webda.getModel(p.model);
    this._uuidField = this._model.getUuidField();
    this._lastUpdateField = this._model.getLastUpdateField();
    this._creationDateField = this._model.getCreationField();
    this._cacheStore?.computeParameters();
    this.cacheStorePatchException();
  }

  logSlowQuery(_query: string, _reason: string, _time: number) {
    // TODO Need to implement: https://github.com/loopingz/webda.io/issues/202
  }

  /**
   * Return Store current model
   * @returns
   */
  getModel(): CoreModelDefinition {
    return this._model;
  }

  getLastUpdateField(): string {
    return this._model.getLastUpdateField();
  }

  /**
   * Get From Cache or main
   * @param uid
   * @param raiseIfNotFound
   * @returns
   */
  async _getFromCache(uid: string, raiseIfNotFound: boolean = false): Promise<T> {
    let res = await this._cacheStore?._get(uid);
    if (!res) {
      res = await this._get(uid, raiseIfNotFound);
    } else {
      res.__store = this;
    }
    return res;
  }

  /**
   * Get object from store
   * @param uid
   * @returns
   */
  async getObject(uid: string): Promise<T> {
    this.metrics.get++;
    return this._getFromCache(uid);
  }

  /**
   * @override
   */
  getUrl(url: string, methods: HttpMethodType[]) {
    // If url is absolute
    if (url.startsWith("/")) {
      return url;
    }
    const expose = this.parameters.expose;
    if (
      !expose.url ||
      (url === "." && methods.includes("POST") && expose.restrict.create) ||
      (url === "./{uuid}" && methods.includes("DELETE") && expose.restrict.delete) ||
      (url === "./{uuid}" && methods.includes("PATCH") && expose.restrict.update) ||
      (url === "./{uuid}" && methods.includes("PUT") && expose.restrict.update) ||
      (url === "./{uuid}" && methods.includes("GET") && expose.restrict.get) ||
      (url === ".{?q}" && methods.includes("GET") && expose.restrict.query) ||
      (url === "." && methods.includes("PUT") && expose.restrict.query)
    ) {
      return undefined;
    }
    return super.getUrl(url, methods);
  }

  /**
   * @inheritdoc
   */
  initRoutes() {
    if (!this.parameters.expose) {
      return;
    }
    super.initRoutes();
    // We enforce ExposeParameters within the constructor
    const expose = this.parameters.expose;

    // Query endpoint
    if (!expose.restrict.query) {
      let requestBody;
      if (expose.queryMethod === "PUT") {
        requestBody = {
          content: {
            "application/json": {
              schema: {
                properties: {
                  q: {
                    type: "string"
                  }
                }
              }
            }
          }
        };
      }
      this.addRoute(expose.queryMethod === "GET" ? `.{?q}` : ".", [expose.queryMethod], this.httpQuery, {
        model: this._model.name,
        [expose.queryMethod.toLowerCase()]: {
          description: `Query on ${this._model.name} model with WebdaQL`,
          summary: "Query " + this._model.name,
          operationId: `query${this._model.name}`,
          requestBody,
          responses: {
            "200": {
              description: "Retrieve models",
              content: {
                "application/json": {
                  schema: {
                    properties: {
                      contiuationToken: {
                        type: "string"
                      },
                      results: {
                        type: "array",
                        items: {
                          $ref: `#/components/schemas/${this._model.name}`
                        }
                      }
                    }
                  }
                }
              }
            },
            "400": {
              description: "Query is invalid"
            },
            "403": {
              description: "You don't have permissions"
            }
          }
        }
      });
    }

    // Model actions
    if (this._model && this._model.getActions) {
      let actions = this._model.getActions();
      Object.keys(actions).forEach(name => {
        let action: ModelAction = actions[name];
        if (!action.methods) {
          action.methods = ["PUT"];
        }
        let executer;
        if (action.global) {
          // By default will grab the object and then call the action

          if (!this._model["_" + name]) {
            throw Error("Action static method _" + name + " does not exist");
          }
          executer = this.httpGlobalAction;
          this.addRoute(`./${name}`, action.methods, executer, action.openapi);
        } else {
          // By default will grab the object and then call the action
          if (!this._model.prototype["_" + name]) {
            throw Error("Action method _" + name + " does not exist");
          }
          executer = this.httpAction;

          this.addRoute(`./{uuid}/${name}`, action.methods, executer, action.openapi);
        }
      });
    }
  }

  /**
   * OVerwrite the model
   * Used mainly in test
   */
  setModel(model: CoreModelDefinition) {
    this._model = model;
    this._cacheStore?.setModel(model);
    this.parameters.strict = false;
  }

  /**
   * We should ignore exception from the store
   */
  cacheStorePatchException() {
    if (!this._cacheStore) {
      return;
    }
    const replacer = original => {
      return (...args) => {
        return original
          .bind(this._cacheStore, ...args)()
          .catch(err => {
            this.log("TRACE", `Ignoring cache exception ${this._name}: ${err.message}`);
          });
      };
    };
    for (let i of [
      "_get",
      "_patch",
      "_update",
      "_delete",
      "_incrementAttribute",
      "_upsertItemToCollection",
      "_deleteItemFromCollection",
      "_removeAttribute"
    ]) {
      this._cacheStore[i] = replacer(this._cacheStore[i]);
    }
  }

  /**
   * Init a model from the current stored data
   *
   * Initial the reverse map as well
   *
   * @param object
   * @returns
   */
  protected initModel(object: any = {}): T {
    // Make sure to send a model object
    if (!(object instanceof this._model)) {
      object = this._model.factory(this._model, object);
    }
    if (!object.getUuid()) {
      object.setUuid(object.generateUid(object));
    }
    object.__store = this;
    for (let i in this._reverseMap) {
      object[this._reverseMap[i].property] ??= [];
      for (let j in object[this._reverseMap[i].property]) {
        // Use Partial
        object[this._reverseMap[i].property][j] = this._reverseMap[i].mapper.newModel(
          object[this._reverseMap[i].property][j]
        );
        object[this._reverseMap[i].property][j].setContext(object.getContext());
      }
    }
    return object;
  }

  /**
   * Get a new model with this data preloaded
   * @param object
   * @returns
   */
  newModel(object: any = {}) {
    let result = this.initModel(object);
    Object.keys(object).forEach(k => result.__dirty.add(k));
    return result;
  }

  /**
   * Add reverse map information
   *
   * @param prop
   * @param cascade
   * @param store
   */
  addReverseMap(prop: string, store: MappingService) {
    this._reverseMap.push({
      property: prop,
      mapper: store
    });
  }

  async incrementAttribute(uid: string, prop: string, value: number) {
    // If value === 0 no need to update anything
    if (value === 0) {
      return Promise.resolve();
    }
    let updateDate = new Date();
    this.metrics.increment++;
    await this._incrementAttribute(uid, prop, value, updateDate);
    await this._cacheStore?._incrementAttribute(uid, prop, value, updateDate);
    return this.emitSync("Store.PartialUpdated", <EventStorePartialUpdated>{
      object_id: uid,
      store: this,
      updateDate,
      partial_update: {
        increment: {
          value: value,
          property: prop
        }
      }
    });
  }

  async upsertItemToCollection(
    uid: string,
    prop: string,
    item: any,
    index: number = undefined,
    itemWriteCondition: any = undefined,
    itemWriteConditionField: string = this._uuidField
  ) {
    let updateDate = new Date();
    this.metrics.collectionUpsert++;
    await this._upsertItemToCollection(uid, prop, item, index, itemWriteCondition, itemWriteConditionField, updateDate);
    await this._cacheStore?._upsertItemToCollection(
      uid,
      prop,
      item,
      index,
      itemWriteCondition,
      itemWriteConditionField,
      updateDate
    );

    await this.emitSync("Store.PartialUpdated", <EventStorePartialUpdated>{
      object_id: uid,
      store: this,
      updateDate,
      partial_update: {
        addItem: {
          value: item,
          property: prop,
          index: index
        }
      }
    });
  }

  async deleteItemFromCollection(
    uid: string,
    prop: string,
    index: number,
    itemWriteCondition: any,
    itemWriteConditionField: string = this._uuidField
  ) {
    let updateDate = new Date();
    this.metrics.collectionDelete++;
    await this._deleteItemFromCollection(uid, prop, index, itemWriteCondition, itemWriteConditionField, updateDate);
    await this._cacheStore?._deleteItemFromCollection(
      uid,
      prop,
      index,
      itemWriteCondition,
      itemWriteConditionField,
      updateDate
    );
    await this.emitSync("Store.PartialUpdated", <EventStorePartialUpdated>{
      object_id: uid,
      store: this,
      updateDate,
      partial_update: {
        deleteItem: {
          property: prop,
          index: index
        }
      }
    });
  }

  /**
   * Query store with WebdaQL
   * @param query
   * @param context to apply permission
   */
  async query(query: string, context?: Context): Promise<{ results: T[]; continuationToken?: string }> {
    let permissionQuery = this._model.getPermissionQuery(context);
    let partialPermission = true;
    let fullQuery;
    if (permissionQuery) {
      partialPermission = permissionQuery.partial;
      if (query.trim() !== "") {
        fullQuery = `(${permissionQuery.query}) AND ${query}`;
      } else {
        fullQuery = permissionQuery.query;
      }
    } else {
      fullQuery = query;
    }
    let queryValidator = new WebdaQL.QueryValidator(fullQuery);
    let offset = queryValidator.getOffset();
    const limit = queryValidator.getLimit();
    const parsedQuery = queryValidator.getQuery();
    // Emit the default event
    await this.emitSync("Store.Query", <EventStoreQuery>{
      query,
      parsedQuery,
      store: this,
      context
    });
    const result = {
      results: [],
      continuationToken: undefined
    };
    /*
      Offset are split in two with _

      MainOffset is the database offset, retrieving a page from the database
      SubOffset is the offset within the page

      As we filter through the page, for additional filters or permissions, the page cut
      by database does not endup being our final page cut, so we need a page offset to 
      abstract this completely
     */
    let [mainOffset, subOffset] = offset.split("_");
    let secondOffset = parseInt(subOffset || "0");
    let duration = Date.now();
    this.metrics.query++;

    while (result.results.length < limit) {
      let tmpResults = await this.find({ ...parsedQuery, continuationToken: mainOffset });
      // If no filter is returned assume it is by mistake and apply filtering
      if (tmpResults.filter === undefined) {
        tmpResults.filter = queryValidator.getExpression();
        this.log("WARN", `Store '${this.getName()}' postquery full filtering`);
      }
      let subOffsetCount = 0;
      for (let item of tmpResults.results) {
        // Because of dynamic filter and permission we need to suboffset the pagination
        subOffsetCount++;
        if (subOffsetCount <= secondOffset) {
          continue;
        }
        if (tmpResults.filter !== true && !tmpResults.filter.eval(item)) {
          continue;
        }
        if (context && partialPermission) {
          try {
            await item.canAct(context, "get");
          } catch (err) {
            continue;
          }
        }

        result.results.push(item);
        if (result.results.length >= limit) {
          if (subOffsetCount === tmpResults.results.length) {
            result.continuationToken = tmpResults.continuationToken;
          } else {
            result.continuationToken = `${mainOffset}_${subOffsetCount}`;
          }
          break;
        }
      }
      // Update both offset
      mainOffset = tmpResults.continuationToken;
      // Fresh new query so we do not need to skip
      secondOffset = 0;
      if (mainOffset === undefined || result.results.length >= limit) {
        break;
      }
    }
    duration = Date.now() - duration;
    this.metrics.queryDuration =
      (this.metrics.queryDuration * (this.metrics.query - 1) + duration) / this.metrics.query;
    if (duration > this.parameters.slowQueryThreshold) {
      this.logSlowQuery(query, "", duration);
    }
    await this.emitSync("Store.Queried", <EventStoreQueried>{
      query,
      parsedQuery: parsedQuery,
      store: this,
      continuationToken: result.continuationToken,
      results: result.results,
      context
    });
    return result;
  }

  /**
   * Expose query to http
   */
  protected async httpQuery(ctx: Context) {
    let query: string;
    if (ctx.getHttpContext().getMethod() === "GET") {
      query = ctx.getParameters().q;
    } else {
      query = (await ctx.getRequestBody()).q;
    }
    try {
      ctx.write(await this.query(query, ctx));
    } catch (err) {
      if (err instanceof SyntaxError) {
        this.log("INFO", "Query syntax error");
        throw 400;
      }
      throw err;
    }
  }

  /**
   * Save an object
   *
   * @param {Object} Object to save
   * @param {String} Uuid to use, if not specified take the object.uuid or generate one if not found
   * @return {Promise} with saved object
   *
   * Might want to rename to create
   */
  async save(object, ctx: Context = undefined): Promise<T> {
    object = this.initModel(object);

    // Dates should be store by the Store
    object[this._creationDateField] ??= new Date();
    object[this._lastUpdateField] = new Date();

    if (ctx) {
      object.setContext(ctx);
    }
    await this.emitSync("Store.Save", <EventStoreSave>{
      object: object,
      store: this,
      context: ctx
    });
    // Handle object auto listener
    await object._onSave();
    this.metrics.save++;
    let res = await this._save(object);
    await this._cacheStore?._save(object);
    object = this.initModel(res);
    await this.emitSync("Store.Saved", <EventStoreSaved>{
      object: object,
      store: this,
      context: ctx
    });
    await object._onSaved();

    return object;
  }

  /**
   * Patch an object
   *
   * @param object
   * @param reverseMap
   * @returns
   */
  async patch(
    object: Partial<T>,
    reverseMap = true,
    conditionField?: string | null,
    conditionValue?: any
  ): Promise<T | undefined> {
    return this.update(object, reverseMap, true, conditionField, conditionValue);
  }

  /**
   * Check if an UpdateCondition is met
   * @param model
   * @param conditionField
   * @param condition
   * @param uid
   */
  checkUpdateCondition(model: T, conditionField?: string, condition?: any, uid?: string) {
    if (conditionField) {
      // Add toString to manage Date object
      if (model[conditionField].toString() !== condition.toString()) {
        throw new UpdateConditionFailError(uid ? uid : model.getUuid(), conditionField, condition);
      }
    }
  }

  /**
   * Check if an UpdateCondition is met
   * @param model
   * @param conditionField
   * @param condition
   * @param uid
   */
  checkCollectionUpdateCondition(
    model: T,
    collection: string,
    conditionField?: string,
    condition?: any,
    index?: number
  ) {
    // No index so addition to collection
    if (index === null) {
      // The condition must be length of the collection
      if (!model[collection] || model[collection].length !== condition) {
        throw new UpdateConditionFailError(model.getUuid(), collection, condition);
      }
    } else if (condition && model[collection][index][conditionField] !== condition) {
      throw new UpdateConditionFailError(model.getUuid(), `${collection}[${index}].${conditionField}`, condition);
    }
  }

  /**
   * Update conditionally
   * @param uuid
   * @param updates
   * @param conditionField
   * @param condition
   */
  async conditionalPatch(uuid: string, updates: any, conditionField, condition): Promise<boolean> {
    try {
      await this._patch(updates, uuid, condition, conditionField);
      await this._cacheStore?.patch({ uuid, ...updates });
      return true;
    } catch (err) {
      if (err instanceof UpdateConditionFailError) {
        return false;
      }
      throw err;
    }
  }

  /**
   *
   * @param model
   * @param prop
   * @param item
   * @param index
   * @param itemWriteCondition
   * @param itemWriteConditionField
   * @param updateDate
   */
  async simulateUpsertItemToCollection(
    model: T,
    prop: string,
    item: any,
    updateDate: Date,
    index?: number,
    itemWriteCondition?: any,
    itemWriteConditionField?: string
  ) {
    if (prop === "__proto__") {
      throw new Error("Cannot update __proto__: js/prototype-polluting-assignment");
    }
    this.checkCollectionUpdateCondition(model, prop, itemWriteConditionField, itemWriteCondition, index);
    if (index === undefined) {
      if (model[prop] === undefined) {
        model[prop] = [item];
      } else {
        model[prop].push(item);
      }
    } else {
      model[prop][index] = item;
    }
    model[this._lastUpdateField] = updateDate;
    await this._save(model);
  }

  /**
   * Update an object
   *
   * If no attribute can be updated then return undefined
   *
   * @param {Object} Object to save
   * @param {Boolean} reverseMap internal use only, for disable map resolution
   * @return {Promise} with saved object
   */
  async update(
    object: any,
    reverseMap = true,
    partial = false,
    conditionField?: string | null,
    conditionValue?: any
  ): Promise<T | undefined> {
    /** @ignore */
    let saved;
    let loaded;
    // Dont allow to update collections from map
    if (this._reverseMap != undefined && reverseMap) {
      for (let i in this._reverseMap) {
        if (object[this._reverseMap[i].property] != undefined) {
          delete object[this._reverseMap[i].property];
        }
      }
    }
    if (Object.keys(object).length < 2) {
      return undefined;
    }

    object[this._lastUpdateField] = new Date();
    this.metrics.get++;
    let load = await this._getFromCache(object[this._uuidField], true);
    if (load.__type !== this._model.name && this.parameters.strict) {
      this.log("WARN", `Object '${object[this._uuidField]}' was not created by this store`);
      throw new StoreNotFoundError(object[this._uuidField], this.getName());
    }
    loaded = this.initModel(load);
    if (object instanceof CoreModel) {
      loaded.setContext(object.getContext());
    }
    if (partial) {
      await this.emitSync(`Store.PatchUpdate`, {
        object: loaded,
        store: this,
        update: object
      });
    } else {
      await this.emitSync(`Store.Update`, {
        object: loaded,
        store: this,
        update: object
      });
    }

    await loaded._onUpdate(object);
    let res: any;
    if (conditionField !== null) {
      conditionField ??= this._lastUpdateField;
      conditionValue ??= load[conditionField];
    }
    if (partial) {
      this.metrics.partialUpdate++;
      await this._patch(object, object[this._uuidField], conditionValue, conditionField);
      await this._cacheStore?._patch(
        object,
        object[this._uuidField],
        load[this._lastUpdateField],
        this._lastUpdateField
      );
      res = object;
    } else {
      // Copy back the mappers
      for (let i in this._reverseMap) {
        object[this._reverseMap[i].property] = loaded[this._reverseMap[i].property];
      }
      object = this.initModel(object);
      this.metrics.update++;
      res = await this._update(object, object[this._uuidField], conditionValue, conditionField);
      await this._cacheStore?._update(
        object,
        object[this._uuidField],
        load[this._lastUpdateField],
        this._lastUpdateField
      );
    }
    // Return updated
    for (let i in res) {
      loaded[i] = res[i];
    }
    for (let i in object) {
      loaded[i] = object[i];
    }
    saved = this.initModel(loaded);
    if (partial) {
      await this.emitSync(`Store.PatchUpdated`, {
        object: saved,
        store: this
      });
    } else {
      await this.emitSync(`Store.Updated`, {
        object: saved,
        store: this
      });
    }

    await saved._onUpdated();
    return saved;
  }

  /**
   * Remove an attribute from an object
   *
   * @param uuid
   * @param attribute
   * @returns
   */
  async removeAttribute(uuid: string, attribute: string, itemWriteCondition?: any, itemWriteConditionField?: string) {
    this.metrics.attributeDelete++;
    await this._removeAttribute(uuid, attribute, itemWriteCondition, itemWriteConditionField);
    await this._cacheStore?._removeAttribute(uuid, attribute, itemWriteCondition, itemWriteConditionField);
    await this.emitSync("Store.PartialUpdated", <EventStorePartialUpdated>{
      object_id: uuid,
      partial_update: {
        deleteAttribute: attribute
      }
    });
  }

  /**
   * Cascade delete a related object
   *
   * @param obj
   * @param uuid
   * @returns
   */
  async cascadeDelete(obj: CoreModel, _uuid: string): Promise<any> {
    // We dont need uuid but Binary store will need it
    return this.delete(obj.getUuid());
  }

  /**
   * Delete an object from the store without condition nor async
   * @param uid to delete
   * @returns
   */
  async forceDelete(uid: string): Promise<void> {
    return this.delete(uid, undefined, undefined, true);
  }

  /**
   * Delete an object
   *
   * @param {String} uuid to delete
   * @param {Boolean} delete sync even if asyncDelete is active
   * @return {Promise} the deletion promise
   */
  async delete(
    uid: string | T,
    writeCondition?: any,
    writeConditionField?: string,
    sync: boolean = false
  ): Promise<void> {
    /** @ignore */
    let to_delete: T;
    // Allow full object or just its uuid
    if (typeof uid === "object") {
      to_delete = uid;
    } else {
      this.metrics.get++;
      to_delete = await this._getFromCache(uid);
      if (to_delete === undefined) {
        return;
      }
      if (to_delete.__type !== this._model.name && this.parameters.strict) {
        this.log("WARN", `Object '${uid}' was not created by this store`);
        return;
      }
      to_delete = this.initModel(to_delete);
    }

    // Check condition as we have the object
    if (writeCondition) {
      if (to_delete[writeConditionField] !== writeCondition) {
        throw new UpdateConditionFailError(to_delete.getUuid(), writeConditionField, writeCondition);
      }
    }
    // Send preevent
    await this.emitSync("Store.Delete", <EventStoreDelete>{
      object: to_delete,
      store: this
    });
    await to_delete._onDelete();

    // If async we just tag the object as deleted
    if (this.parameters.asyncDelete && !sync) {
      this.metrics.partialUpdate++;
      await this._patch(
        {
          __deleted: true
        },
        to_delete.getUuid()
      );
      await this._cacheStore?._patch(
        {
          __deleted: true
        },
        to_delete.getUuid()
      );
    } else {
      this.metrics.delete++;
      // Delete from the DB for real
      await this._delete(to_delete.getUuid(), writeCondition, writeConditionField);
      await this._cacheStore?._delete(to_delete.getUuid(), writeCondition, writeConditionField);
    }

    // Send post event
    await this.emitSync("Store.Deleted", <EventStoreDeleted>{
      object: to_delete,
      store: this
    });
    await to_delete._onDeleted();
  }

  /**
   * By default we cannot know if the store will trigger or not
   *
   * @param id
   * @param callback
   */
  canTriggerConfiguration(_id: string, _callback: () => void) {
    return false;
  }

  /**
   * Provide a way to store configuration in store
   * @param {string} id
   * @returns {Promise<Map<string, any>>}
   */
  async getConfiguration(id: string): Promise<{ [key: string]: any }> {
    this.metrics.get++;
    let object = await this._getFromCache(id);
    if (!object) {
      return undefined;
    }
    let result: { [key: string]: any } = {};
    for (let i in object) {
      if (i === this._uuidField || i === this._lastUpdateField || i.startsWith("_")) {
        continue;
      }
      result[i] = object[i];
    }
    return result;
  }

  /**
   * Upsert the uuid object
   * @param uuid
   * @param data
   */
  async put(uuid: string, data: any): Promise<T> {
    if (await this.exists(uuid)) {
      return this.update({ ...data, uuid });
    }
    return this.save({ ...data, uuid });
  }

  /**
   * Get an object
   *
   * @param {String} uuid to get
   * @return {Promise} the object retrieved ( can be undefined if not found )
   */
  async get(uid: string, ctx: Context = undefined, defaultValue: any = undefined): Promise<T> {
    /** @ignore */
    if (!uid) {
      return undefined;
    }
    this.metrics.get++;
    let object = await this._getFromCache(uid);
    if (!object) {
      return defaultValue ? this.initModel(defaultValue) : undefined;
    }
    if (object.__type !== this._model.name && this.parameters.strict) {
      this.log("WARN", `Object '${uid}' was not created by this store`);
      return undefined;
    }
    object = this.initModel(object);
    object.setContext(ctx);
    await this.emitSync("Store.Get", <EventStoreGet>{
      object: object,
      store: this,
      context: ctx
    });
    await object._onGet();
    return object;
  }

  /**
   * Set one attribute in an object
   *
   * this is an helper function that calls patch
   *
   * @param uid of the object
   * @param property to update1
   * @param value new value
   * @returns
   */
  async setAttribute(uid: string, property: string, value: any): Promise<void> {
    let patch: any = {};
    patch[property] = value;
    patch[this.getUuidField()] = uid;
    await this.patch(patch);
  }

  /**
   * @override
   */
  protected async simulateFind(query: WebdaQL.Query, uuids: string[]): Promise<StoreFindResult<T>> {
    let result: StoreFindResult<T> = {
      results: [],
      continuationToken: undefined,
      filter: true
    };
    let count = 0;
    let limit = query.limit;
    let offset = parseInt(query.continuationToken || "0");
    let originalOffset = offset;

    if (query.orderBy && query.orderBy.length) {
      offset = 0;
      // We need to retrieve everything to orderBy after
      limit = Number.MAX_SAFE_INTEGER;
    }
    // Need to transfert to Array
    for (let uuid of uuids) {
      count++;
      // Offset start
      if (offset >= count) {
        continue;
      }
      let obj = await this._getFromCache(uuid);
      if (obj && query.filter.eval(obj)) {
        result.results.push(obj);
        if (result.results.length >= limit) {
          result.continuationToken = count.toString();
          return result;
        }
      }
    }

    // Order by
    if (query.orderBy && query.orderBy.length) {
      // Sorting the results
      result.results.sort((a, b) => {
        let valA, valB;
        for (let orderBy of query.orderBy) {
          let invert = orderBy.direction === "ASC" ? 1 : -1;
          valA = WebdaQL.ComparisonExpression.getAttributeValue(a, orderBy.field.split("."));
          valB = WebdaQL.ComparisonExpression.getAttributeValue(b, orderBy.field.split("."));
          if (valA === valB) {
            continue;
          }
          if (typeof valA === "string") {
            return valA.localeCompare(valB) * invert;
          }
          return (valA < valB ? -1 : 1) * invert;
        }
        return -1;
      });
      result.results = result.results.slice(originalOffset, query.limit + originalOffset);
      if (result.results.length >= query.limit) {
        result.continuationToken = (query.limit + originalOffset).toString();
      }
    }

    return result;
  }

  getOpenApiReplacements() {
    return {
      modelName: this._model.name
    };
  }

  /**
   * Handle POST
   * @param ctx
   */
  @Route(".", ["POST"], false, {
    post: {
      description: "The way to create a new ${modelName} model",
      summary: "Create a new ${modelName}",
      operationId: "create${modelName}",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/${modelName}"
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Retrieve model",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/${modelName}"
              }
            }
          }
        },
        "400": {
          description: "Object is invalid"
        },
        "403": {
          description: "You don't have permissions"
        },
        "409": {
          description: "Object already exists"
        }
      }
    }
  })
  async httpCreate(ctx: Context) {
    let body = await ctx.getRequestBody();
    let object = this._model.factory(this._model, body, ctx);
    object[this._creationDateField] = new Date();
    await object.canAct(ctx, "create");
    try {
      await object.validate(ctx, body);
    } catch (err) {
      this.log("INFO", "Object is not valid", err);
      throw 400;
    }
    if (object[this._uuidField] && (await this.exists(object[this._uuidField]))) {
      throw 409;
    }
    await this.save(object, ctx);
    ctx.write(object);
    await this.emitSync("Store.WebCreate", <EventStoreWebCreate>{
      context: ctx,
      values: body,
      object: object,
      store: this
    });
  }

  /**
   * Handle obect action
   * @param ctx
   */
  async httpAction(ctx: Context) {
    let action = ctx.getHttpContext().getUrl().split("/").pop();
    let object = await this.get(ctx.parameter("uuid"), ctx);
    if (object === undefined || object.__deleted) {
      throw 404;
    }
    await object.canAct(ctx, action);
    await this.emitSync("Store.Action", <EventStoreAction>{
      action: action,
      object: object,
      store: this,
      context: ctx
    });
    let res = await object["_" + action](ctx);
    if (res) {
      ctx.write(res);
    }
    await this.emitSync("Store.Actioned", <EventStoreActioned>{
      action: action,
      object: object,
      store: this,
      context: ctx,
      result: res
    });
  }

  /**
   * Handle collection action
   * @param ctx
   */
  async httpGlobalAction(ctx: Context) {
    let action = ctx.getHttpContext().getUrl().split("/").pop();
    await this.emitSync("Store.Action", <EventStoreAction>{
      action: action,
      store: this,
      context: ctx
    });
    let res = await this._model["_" + action](ctx);
    if (res) {
      ctx.write(res);
    }
    await this.emitSync("Store.Actioned", <EventStoreActioned>{
      action: action,
      store: this,
      context: ctx,
      result: res
    });
  }

  /**
   * Handle HTTP Update for an object
   *
   * @param ctx context of the request
   */
  @Route("./{uuid}", ["PUT", "PATCH"], false, {
    put: {
      description: "Update a ${modelName} if the permissions allow",
      summary: "Update a ${modelName}",
      operationId: "update${modelName}",
      schemas: {
        input: "${modelName}",
        output: "${modelName}"
      },
      responses: {
        "200": {},
        "400": {
          description: "Object is invalid"
        },
        "403": {
          description: "You don't have permissions"
        },
        "404": {
          description: "Unknown object"
        }
      }
    },
    patch: {
      description: "Patch a ${modelName} if the permissions allow",
      summary: "Patch a ${modelName}",
      operationId: "partialUpdatet${modelName}",
      schemas: {
        input: "${modelName}"
      },
      responses: {
        "204": {
          description: ""
        },
        "400": {
          description: "Object is invalid"
        },
        "403": {
          description: "You don't have permissions"
        },
        "404": {
          description: "Unknown object"
        }
      }
    }
  })
  async httpUpdate(ctx: Context) {
    let body = await ctx.getRequestBody();
    let uuid = ctx.parameter("uuid");
    body[this._uuidField] = uuid;
    let object = await this.get(uuid, ctx);
    if (!object || object.__deleted) throw 404;
    await object.canAct(ctx, "update");
    if (ctx.getHttpContext().getMethod() === "PATCH") {
      try {
        await object.validate(ctx, body);
      } catch (err) {
        this.log("INFO", "Object invalid", err);
        throw 400;
      }
      let updateObject: any = new this._model();
      // Clean any default attributes from the model
      Object.keys(updateObject)
        .filter(i => i !== "__class")
        .forEach(i => {
          delete updateObject[i];
        });
      updateObject.setContext(ctx);
      updateObject.load(body);
      await this.patch(updateObject);
      object = undefined;
    } else {
      let updateObject: any = new this._model();
      updateObject.load(body);
      // Copy back the _ attributes
      Object.keys(object)
        .filter(i => i.startsWith("_"))
        .forEach(i => {
          updateObject[i] = object[i];
        });
      try {
        await updateObject.validate(ctx, body);
      } catch (err) {
        this.log("INFO", "Object invalid", err);
        throw 400;
      }

      // Add mappers back to
      object = await this.update(updateObject);
    }
    ctx.write(object);
    await this.emitSync("Store.WebUpdate", <EventStoreWebUpdate>{
      context: ctx,
      updates: body,
      object: object,
      store: this,
      method: ctx.getHttpContext().getMethod()
    });
  }

  /**
   * Handle GET on object
   *
   * @param ctx context of the request
   */
  @Route("./{uuid}", ["GET"], false, {
    get: {
      description: "Retrieve ${modelName} model if permissions allow",
      summary: "Retrieve a ${modelName}",
      operationId: "get${modelName}",
      schemas: {
        output: "${modelName}"
      },
      responses: {
        "200": {},
        "400": {
          description: "Object is invalid"
        },
        "403": {
          description: "You don't have permissions"
        },
        "404": {
          description: "Unknown object"
        }
      }
    }
  })
  async httpGet(ctx: Context) {
    let uuid = ctx.parameter("uuid");
    let object = await this.get(uuid, ctx);
    await this.emitSync("Store.WebGetNotFound", <EventStoreWebGetNotFound>{
      context: ctx,
      uuid,
      store: this
    });
    if (object === undefined || object.__deleted) {
      throw 404;
    }
    await object.canAct(ctx, "get");
    ctx.write(object);
    await this.emitSync("Store.WebGet", <EventStoreWebGet>{
      context: ctx,
      object: object,
      store: this
    });
    ctx.write(object);
  }

  /**
   * Handle HTTP request
   *
   * @param ctx context of the request
   * @returns
   */
  @Route("./{uuid}", ["DELETE"], false, {
    delete: {
      operationId: "delete${modelName}",
      description: "Delete ${modelName} if the permissions allow",
      summary: "Delete a ${modelName}",
      responses: {
        "204": {
          description: ""
        },
        "403": {
          description: "You don't have permissions"
        },
        "404": {
          description: "Unknown object"
        }
      }
    }
  })
  async httpRoute(ctx: Context) {
    let uuid = ctx.parameter("uuid");
    let object = await this.get(uuid, ctx);
    if (!object || object.__deleted) throw 404;
    await object.canAct(ctx, "delete");
    // http://stackoverflow.com/questions/28684209/huge-delay-on-delete-requests-with-204-response-and-no-content-in-objectve-c#
    // IOS don't handle 204 with Content-Length != 0 it seems
    // Have trouble to handle the Content-Length on API Gateway so returning an empty object for now
    ctx.write({});
    await this.delete(uuid);
    await this.emitSync("Store.WebDelete", <EventStoreWebDelete>{
      context: ctx,
      object_id: uuid,
      store: this
    });
  }

  /**
   * Return the model uuid field
   */
  getUuidField(): string {
    return this._uuidField;
  }

  /**
   * Search within the store
   */
  abstract find(query: WebdaQL.Query): Promise<StoreFindResult<T>>;

  /**
   * Check if an object exists
   * @abstract
   * @params {String} uuid of the object
   */
  abstract exists(uid: string): Promise<boolean>;

  /**
   * The underlying store should recheck writeCondition only if it does not require
   * another get()
   *
   * @param uid
   * @param writeCondition
   * @param itemWriteConditionField
   */
  abstract _delete(uid: string, writeCondition?: any, itemWriteConditionField?: string): Promise<void>;

  /**
   * Retrieve an element from the store
   *
   * @param uid to retrieve
   * @param raiseIfNotFound raise an StoreNotFound exception if not found
   */
  abstract _get(uid: string, raiseIfNotFound?: boolean): Promise<T>;

  /**
   * Get an object
   *
   * @param {Array} uuid to gets if undefined then retrieve the all table
   * @return {Promise} the objects retrieved ( can be [] if not found )
   */
  abstract getAll(list?: string[]): Promise<T[]>;

  abstract _update(object: any, uid: string, itemWriteCondition?: any, itemWriteConditionField?: string): Promise<any>;

  abstract _patch(object: any, uid: string, itemWriteCondition?: any, itemWriteConditionField?: string): Promise<any>;

  abstract _removeAttribute(
    uuid: string,
    attribute: string,
    itemWriteCondition?: any,
    itemWriteConditionField?: string
  ): Promise<void>;

  /**
   * Save within the store
   * @param object
   */
  abstract _save(object: T): Promise<any>;

  /**
   * Increment the attribute
   * @param uid
   * @param prop
   * @param value
   * @param updateDate
   */
  abstract _incrementAttribute(uid: string, prop: string, value: number, updateDate: Date): Promise<any>;

  abstract _upsertItemToCollection(
    uid: string,
    prop: string,
    item: any,
    index: number,
    itemWriteCondition: any,
    itemWriteConditionField: string,
    updateDate: Date
  ): Promise<any>;

  abstract _deleteItemFromCollection(
    uid: string,
    prop: string,
    index: number,
    itemWriteCondition: any,
    itemWriteConditionField: string,
    updateDate: Date
  ): Promise<any>;
}

export { Store };
