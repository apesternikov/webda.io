"use strict";
import * as crypto from "crypto";
import { Core, ModdaDefinition, _extend } from "../core";
import { Ident } from "../models/ident";
import { User } from "../models/user";
import { Service } from "../services/service";
import { Store } from "../stores/store";
import { Context } from "../utils/context";
import { Mailer } from "./mailer";
import { JSONUtils } from "../utils/json";

interface PasswordVerifier extends Service {
  validate(password: string): Promise<void>;
}

class PasswordRecoveryInfos {
  public expire: number;
  public token: string;
  public login: string;
}

/**
 * This class is known as the Authentication module
 * It handles OAuth for several providers for now (Facebook, Google, Amazon, GitHub and Twitter)
 * It also handles email authentication with prevalidation or postvalidation of the email
 *
 * It requires two Store to work one 'idents' and one 'users'
 *
 * The parameters are
 *
 *   providerName: {
 *     clientID: '...',
 *     clientSecret: '...',
 *     scope: ''
 *   },
 *   email: {
 *	    postValidation: true|false   // If postValidation=true, account created without email verification
 *   }
 *   expose: 'url' // By default /auth
 *
 * @category CoreServices
 */
class Authentication extends Service {
  /** @ignore */
  _identsStore: Store<Ident>;
  _usersStore: Store<User>;
  _passwordVerifier: PasswordVerifier;
  _aliases: Map<string, string> = new Map();
  _emailDelay: number;
  // TODO refactor
  _oauth1: any;

  constructor(webda: Core, name: string, params: any) {
    super(webda, name, params);

    this._params.identStore = this._params.identStore || "idents";
    this._params.userStore = this._params.userStore || "users";
    this._params.providers = this._params.providers || {};
    this._params.expose = this._params.expose || "/auth";
  }

