import { suite, test } from "@testdeck/mocha";
import * as assert from "assert";
import { existsSync, unlinkSync, writeFileSync } from "fs";
import { WebdaTest } from "../test";
import { getCommonJS } from "../utils/esm";
import { FileConfigurationService } from "./fileconfiguration";
const { __dirname } = getCommonJS(import.meta.url);
@suite
class FileConfigurationServiceTest extends WebdaTest {
  getTestConfiguration() {
    return __dirname + "/../../test/config-file-reload.json";
  }

  async before() {
    this.cleanFiles.push(__dirname + "/../../test/my-cnf.json");
    writeFileSync(
      __dirname + "/../../test/my-cnf.json",
      JSON.stringify(
        {
          webda: {
            services: {
              Authentication: {
                providers: {
                  email: {
                    text: "Test",
                  },
                },
              },
            },
          },
        },
        undefined,
        2
      )
    );
    await super.before();
  }

  @test
  async initialLoad() {
    assert.rejects(
      () => new FileConfigurationService(this.webda, "except", {}).init(),
      /Need a source for FileConfigurationService/
    );
    assert.rejects(
      () =>
        new FileConfigurationService(this.webda, "except", {
          source: "/plops",
        }).init(),
      /Need a source for FileConfigurationService/
    );
    assert.strictEqual(
      this.webda.getConfiguration().services.Authentication.providers.email
        .text,
      "Test"
    );
    assert.strictEqual(
      this.webda.getConfiguration().services.Authentication.providers.email
        .mailer,
      "DefinedMailer"
    );
    await new Promise<void>((resolve) => {
      let ok = false;
      this.webda
        .getService("FileConfigurationService")
        .on("Configuration.Applied", () => {
          ok = true;
          resolve();
        });
      // Github fs watcher seems to have some issue
      setTimeout(async () => {
        if (!ok) {
          console.log("WARN: Bypass the fs.watch");
          await this.webda
            .getService<FileConfigurationService>("FileConfigurationService")
            // @ts-ignore
            .checkUpdate();
          resolve();
        }
      }, 30000);
      writeFileSync(
        __dirname + "/../../test/my-cnf.json",
        JSON.stringify(
          {
            webda: {
              services: {
                Authentication: {
                  providers: {
                    email: {
                      text: "Plop",
                    },
                  },
                },
              },
            },
          },
          undefined,
          2
        )
      );
    });

    assert.strictEqual(
      this.webda.getConfiguration().services.Authentication.providers.email
        .text,
      "Plop"
    );
    assert.strictEqual(
      this.webda.getConfiguration().services.Authentication.providers.email
        .mailer,
      "DefinedMailer"
    );
  }
}

@suite
class FileConfigurationNoReloadServiceTest extends WebdaTest {
  getTestConfiguration() {
    return __dirname + "/../../test/config-file-no-reload.json";
  }

  async before() {
    writeFileSync(
      __dirname + "/../../test/my-cnf.json",
      JSON.stringify(
        {
          webda: {
            services: {
              Authentication: {
                providers: {
                  email: {
                    text: "Test2",
                  },
                },
              },
            },
          },
        },
        undefined,
        2
      )
    );
    await super.before();
  }

  @test
  async initialLoad() {
    assert.strictEqual(
      this.webda.getConfiguration().services.Authentication.providers.email
        .text,
      "Test2"
    );
    assert.strictEqual(
      this.webda.getConfiguration().services.Authentication.providers.email
        .mailer,
      "DefinedMailer"
    );
  }
}

@suite
class FileConfigurationNoReloadMissingServiceTest extends WebdaTest {
  getTestConfiguration() {
    return __dirname + "/../../test/config-file-no-reload.json";
  }

  async before() {
    const filename = __dirname + "/../../test/my-cnf.json";
    if (existsSync(filename)) {
      unlinkSync(filename);
    }
    await super.before();
  }

  @test
  async initialLoad() {
    assert.strictEqual(
      this.webda.getConfiguration().services.Authentication.providers.email
        .text,
      "Test"
    );
    assert.strictEqual(
      this.webda.getConfiguration().services.Authentication.providers.email
        .mailer,
      "DefinedMailer"
    );
  }
}

@suite
class FileConfigurationMissingFileTest extends WebdaTest {
  getTestConfiguration() {
    return __dirname + "/../../test/config-file-missing-file.json";
  }

  async before() {
    const filename = __dirname + "/../../test/my-missing-file.json";
    if (existsSync(filename)) {
      unlinkSync(filename);
    }
    await super.before();
  }

  @test
  async initialLoad() {
    console.log(this.webda.getConfiguration().services.Authentication);
    assert.strictEqual(
      this.webda.getConfiguration().services.Authentication.providers.email
        .text,
      "MissingTextAutoGenerated"
    );
  }
}

@suite
class FileConfigurationMissingFileNoDefaultTest extends WebdaTest {
  getTestConfiguration() {
    return __dirname + "/../../test/config-file-missing-file-no-default.json";
  }

  async before() {
    const filename = __dirname + "/../../test/my-missing-file.json";
    if (existsSync(filename)) {
      unlinkSync(filename);
    }
    await super.before();
  }

  @test
  async initialLoad() {
    assert.strictEqual(
      this.webda.getConfiguration().services.Authentication.providers.email
        .text,
      "Test"
    );
  }
}
