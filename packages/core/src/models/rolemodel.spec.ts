import { suite, test } from "@testdeck/mocha";
import * as assert from "assert";
import { Core, HttpContext, RoleModel, Session, User, WebContext } from "../index";
import { TestApplication } from "../test";
import { getCommonJS } from "../utils/esm";
const { __dirname } = getCommonJS(import.meta.url);

class RolePolicyModel extends RoleModel {
  getRolesMap() {
    return {
      get: "member",
      update: "member",
      delete: "admin"
    };
  }
}

class RolePolicyModelPermissive extends RoleModel {
  getRolesMap() {
    return {
      get: "member",
      create: "member"
    };
  }

  isPermissive() {
    return true;
  }
}

@suite
class RolePolicyTest {
  _ctx: WebContext;
  nonPermissive: RoleModel;
  permissive: RoleModel;
  _webda: Core;
  _session: Session;
  _user: User;

  async before() {
    let app = new TestApplication(__dirname + "/../../test/config.json");
    await app.load();
    this._webda = new Core(app);
    await this._webda.init();
    this._ctx = await this._webda.newWebContext(new HttpContext("test.webda.io", "GET", "/"));
    this._session = await this._ctx.newSession();
    this._session.login("none", "none");
    // @ts-ignore
    this._ctx.getCurrentUser = async () => {
      return this._user;
    };
    this.nonPermissive = new RolePolicyModel();
    this.permissive = new RolePolicyModelPermissive();
    this._user = new User();
    this._user.addRole("member");
  }

  @test async noLogged() {
    this._ctx.getSession().logout();
    assert.rejects(() => this.permissive.canAct(this._ctx, "get"), /403/g);
  }
  @test async get() {
    assert.strictEqual(await this.permissive.canAct(this._ctx, "get"), this.permissive);
    assert.strictEqual(await this.nonPermissive.canAct(this._ctx, "get"), this.nonPermissive);
  }
  @test async action() {
    assert.strictEqual(await this.permissive.canAct(this._ctx, "action"), this.permissive);
    await assert.rejects(this.nonPermissive.canAct.bind(this.nonPermissive, this._ctx, "action"));
  }

  @test async delete() {
    assert.strictEqual(await this.permissive.canAct(this._ctx, "delete"), this.permissive);
    await assert.rejects(this.nonPermissive.canAct.bind(this.nonPermissive, this._ctx, "delete"));
    this._user.addRole("admin");
    this._session.roles = undefined;
    assert.strictEqual(await this.nonPermissive.canAct(this._ctx, "delete"), this.nonPermissive);
  }
}