  initRoutes() {
    // ROUTES
    let url = this._params.expose;
    // List authentication configured
    this._addRoute(url, ["GET", "DELETE"], this._listAuthentications, {
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
    });
    // Get the current user
    this._addRoute(url + "/me", ["GET"], this._getMe, {
      get: {
        description: "Retrieve the current user from the session",
        summary: "Get current user",
        operationId: "getCurrentUser"
      }
    });
    if (this._params.providers.email) {
      // Add static for email for now, if set before it should have priority
      this._addRoute(url + "/email", ["POST"], this._handleEmail, {
        post: {
          description: "Authenticate with an email and password",
          summary: "Authenticate with email",
          operationId: `authWithEmail`
        }
      });
      this._addRoute(url + "/email/callback{?email,token,user}", ["GET"], this._handleEmailCallback, {
        hidden: true
      });
      this._addRoute(url + "/email/passwordRecovery", ["POST"], this._passwordRecovery, {
        post: {
          description: "Reinit the password if we have the right token, expire",
          summary: "Reinit password",
          operationId: "reinitPassword",
          schema: {
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
          },
          responses: {
            "204": "",
            "403": "Wrong Token"
          }
        }
      });
      this._addRoute(url + "/email/{email}/recover", ["GET"], this._passwordRecoveryEmail, {
        get: {
          description: "The password reset process will be start",
          summary: "Start password recovery",
          operationId: "startEmailRecovery",
          responses: {
            "204": "",
            "404": "Email does not exist",
            "429": "Recovery has been initiated in the last 4 hours"
          }
        }
      });
      this._addRoute(url + "/email/{email}/validate", ["GET"], this._sendEmailValidation, {
        get: {
          description: "The email validation process will be start",
          summary: "Restart email validation",
          operationId: "startEmailRecovery",
          responses: {
            "204": "",
            "409": "Email already verified for another user",
            "412": "Email already verified for current user",
            "429": "Validation has been initiated in the last 4 hours"
          }
        }
      });
    }
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
  async init(): Promise<void> {
    if (this._params.identStore) {
      this._identsStore = <Store<Ident>>this.getService(this._params.identStore);
    }

    if (this._params.userStore) {
      this._usersStore = <Store<User>>this.getService(this._params.userStore);
    }

    this._emailDelay = this._params.emailDelay || 3600000 * 4; // 4 hours by default
    this._params.passwordRegexp = this._params.passwordRegexp || ".{8,}";

    if (this._params.passwordVerifier) {
      this._passwordVerifier = <PasswordVerifier>this.getService(this._params.passwordVerifier);
    }

    if (this._identsStore === undefined || this._usersStore === undefined) {
      throw Error("Unresolved dependency on idents and users services");
    }
  }

  addProvider(name: string) {
    this._params.providers[name] = name;
  }

  async _sendEmailValidation(ctx) {
    let identKey = ctx._params.email + "_email";
    let ident = await this._identsStore.get(identKey);
    if (!ident) {
      await this._identsStore.save({
        uuid: `${ctx._params.email}_email`,
        _lastValidationEmail: Date.now(),
        _type: "email"
      });
    } else {
      if (ident.getUser() !== ctx.getCurrentUserId()) {
        throw 409;
      }
      if (ident._validation) {
        throw 412;
      }
      if (ident._lastValidationEmail >= Date.now() - this._emailDelay) {
        throw 429;
      }
      await this._identsStore.patch({
        _lastValidationEmail: Date.now(),
        uuid: identKey
      });
    }
    await this.sendValidationEmail(ctx, ctx._params.email);
  }

  async _getMe(ctx: Context) {
    let user = await ctx.getCurrentUser();
    if (user === undefined) {
      throw 404;
    }
    await this.emitSync("GetMe", {
      ctx: ctx,
      user: user
    });
    ctx.write(user);
  }

  async _listAuthentications(ctx: Context) {
    if (ctx.getHttpContext().getMethod() === "DELETE") {
      await this.logout(ctx);
      ctx.write("GoodBye");
      return;
    }
    ctx.write(Object.keys(this._params.providers));
  }

  async _registerNewEmail(ctx) {
    if (!ctx.getCurrentUserId()) {
      throw 403;
    }
    let ident = await this._identsStore.get(ctx.body.email + "_email");
    if (ident) {
      if (ident._validation) {
        throw 409;
      }
    } else {
      await this._identsStore.save({
        uuid: `${ctx.body.email}_email`,
        _lastValidationEmail: Date.now(),
        _type: "email"
      });
    }
    await this.sendValidationEmail(ctx, ctx.body.email);
  }

  async onIdentLogin(ctx: Context, provider: string, identId: string, profile: any) {
    if (!identId.endsWith(`_${provider}`)) {
      identId += `_${provider}`;
    }
    let ident: Ident = await this._identsStore.get(identId);
    // Ident is known
    if (ident) {
      await this.login(ctx, ident.getUser(), ident);
      await this._identsStore.patch({
        _lastUsed: new Date(),
        uuid: ident.uuid
      });
      // Redirect to?
      return;
    }
    let user;
    // If already login
    if (ctx.getCurrentUserId()) {
      user = await ctx.getCurrentUser();
    } else {
      // If no user, register a new user automatically
      user = await this.registerUser(ctx, profile);
      await this._usersStore.save(user);
    }
    // Work directly on ident argument
    ident = this._identsStore.initModel({
      uuid: identId,
      profile
    });
    ident.setUser(user.uuid);
    ident._lastUsed = new Date();
    ident.setType(provider);
    await ident.save();
    ident.__new = true;
    await this.login(ctx, user, ident);
  }

  async registerUser(ctx: Context, datas, user: any = {}): Promise<any> {
    user.locale = ctx.getLocale();
    await this.emitSync("Register", {
      user: user,
      datas: datas,
      ctx: ctx
    });
    return user;
  }

  async getPasswordRecoveryInfos(uuid: string | User, interval = this._emailDelay): Promise<PasswordRecoveryInfos> {
    var expire = Date.now() + interval;
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
      token: this.hashPassword(user.uuid + expire + user.getPassword()),
      login: user.uuid
    };
  }

  async _passwordRecoveryEmail(ctx: Context) {
    let email = ctx.parameter("email");
    let ident: Ident = await this._identsStore.get(email + "_email");
    if (!ident) {
      throw 404;
    }
    let user: User = await this._usersStore.get(ident.getUser());
    // Dont allow to do too many request
    if (!user.lastPasswordRecoveryBefore(Date.now() - 3600000 * 4)) {
      throw 429;
    }
    await this._usersStore.patch({
      _lastPasswordRecovery: Date.now(),
      uuid: user.uuid
    });
    await this.sendRecoveryEmail(ctx, user, email);
  }

  _verifyPassword(password: string) {
    if (this._passwordVerifier) {
      return this._passwordVerifier.validate(password);
    }
    let regexp = new RegExp(this._params.passwordRegexp);
    if (!regexp.exec(password)) {
      throw 400;
    }
    return Promise.resolve(true);
  }

