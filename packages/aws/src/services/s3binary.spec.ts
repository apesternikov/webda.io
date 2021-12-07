import { BinaryTest } from "@webda/core/lib/services/binary.spec";
import * as assert from "assert";
import { suite, test } from "@testdeck/mocha";
import { checkLocalStack } from "../index.spec";
import { S3Binary, S3BinaryParameters } from "./s3binary";
import { GetAWS } from ".";
import { DynamoDBTest } from "./dynamodb.spec";
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import * as sinon from "sinon";
import { Binary } from "@webda/core";

@suite
class S3BinaryTest extends BinaryTest<S3Binary> {
  async before() {
    await checkLocalStack();
    this.buildWebda();
    await this.install();
    await this.cleanData();
    DynamoDBTest.install("webda-test-idents");
    DynamoDBTest.install("webda-test-users");
    await super.before();
  }

  // Override getNotFound as exception is raised after
  @test
  async getNotFound() {}

  async cleanData() {
    var s3 = new (GetAWS({}).S3)({
      endpoint: "http://localhost:4572",
      s3ForcePathStyle: true
    });
    const Bucket = "webda-test";
    // For test we do not have more than 1k objects
    let data = await s3
      .listObjectsV2({
        Bucket
      })
      .promise();
    var params = {
      Bucket,
      Delete: {
        Objects: []
      }
    };
    for (var i in data.Contents) {
      params.Delete.Objects.push({
        Key: data.Contents[i].Key
      });
    }
    if (params.Delete.Objects.length === 0) {
      return;
    }
    return s3.deleteObjects(params).promise();
  }

  async install() {
    var s3 = new (GetAWS({}).S3)({
      endpoint: "http://localhost:4572",
      s3ForcePathStyle: true
    });
    const Bucket = "webda-test";
    return s3
      .headBucket({
        Bucket
      })
      .promise()
      .catch(err => {
        if (err.code === "Forbidden") {
          this.webda.log("ERROR", "S3 bucket already exists in another account");
        } else if (err.code === "NotFound") {
          this.webda.log("INFO", "Creating S3 Bucket", Bucket);
          return s3
            .createBucket({
              Bucket
            })
            .promise();
        }
      });
  }

  @test
  getARN() {
    let policies = this.getBinary().getARNPolicy("plop");

    assert.strictEqual(policies.Resource[0], "arn:aws:s3:::webda-test");
    assert.strictEqual(policies.Resource[1], "arn:aws:s3:::webda-test/*");

    this.getBinary().getParameters().CloudFormationSkip = true;
    assert.deepStrictEqual(this.getBinary().getCloudFormation(undefined), {});
  }

  @test
  async forEachFile() {
    let keys = [];
    try {
      AWSMock.setSDKInstance(AWS);
      var spyChanges = sinon.stub().callsFake(async p => {
        if (spyChanges.callCount === 1) {
          return {
            Contents: [
              { Key: "test/test.txt" },
              { Key: "test/test.json" },
              { Key: "test2/test.txt" },
              { Key: "loop.txt" }
            ].filter(i => {
              return i.Key.startsWith(p.Prefix);
            }),
            NextContinuationToken: "2"
          };
        }
        return { Contents: [] };
      });
      AWSMock.mock("S3", "listObjectsV2", spyChanges);
      await this.getBinary().forEachFile(
        "myBucket",
        async (Key: string) => {
          keys.push(Key);
        },
        undefined,
        /.*\.txt/
      );
      assert.deepStrictEqual(keys, ["test/test.txt", "test2/test.txt", "loop.txt"]);
      keys = [];
      spyChanges.resetHistory();
      await this.getBinary().forEachFile(
        "myBucket",
        async (Key: string) => {
          keys.push(Key);
        },
        "test/"
      );
      assert.deepStrictEqual(keys, ["test/test.txt", "test/test.json"]);
    } finally {
      AWSMock.restore();
    }
  }

