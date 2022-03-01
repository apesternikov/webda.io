import { suite, test } from "@testdeck/mocha";
import { Route53Service } from "./route53";
import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import * as sinon from "sinon";
import * as assert from "assert";
import { JSONUtils } from "@webda/core";

@suite
class Route53Test {
  @test
  async exportImport() {
    // Mock
    try {
      AWSMock.setSDKInstance(AWS);
      var callSpy2 = sinon.stub().callsFake((p, c) => {
        if (callSpy2.callCount == 1) {
          return c(null, {
            ResourceRecordSets: JSONUtils.loadFile("./test/zone-export.json").entries,
            IsTruncated: true,
            NextRecordIdentifier: "plop"
          });
        } else {
          return c(null, {
            ResourceRecordSets: [],
            IsTruncated: false
          });
        }
      });
      var spyChanges = sinon.stub().callsFake((p, c) => {
        return c(null, {});
      });
      AWSMock.mock("Route53", "listResourceRecordSets", callSpy2);
      AWSMock.mock("Route53", "changeResourceRecordSets", spyChanges);
      let stub = sinon.stub(Route53Service, "getZoneForDomainName").callsFake(() => {
        return undefined;
      });
      await assert.rejects(
        () => Route53Service.createDNSEntry("test.com", "A", "1.1.1.1"),
        /Domain 'test.com.?' is not handled on AWS/
      );
      await assert.rejects(() => Route53Service.getEntries("test.com"), /Domain 'test.com.?' is not handled on AWS/);
      await assert.rejects(
        () => Route53Service.import("./test/zone-export.json", false, undefined),
        /Domain 'webda.io.?' is not handled on AWS/
      );

      stub.callsFake(() => {
        return { Id: "myZone", Name: "webda.io." };
      });

      await Route53Service.createDNSEntry("test.com", "A", "1.1.1.1");

      await Route53Service.shell(undefined, { _: ["export"], domain: "webda.io", file: "./myzone.json" });
      await Route53Service.shell(undefined, { _: ["import"], file: "./test/zone-export.json" });

      spyChanges.callsFake(() => {
        throw new Error("Cannot do this");
      });
      let logs;
      await Route53Service.import("./test/zone-export.json", false, {
        log: (...args) => {
          logs = args;
        }
      });
      assert.deepStrictEqual([logs[0], logs[1].toString()], ["ERROR", "Error: Cannot do this"]);
    } finally {
      AWSMock.restore();
    }
  }
}