  async _passwordRecovery(ctx: Context) {
    let body = ctx.getRequestBody();
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
    if (body.token !== this.hashPassword(body.login.toLowerCase() + body.expire + user.getPassword())) {
      throw 403;
    }
    if (body.expire < Date.now()) {
      throw 410;
    }
    await this._verifyPassword(body.password);
    await this._usersStore.patch({
      __password: this.hashPassword(body.password),
      uuid: body.login.toLowerCase()
    });
  }

  async _handleEmailCallback(ctx: Context) {
    if (!ctx.parameter("token")) {
      throw 404;
    }
    let validation = ctx.parameter("token");
    if (validation !== this.generateEmailValidationToken(ctx.parameter("user"), ctx.parameter("email"))) {
      ctx.writeHead(302, {
        Location: this._params.failureRedirect + "?reason=badToken"
      });
      return;
    }

    if (
      ctx.parameter("user") !== ctx.getCurrentUserId() &&
      ctx.getCurrentUserId() !== "" &&
      ctx.getCurrentUserId() !== undefined
    ) {
      ctx.writeHead(302, {
        Location: this._params.failureRedirect + "?reason=badUser"
      });
      return;
    }
    var uuid = ctx.parameter("email") + "_email";
    let ident = await this._identsStore.get(uuid);
    if (ident === undefined) {
      ident = this._identsStore.initModel({
        uuid
      });
    }
    ident._type = "email";
    ident._validation = new Date();
    ident.setUser(ctx.parameter("user"));
    await ident.save();
    ctx.writeHead(302, {
      Location: this._params.successRedirect + "?validation=email",
      "X-Webda-Authentication": "success"
    });
  }

  async sendRecoveryEmail(ctx: Context, user, email: string) {
    let infos = await this.getPasswordRecoveryInfos(user);
    var mailer: Mailer = this.getMailMan();
    let locale = user.locale;
    if (!locale) {
      locale = ctx.getLocale();
    }
    let replacements = _extend({}, this._params.providers.email);
    replacements.infos = infos;
    replacements.to = email;
    replacements.context = ctx;
    let mailOptions = {
      to: email,
      locale: locale,
      template: "PASSPORT_EMAIL_RECOVERY",
      replacements: replacements
    };
    if (!user.locale) {
      mailOptions.locale = ctx.getLocale();
    }
    return mailer.send(mailOptions);
  }

  async sendValidationEmail(ctx: Context, email: string) {
    var mailer: Mailer = this.getMailMan();
    let replacements = _extend({}, this._params.providers.email);
    replacements.context = ctx;
    replacements.url = ctx
      .getHttpContext()
      .getFullUrl(
        this._params.expose +
          "/email/callback?email=" +
          email +
          "&token=" +
          this.generateEmailValidationToken(ctx.getCurrentUserId(), email)
      );
    let userId = ctx.getCurrentUserId();
    if (userId && userId.length > 0) {
      replacements.url += "&user=" + userId;
    }
    let mailOptions = {
      to: email,
      locale: ctx.getLocale(),
      template: "PASSPORT_EMAIL_REGISTER",
      replacements: replacements
    };
    return mailer.send(mailOptions);
  }

  hashPassword(pass: string): string {
    var hash = crypto.createHash("sha256");
    return hash.update(pass + this._webda.getSalt()).digest("hex");
  }

  async logout(ctx: Context) {
    await this.emitSync("Logout", {
      ctx: ctx
    });
    ctx.getSession().destroy();
  }

  async login(ctx: Context, user, ident) {
    var event: any = {};
    event.userId = user;
    if (typeof user == "object") {
      event.userId = user.uuid;
      event.user = user;
    }
    event.identId = ident;
    if (typeof ident == "object") {
      event.identId = ident.uuid;
      event.ident = ident;
    }
    event.ctx = ctx;
    ctx.getSession().login(event.userId, event.identId);
    return this.emitSync("Login", event);
  }

  getMailMan(): Mailer {
    return <Mailer>(
      this.getService(this._params.providers.email.mailer ? this._params.providers.email.mailer : "Mailer")
    );
  }

