import bcrypt from "bcryptjs";
import { Counter, EventWithContext } from "../core";
import { Ident } from "../models/ident";
import { User } from "../models/user";
import { Inject, Route, Service, ServiceParameters } from "../services/service";
import { Store } from "../stores/store";
import { OperationContext, WebContext } from "../utils/context";
import { HttpContext, HttpMethodType } from "../utils/httpcontext";
import CryptoService from "./cryptoservice";
import { Mailer } from "./mailer";

/**
 * Emitted when the /me route is called
 */
export interface EventAuthenticationGetMe extends EventWithContext {
  user: User;
}

/**
 * Emitted when new user registered
 */
export interface EventAuthenticationRegister extends EventAuthenticationGetMe {
  data: any;
  identId: string;
}

/**
 * Emitted when user logout
 */
export interface EventAuthenticationLogout extends EventWithContext {}

/**
 * Sent when a user update his password
 */
export interface EventAuthenticationPasswordUpdate extends EventAuthenticationGetMe {
  password: string;
}

/**
 * Emitted when user login
 */
export interface EventAuthenticationLogin extends EventWithContext {
  userId: string;
  user?: User;
  identId: string;
  ident: Ident;
}

/**
 * Export when a user failed to authenticate with his password
 */
export interface EventAuthenticationLoginFailed extends EventAuthenticationGetMe {}

/**
 * Implement a PasswordVerifier so you can implement
 * your own rules
 */
export interface PasswordVerifier extends Service {
  /**
   * If the password is not valid, send a 400 exception or
   * return false
   *
   * @param password to verify
   * @param user to verify from
   */
  validate(password: string, user?: User): Promise<boolean>;
}

/**
 * Information required to reset a password
 */
export interface PasswordRecoveryInfos {
  /**
   * Links are short lived
   */
  expire: number;
  /**
   * Generated token
   */
  token: string;
  /**
   * Login to reset password fors
   */
  login: string;
}

interface PasswordRecoveryBody extends PasswordRecoveryInfos {
  /**
   * Password to set
   */
  password: string;
}

/**
 * Login info
 *
 * If register = true, you can add many other information
 *
 * @SchemaAdditionalProperties
 */
interface LoginBody {
  login: string;
  register?: boolean;
  token?: string;
  email?: string;
  password?: string;
}

export class AuthenticationParameters extends ServiceParameters {
  /**
   * Idents store for authentication identifiers
   *
   * @default "idents"
   */
  identStore?: string;
  /**
   * User store for authentication users
   *
   * @default "users"
   */
  userStore?: string;
  /**
   * @default "/auth"
   */
  url?: string;
  /**
   * Enable the email authentication
   */
  email?: {
    /**
     * Mailer service name
     */
    mailer?: string;
    /**
     * Allow user to create their account without validating their email first
     */
    postValidation: boolean;
    /**
     * Do not even validate the email at all
     */
    skipEmailValidation: boolean;
    /**
     * Minimal delay between two password recovery or validation email
     *
     * @default 3600000 * 4
     */
    delay: number;
    /**
     * When a delay is added between two attempt to authenticate
     *
     * @default 3
     */
    failedLoginBeforeDelay: number;
  };
  password: {
    /**
     * Password verifier Service name
     */
    verifier?: string;
    /**
     * Regexp that password must check
     * @default "{8,}"
     */
    regexp?: string;
  };
  /**
   * Number of salt iteration for bcrypt.hashSync
   */
  salt: string;
  /**
   * Redirect to this page when email validation failed
   */
  failureRedirect: string;
  /**
   * Redirect to this page when email validation succeed
   */
  successRedirect: string;
  /**
   * Redirect to this page once email is validate to finish the registration process
   */
  registerRedirect: string;

  constructor(params: any) {
    super(params);
    this.identStore ??= "idents";
    this.userStore ??= "users";
    this.url ??= "/auth";
    this.password ??= {
      regexp: ".{8,}"
    };
    if (this.email) {
      this.email.delay ??= 3600000 * 4;
      this.email.failedLoginBeforeDelay ??= 3;
    }
  }
}

export type AuthenticationEvents = {
  "Authentication.GetMe": EventAuthenticationGetMe;
  "Authentication.Register": EventAuthenticationRegister;
  "Authentication.PasswordUpdate": EventAuthenticationPasswordUpdate;
  "Authentication.Logout": EventAuthenticationLogout;
  "Authentication.Login": EventAuthenticationLogin;
  "Authentication.LoginFailed": EventAuthenticationLoginFailed;
  "Authentication.PasswordCreate": EventAuthenticationPasswordUpdate;
};

