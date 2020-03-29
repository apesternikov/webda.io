import { Context, ModdaDefinition } from "@webda/core";
import { Deployer } from "@webda/shell";

class CustomDeployer extends Deployer<any> {
  test(ctx: Context) {
    ctx.write("Tested");
  }

  async deploy() {}

  static getModda(): ModdaDefinition {
    return {
      uuid: "WebdaDemo/CustomDeployer",
      category: "deployers",
      label: "Fake deployer for demo purpose",
      description: "",
      logo: "",
      configuration: {}
    };
  }
}

// Old style exports for testing purpose
module.exports = CustomDeployer;