  protected async handleLogin(ctx: Context, ident: Ident) {
    let updates: any = {};
    let user: User = await this._usersStore.get(ident.getUser());
    // Check password
    if (user.getPassword() === this.hashPassword(ctx.getRequestBody().password)) {
      if (ident._failedLogin > 0) {
        ident._failedLogin = 0;
      }
      updates._lastUsed = new Date();
      updates._failedLogin = 0;
      updates.uuid = ident.uuid;

      await this._identsStore.patch(updates);
      await this.login(ctx, ident.getUser(), ident);
      ctx.write(user);
    } else {
      await this.emitSync("LoginFailed", {
        user,
        ctx
      });
      if (ident._failedLogin === undefined) {
        ident._failedLogin = 0;
      }
      updates._failedLogin = ident._failedLogin++;
      updates._lastFailedLogin = new Date();
      updates.uuid = ident.uuid;
      // Swalow exeception issue to double check !
      await this._identsStore.patch(updates);
      // Allows to auto redirect user to a oauth if needed
      if (!ctx.isEnded()) {
        throw 403;
      }
    }
  }

  async _handleEmail(ctx: Context) {
    if (this._identsStore === undefined) {
      this._webda.log("ERROR", "Email auth needs an ident store");
      throw 500;
    }
    let body = ctx.getRequestBody();

    // Register new email
    if (body.email && !body.password) {
      return this._registerNewEmail(ctx);
    }

    if (body.password === undefined || body.login === undefined) {
      throw 400;
    }
    var mailConfig = this._params.providers.email;
    var mailerService = this.getMailMan();
    if (mailerService === undefined) {
      // Bad configuration ( might want to use other than 500 )
      throw 500;
    }
    var uuid = body.login.toLowerCase() + "_email";
    let ident: Ident = await this._identsStore.get(uuid);
    if (ident !== undefined && ident.getUser() !== undefined) {
      // Register on an known user
      if (!ctx.parameter("register")) {
        await this.handleLogin(ctx, ident);
        return;
      }
      // If register on a validate email
      if (ident._validation !== undefined) {
        throw 409;
      }
    }

    // TODO Handle add of email on authenticated user
    var email = body.login.toLowerCase();
    // Read the form
    if (body.register || ctx.parameter("register")) {
      var validation = undefined;
      // Need to check email before creation
      if (!mailConfig.postValidation) {
        if (body.token == this.generateEmailValidationToken(ctx.getCurrentUserId(), email)) {
          if (body.user !== ctx.getCurrentUserId()) {
            throw 412;
          }
          validation = new Date();
        } else {
          ctx.write({});
          // token is undefined send an email
          return this.sendValidationEmail(ctx, email);
        }
      }
      // Store with a _
      body.__password = this.hashPassword(body.password);
      await this._verifyPassword(body.password);
      delete body.password;
      delete body.register;
      let user = await this.registerUser(ctx, {}, body);
      user = await this._usersStore.save(user);
      var newIdent: any = this._identsStore.initModel({
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
      ident = await newIdent.save();
      await this.login(ctx, user, ident);
      ctx.write(user);
      if (!validation && !mailConfig.skipEmailValidation) {
        await this.sendValidationEmail(ctx, email);
      }
      return;
    }
    throw 404;
  }

  generateEmailValidationToken(user: string, email: string) {
    return this.hashPassword(email + "_" + this._webda.getSecret() + user);
  }

  _getProviderName(name: string) {
    if (this._aliases[name]) {
      return this._aliases[name];
    }
    return name;
  }

  static getModda(): ModdaDefinition {
    return {
      uuid: "Webda/Authentication",
      label: "Authentication",
      description:
        "Implements user registration and login using either email or OAuth, it handles for now Facebook, Google, Amazon, GitHub, Twitter\nIt needs a Idents and a Users Store to work",
      logo: "images/icons/passport.png",
      documentation: "https://raw.githubusercontent.com/loopingz/webda/master/readmes/Authentication.md",
      configuration: {
        schema: {
          type: "object",
          properties: {
            expose: {
              type: "boolean"
            },
            successRedirect: {
              type: "string",
              default: "YOUR WEBSITE LOGGED PAGE"
            },
            failureRedirect: {
              type: "string",
              default: "YOUR WEBSITE FAILURE PAGE"
            },
            email: {
              type: "object",
              properties: {
                postValidation: {
                  type: "boolean"
                }
              }
            }
          },
          required: ["successRedirect", "failureRedirect"]
        }
      }
    };
  }
}

export { Authentication, PasswordVerifier, PasswordRecoveryInfos };