  @test
  params() {
    assert.throws(() => new S3BinaryParameters({}, this.getBinary()), /Need to define a bucket at least/);
  }

  @test
  signedUrl() {
    let urls = [
      this.getBinary().getSignedUrl("plop/test", "putObject", { Bucket: "myBuck" }),
      this.getBinary().getSignedUrl("plop/test")
    ];
    urls.forEach(url => {
      assert.ok(
        url.match(
          /http:\/\/localhost:4572\/(myBuck|webda-test)\/plop\/test\?AWSAccessKeyId=Bouzouf&Expires=\d+&Signature=.*/
        ),
        `'${url}' does not match expected`
      );
    });
  }

  @test
  async exists() {
    assert.ok(!(await this.getBinary()._exists("bouzouf")));
    await this.getBinary().putObject(this.getBinary()._getKey("bouzouf"), "plop");
    assert.ok(await this.getBinary()._exists("bouzouf"));
    assert.strict(
      (await Binary.streamToBuffer(this.getBinary().getObject(this.getBinary()._getKey("bouzouf")))).toString("utf8"),
      "plop"
    );
    assert.notStrictEqual(await this.getBinary().exists(this.getBinary()._getKey("bouzouf")), null);
    assert.strictEqual(await this.getBinary().exists(this.getBinary()._getKey("bouzouf2")), null);
  }

  @test
  async cleanHash() {
    let key1 = this.getBinary()._getKey("bouzouf", "one");
    let key2 = this.getBinary()._getKey("bouzouf", "two");
    await this.getBinary().putObject(key1, "plop");
    await this.getBinary().putObject(key2, "plop");
    await this.getBinary()._cleanHash("bouzouf");
    // TO CONTINUE (localstack might not handle V2)
  }

  @test
  getKey() {
    let key = this.getBinary()._getKey("bouzouf", "two");
    assert.strictEqual(key, "bouzouf/two");
    this.getBinary().getParameters().prefix = "plop";
    key = this.getBinary()._getKey("bouzouf", "two");
    assert.strictEqual(key, "plop/bouzouf/two");
  }

  @test
  async cascadeDelete() {
    let stubDelete = sinon.stub(this.getBinary()._s3, "deleteObject").callsFake(() => {
      throw new Error();
    });
    try {
      // @ts-ignore
      await this.getBinary().cascadeDelete({ hash: "pp" }, "pp");
    } finally {
      stubDelete.restore();
    }
  }

  @test
  async redirectUrl() {
    let { user1, ctx } = await this.setupDefault();
    // Making sure we are redirected on GET
    let executor = this.getExecutor(ctx, "test.webda.io", "GET", `/binary/users/${user1.getUuid()}/images/0`, {});
    await executor.execute(ctx);
    assert.ok(ctx.getResponseHeaders().Location !== undefined);
  }

  @test
  async redirectUrlInfo() {
    let { user1, ctx } = await this.setupDefault();
    // Making sure we are redirected on GET
    let executor = this.getExecutor(ctx, "test.webda.io", "GET", `/binary/users/${user1.getUuid()}/images/0/url`, {});
    await executor.execute(ctx);
    assert.ok(ctx.getResponseHeaders().Location === undefined);
    assert.notStrictEqual(JSON.parse(ctx.getResponseBody()).Location, undefined);
  }

  @test
  async httpGetError() {
    // GET is not through classic binary
    // Skip it
  }

  @test
  async challenge() {
    await this.testChallenge(false);
  }

  @test
  async badErrors() {
    let stub = sinon.stub(this.getBinary()._s3, "headObject").callsFake(() => ({
      promise: async () => {
        throw new Error("Fake");
      }
    }));
    try {
      await assert.rejects(() => this.getBinary()._getS3("plop"));
      await assert.rejects(() => this.getBinary()._exists("plop"));
      await assert.rejects(() => this.getBinary().exists("plop"));
    } finally {
      stub.restore();
    }
  }
}