/**
 * This class is known as the Authentication module
 * It handles OAuth for several providers for now (Facebook, Google, Amazon, GitHub and Twitter)
 * It also handles email authentication with prevalidation or postvalidation of the email
 *
 * It requires two Store to work one `idents` and one `users`
 *
 * The parameters are
 * ```
 *   providerName: {
 *     clientID: '...',
 *     clientSecret: '...',
 *     scope: ''
 *   },
 *   email: {
 *	    postValidation: true|false   // If postValidation=true, account created without email verification
 *   }
 *   url: 'url' // By default /auth
 * ```
 *
 * @category CoreServices
 * @WebdaModda
 */

class Authentication<
  T extends AuthenticationParameters = AuthenticationParameters,
  E extends AuthenticationEvents = AuthenticationEvents
> extends Service<T, E> {
  @Inject("identStore", "idents")
  _identsStore: Store<Ident>;
  @Inject("userStore", "users")
  _usersStore: Store<User>;
  /**
   * Used for hmac
   */
  @Inject("CryptoService")
  cryptoService: CryptoService;
  _passwordVerifier: PasswordVerifier;
  providers: Set<string> = new Set<string>();

  metrics: {
    login: Counter;
    logout: Counter;
    loginFailed?: Counter;
    recovery?: Counter;
    recovered?: Counter;
    registration?: Counter;
  };

  /**
   * Load the parameters for a service
   */
  loadParameters(params: any): AuthenticationParameters {
    return new AuthenticationParameters(params);
  }

  /**
   * Get the user store
   * @returns
   */
  getUserStore<K extends User = User>(): Store<K> {
    return <Store<K>>this._usersStore;
  }

  /**
   * Get the user store
   * @returns
   */
  getIdentStore<K extends Ident = Ident>(): Store<K> {
    return <Store<K>>this._identsStore;
  }

  setIdents(identStore) {
    this._identsStore = identStore;
  }

  setUsers(userStore) {
    this._usersStore = userStore;
  }

  /**
   * @ignore
   * Setup the default routes
   */
  computeParameters(): void {
    super.computeParameters();

    if (this.parameters.password.verifier) {
      this._passwordVerifier = this.getService<PasswordVerifier>(this.parameters.password.verifier);
    }

    if (this.parameters.email && this.getMailMan() === undefined) {
      throw Error("email authentication requires a Mailer service");
    }
    // Add email provider
    if (this.parameters.email) {
      this.addProvider("email");
      this.addRoute("./email/{email}/recover", ["GET"], this._passwordRecoveryEmail, {
        get: {
          description: "The password reset process will be start",
          summary: "Start password recovery",
          operationId: "startEmailRecovery",
          responses: {
            "204": {
              description: ""
            },
            "404": {
              description: "Email does not exist"
            },
            "429": {
              description: "Recovery has been initiated in the last 4 hours"
            }
          }
        }
      });
      this.addRoute("./email/passwordRecovery", ["POST"], this._passwordRecovery, {
        post: {
          schemas: {
            input: {
              type: "object",
              properties: {
                token: {
                  type: "string"
                },
                expire: {
                  type: "number"
                },
                password: {
                  type: "string"
                },
                login: {
                  type: "string"
                }
              }
            }
          },
          description: "Reinit the password if we have the right token, expire",
          summary: "Reinit password",
          operationId: "reinitPassword",
          responses: {
            "204": {
              description: ""
            },
            "403": {
              description: "Wrong Token"
            }
          }
        }
      });
      this.addRoute("./email", ["POST"], this._handleEmail, {
        post: {
          description: "Authenticate with an email and password",
          summary: "Authenticate with email",
          operationId: `authWithEmail`
        }
      });
    }
  }

  /**
   * @override
   */
  initMetrics(): void {
    super.initMetrics();
    this.metrics.login = this.getMetric(Counter, {
      name: "auth_login",
      help: "Counter number of login per provider",
      labelNames: ["provider"]
    });
    this.metrics.logout = this.getMetric(Counter, {
      name: "auth_logout",
      help: "Counter number of logout"
    });
    this.metrics.registration = this.getMetric(Counter, {
      name: "auth_registration",
      help: "Counter number of registration per provider",
      labelNames: ["provider"]
    });
    if (this.parameters.email) {
      this.metrics.loginFailed = this.getMetric(Counter, {
        name: "auth_login_failed",
        help: "Counter number of login failed with password"
      });
      this.metrics.recovery = this.getMetric(Counter, {
        name: "auth_login_recovery",
        help: "Counter number of password lost process initiated"
      });
      this.metrics.recovered = this.getMetric(Counter, {
        name: "auth_login_recovered",
        help: "Counter number of password lost process successful"
      });
    }
  }

  /**
   * Add a provider to the oauth scheme
   * @param name
   */
  addProvider(name: string) {
    this.providers.add(name);
  }

  /**
   * Ensure email is enabled for all emails routes
   * @override
   */
  getUrl(url: string, methods: HttpMethodType[]) {
    if (url.startsWith("./emails") && !this.parameters.email) {
      return undefined;
    }
    return super.getUrl(url, methods);
  }

  /**
   * Send or resend an email to validate the email address
   *
   * @param ctx
   * @throws 409 if ident is linked to someone else
   * @throws 412 if the email is already validated
   * @throws 429 if a validation email has been sent recently
   */
  @Route("./email/{email}/validate", ["GET"], false, {
    get: {
      description: "The email validation process will be start",
      summary: "Restart email validation",
      operationId: "startEmailRecovery",
      responses: {
        "204": {
          description: ""
        },
        "409": {
          description: "Email already verified for another user"
        },
        "412": {
          description: "Email already verified for current user"
        },
        "429": {
          description: "Validation has been initiated in the last 4 hours"
        }
      }
    }
  })
  async _sendEmailValidation(ctx) {
    let identKey = ctx.parameters.email + "_email";
    let ident = await this._identsStore.get(identKey);
    if (!ident) {
      await this._identsStore.save({
        uuid: `${ctx.parameters.email}_email`,
        _lastValidationEmail: Date.now(),
        _type: "email"
      });
    } else {
      // If the ident is linked to someone else - might want to remove it
      if (ident.getUser() !== ctx.getCurrentUserId()) {
        throw 409;
      }
      // If the email is already validated
      if (ident._validation) {
        throw 412;
      }
      //
      if (ident._lastValidationEmail >= Date.now() - this.parameters.email.delay) {
        throw 429;
      }
      await this._identsStore.patch({
        _lastValidationEmail: Date.now(),
        uuid: identKey
      });
    }
    await this.sendValidationEmail(ctx, ctx.parameters.email);
  }

  /**
   * Return current user
   * @param ctx
   */
  @Route("./me", ["GET"], false, {
    get: {
      description: "Retrieve the current user from the session",
      summary: "Get current user",
      operationId: "getCurrentUser"
    }
  })
  async _getMe(ctx: OperationContext) {
    let user = await ctx.getCurrentUser();
    if (user === undefined) {
      throw 404;
    }
    await this.emitSync("Authentication.GetMe", <EventAuthenticationGetMe>{
      context: ctx,
      user
    });
    ctx.write(user);
  }

  /**
   * Handle both list of available authentication
   * and logout with method 'DELETE'
   *
   * @param ctx
   * @returns
   */
  @Route(".", ["GET", "DELETE"], false, {
    get: {
      description: "Retrieve the list of available authentication",
      summary: "Get available auths",
      operationId: `getAuthenticationMethods`,
      responses: {
        "200": {
          description: "List of authentication"
        }
      }
    },
    delete: {
      description: "Logout current user",
      summary: "Logout",
      operationId: `logout`,
      responses: {
        "200": {}
      }
    }
  })
  async _listAuthentications(ctx: WebContext) {
    if (ctx.getHttpContext().getMethod() === "DELETE") {
      await this.logout(ctx);
      this.metrics.logout.inc();
      ctx.write("GoodBye");
      return;
    }
    ctx.write(Array.from(this.providers));
  }

  async onIdentLogin(ctx: WebContext, provider: string, identId: string, profile: any, tokens: any = undefined) {
    // Auto postifx with provider name
    const postfix = `_${provider}`;
    if (!identId.endsWith(postfix)) {
      identId += postfix;
    }

    let ident: Ident = await this._identsStore.get(identId);
    // Ident is known
    if (ident) {
      await this.login(ctx, ident.getUser(), ident, provider);
      await this._identsStore.patch({
        _lastUsed: new Date(),
        __tokens: tokens,
        uuid: ident.uuid
      });
      // Redirect to?
      return;
    }
    let user;
    if (profile.email) {
      ident = await this._identsStore.get(`${profile.email}_email`);
    }
    // If already login
    if (ctx.getCurrentUserId()) {
      user = await ctx.getCurrentUser();
    } else {
      // If an email in profile try to find the ident
      if (ident) {
        user = await this._usersStore.get(ident.getUser());
      }

      if (!user) {
        // If no user, register a new user automatically
        user = await this.registerUser(ctx, profile, identId);
        await this._usersStore.save(user);
      }
    }
    if (profile.email && !ident) {
      // Save additional email
      ident = this._identsStore.newModel({
        uuid: `${profile.email}_email`,
        provider: "email"
      });
      ident.setUser(user.getUuid());
      await ident.save(true);
    }
    // Work directly on ident argument
    ident = this._identsStore.newModel({
      uuid: identId,
      profile,
      __tokens: tokens,
      provider
    });
    ident.setUser(user.uuid);
    ident._lastUsed = new Date();
    ident.setType(provider);
    await ident.save(true);
    ident.__new = true;
    await this.login(ctx, user, ident, provider);
  }

  /**
   * Create a new User with the link ident
   * @param ident
   */
  async createUserWithIdent(provider: string, identId: string, profile: any = {}) {
    if (await this._identsStore.exists(`${identId}_${provider}`)) {
      throw new Error("Ident is already known");
    }
    let ctx = await this._webda.newWebContext(new HttpContext("fake", "GET", "/"));
    // Pretend we logged in with the ident
    await this.onIdentLogin(ctx, provider, identId, profile);
  }

  async registerUser(
    ctx: WebContext,
    data: any,
    identId: string,
    user: any = this._usersStore.newModel()
  ): Promise<any> {
    user.email = data.email;
    user.locale = ctx.getLocale();
    this.metrics.registration.inc();
    await this.emitSync("Authentication.Register", <EventAuthenticationRegister>{
      user: user,
      data: data,
      context: ctx,
      identId
    });
    return user;
  }

  async getPasswordRecoveryInfos(
    uuid: string | User,
    interval = this.parameters.email.delay
  ): Promise<PasswordRecoveryInfos> {
    const expire = Date.now() + interval;
    let user;
    if (typeof uuid === "string") {
      user = await this._usersStore.get(uuid);
    } else {
      user = uuid;
    }
    if (!user) {
      return undefined;
    }
    return {
      expire: expire,
      // Might want to add more alea not coming from the db to avoid exploitation of stolen db
      token: await this.cryptoService.hmac(user.uuid + expire + user.getPassword()),
      login: user.uuid
    };
  }

  /**
   * Manage password recovery
   * @param ctx
   */
  async _passwordRecoveryEmail(ctx: WebContext) {
    let email = ctx.parameter("email");
    let ident: Ident = await this._identsStore.get(email + "_email");
    if (!ident) {
      throw 404;
    }
    let user: User = await this._usersStore.get(ident.getUser());
    // Dont allow to do too many request
    if (!user.lastPasswordRecoveryBefore(Date.now() - this.parameters.email.delay)) {
      throw 429;
    }
    await this._usersStore.patch(
      {
        _lastPasswordRecovery: Date.now(),
        uuid: user.uuid
      },
      true,
      null
    );
    this.metrics.recovery.inc();
    await this.sendRecoveryEmail(ctx, user, email);
  }

  async _verifyPassword(password: string, user?: User) {
    if (this._passwordVerifier) {
      if (!(await this._passwordVerifier.validate(password, user))) {
        throw 400;
      }
      return;
    }
    let regexp = new RegExp(this.parameters.password.regexp);
    if (regexp.exec(password) === null) {
      throw 400;
    }
  }

  async _passwordRecovery(ctx: WebContext<PasswordRecoveryBody>) {
    let body = await ctx.getRequestBody();
    if (
      body.password === undefined ||
      body.login === undefined ||
      body.token === undefined ||
      body.expire === undefined
    ) {
      throw 400;
    }
    let user: User = await this._usersStore.get(body.login.toLowerCase());
    if (!user) {
      throw 403;
    }
    if (
      !(await this.cryptoService.hmacVerify(body.login.toLowerCase() + body.expire + user.getPassword(), body.token))
    ) {
      throw 403;
    }
    if (body.expire < Date.now()) {
      throw 410;
    }
    await this._verifyPassword(body.password, user);
    let password = this.hashPassword(body.password);
    await this._usersStore.patch(
      {
        __password: password,
        uuid: body.login.toLowerCase()
      },
      true,
      null
    );
    this.metrics.recovered.inc();
    await this.emitSync("Authentication.PasswordUpdate", <EventAuthenticationPasswordUpdate>{
      user,
      password,
      context: ctx
    });
  }

  /**
   * Callback to validate an email address
   * @param ctx
   * @returns
   */
  @Route("./email/callback{?email,token,user}", ["GET"], false, {
    hidden: true
  })
  async _handleEmailCallback(ctx: WebContext) {
    if (!ctx.parameter("token")) {
      throw 400;
    }
    if (
      !(await this.cryptoService.hmacVerify(
        `${ctx.parameter("email")}_${ctx.parameter("user")}`,
        ctx.parameter("token")
      ))
    ) {
      ctx.writeHead(302, {
        Location: this.parameters.failureRedirect + "?reason=badToken"
      });
      return;
    }

    if (
      ctx.parameter("user") !== ctx.getCurrentUserId() &&
      ctx.getCurrentUserId() !== "" &&
      ctx.getCurrentUserId() !== undefined
    ) {
      ctx.writeHead(302, {
        Location: this.parameters.failureRedirect + "?reason=badUser"
      });
      return;
    }

    if (!ctx.parameter("user")) {
      ctx.writeHead(302, {
        Location: `${this.parameters.registerRedirect}?token=${ctx.parameter("token")}&email=${ctx.parameter("email")}`
      });
      return;
    }

    const uuid = ctx.parameter("email") + "_email";
    let ident = await this._identsStore.get(uuid);
    // Would mean the ident got delete in the mean time... hyper low likely hood
    if (ident === undefined) {
      ident = this._identsStore.newModel({
        uuid
      });
    }
    ident._type = "email";
    ident._validation = new Date();
    ident.setUser(ctx.parameter("user"));
    await ident.save(true);
    ctx.writeHead(302, {
      Location: this.parameters.successRedirect + "?validation=email",
      "X-Webda-Authentication": "success"
    });
  }

  /**
   * Send an email to recover the user password
   *
   * @param ctx
   * @param user
   * @param email
   * @returns
   */
  async sendRecoveryEmail(ctx: WebContext, user, email: string) {
    let infos = await this.getPasswordRecoveryInfos(user);
    const mailer: Mailer = this.getMailMan();
    let locale = user.locale || ctx.getLocale();
    let mailOptions = {
      to: email,
      locale: locale,
      template: "EMAIL_RECOVERY",
      replacements: {
        ...this.parameters.email,
        infos,
        to: email,
        context: ctx
      }
    };
    return mailer.send(mailOptions);
  }

  /**
   * Send an email to validate the user email by sending a unique link to
   * his email
   *
   * @param ctx
   * @param email
   * @returns
   */
  async sendValidationEmail(ctx: WebContext, email: string) {
    const mailer: Mailer = this.getMailMan();
    let replacements = {
      ...this.parameters.email,
      context: ctx,
      url: ctx
        .getHttpContext()
        .getAbsoluteUrl(
          `${this.parameters.url}/email/callback?email=${email}&token=${await this.generateEmailValidationToken(
            ctx.getCurrentUserId(),
            email
          )}`
        )
    };
    let userId = ctx.getCurrentUserId();
    if (userId && userId.length > 0) {
      replacements.url += "&user=" + userId;
    }
    let mailOptions = {
      to: email,
      locale: ctx.getLocale(),
      template: "EMAIL_REGISTER",
      replacements: replacements
    };
    return mailer.send(mailOptions);
  }

  /**
   * Check the password match the stored hash
   * @param hash generate prior by hashPassword
   * @param password as entered by the user
   */
  checkPassword(hash: string, pass: string): boolean {
    return bcrypt.compareSync(pass, hash);
  }

  /**
   * Hash the password according to good practices
   *
   * @param pass to hash
   */
  hashPassword(pass: string): string {
    return bcrypt.hashSync(pass, this.parameters.salt || 10);
  }

  /**
   * Logout user
   */
  async logout(ctx: WebContext) {
    await this.emitSync("Authentication.Logout", <EventAuthenticationLogout>{
      context: ctx
    });
    await ctx.newSession();
  }

  /**
   * Login a user
   *
   * @param ctx
   * @param user
   * @param ident
   * @returns
   */
  async login(ctx: WebContext, user: User | string, ident: Ident, provider: string) {
    const event: EventAuthenticationLogin = {
      context: ctx,
      userId: "",
      identId: ident.uuid,
      ident
    };

    if (typeof user == "object") {
      event.userId = user.uuid;
      event.user = user;
    } else {
      event.userId = user;
    }
    event.context = ctx;

    ctx.getSession().login(event.userId, event.identId);
    this.metrics.login.inc({ provider });
    return this.emitSync("Authentication.Login", event);
  }

  getMailMan(): Mailer {
    return this.getService<Mailer>(this.parameters.email.mailer ? this.parameters.email.mailer : "Mailer");
  }

  /**
   * Handle a user login request
   *
   * @param ctx
   * @param ident
   */
  protected async handleLogin(ctx: WebContext<LoginBody>, ident: Ident) {
    let updates: any = {};
    let user: User = await this._usersStore.get(ident.getUser());
    // Check password
    if (this.checkPassword(user.getPassword(), (await ctx.getRequestBody()).password)) {
      if (ident._failedLogin > 0) {
        ident._failedLogin = 0;
      }
      updates._lastUsed = new Date();
      updates._failedLogin = 0;
      updates.uuid = ident.uuid;

      await this._identsStore.patch(updates, true, null);
      await this.login(ctx, ident.getUser(), ident, "email");
      ctx.write(user);
    } else {
      this.metrics.loginFailed.inc();
      await this.emitSync("Authentication.LoginFailed", <EventAuthenticationLoginFailed>{
        user,
        context: ctx
      });
      ident._failedLogin ??= 0;
      updates._failedLogin = ident._failedLogin + 1;
      updates._lastFailedLogin = new Date();
      updates.uuid = ident.uuid;
      // Swalow exeception issue to double check !
      await this._identsStore.patch(updates, true, null);
      // Allows to auto redirect user to a oauth if needed
      if (!ctx.isEnded()) {
        throw 403;
      }
    }
  }

  /**
   * Handle the POST /auth/email
   *
   * @param ctx
   * @returns
   */
  async _handleEmail(ctx: WebContext<LoginBody>) {
    // If called while logged in reject
    if (ctx.getCurrentUserId() !== undefined) {
      throw 410;
    }

    let body = await ctx.getRequestBody();

    if (body.login === undefined) {
      throw 400;
    }
    const mailConfig = this.parameters.email;
    const uuid = body.login.toLowerCase() + "_email";
    let ident: Ident = await this._identsStore.get(uuid);
    if (ident !== undefined && ident.getUser() !== undefined) {
      // Register on an known user
      if (!body.register) {
        await this.handleLogin(ctx, ident);
        return;
      }
      // If register on a validate email
      if (ident._validation !== undefined) {
        throw 409;
      }
    }

    // TODO Handle add of email on authenticated user
    const email = body.login.toLowerCase();
    // Read the form
    if (body.register) {
      let validation = undefined;
      // Need to check email before creation
      if (!mailConfig.postValidation) {
        if (body.token && (await this.cryptoService.hmacVerify(`${email}_${ctx.getCurrentUserId()}`, body.token))) {
          validation = new Date();
        } else {
          ctx.write({});
          // token is undefined send an email
          return this.sendValidationEmail(ctx, email);
        }
      }
      if (!body.password) {
        throw 400;
      }
      // Store with a _
      let __password = this.hashPassword(body.password);
      await this._verifyPassword(body.password);
      // Remove useless attributes
      delete body.password;
      delete body.register;
      delete body.token;
      let user = await this.registerUser(ctx, {}, uuid, {
        ...body,
        __password
      });
      await this.emitSync("Authentication.PasswordCreate", <EventAuthenticationPasswordUpdate>{
        user,
        password: __password,
        context: ctx
      });
      user = await this._usersStore.save(user);
      const newIdent: any = this._identsStore.newModel({
        uuid: uuid,
        _type: "email",
        email: email
      });
      newIdent.setUser(user.uuid);
      if (validation) {
        newIdent._validation = validation;
      } else if (!mailConfig.skipEmailValidation) {
        newIdent._lastValidationEmail = Date.now();
      }
      ident = await newIdent.save(true);
      await this.login(ctx, user, ident, "email");
      ctx.write(user);
      if (!validation && !mailConfig.skipEmailValidation) {
        await this.sendValidationEmail(ctx, email);
      }
      return;
    }
    throw 404;
  }

  async generateEmailValidationToken(user: string, email: string): Promise<string> {
    return this.cryptoService.hmac(email + "_" + user);
  }
}

export { Authentication };
