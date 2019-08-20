import { QueueTest } from "@webda/core/lib/queues/queue.spec";
import * as assert from "assert";
import { SQSQueue } from "./sqsqueue";
import { test, suite, timeout } from "mocha-typescript";

@suite
class SQSQueueTest extends QueueTest {
  @test
  @timeout(80000)
  async basic() {
    await this.webda.getService("sqsqueue").install({});
    await this.webda.getService("sqsqueue").__clean();
    // Update timeout to 80000ms as Purge can only be sent once every 60s
    return this.simple(this.webda.getService("sqsqueue"), true);
  }

  @test
  ARN() {
    let queue: SQSQueue = <SQSQueue>this.webda.getService("sqsqueue");
    let arn = queue.getARNPolicy();
    assert.equal(arn.Action.indexOf("sqs:SendMessage") >= 0, true);
    assert.equal(arn.Resource[0], "arn:aws:sqs:us-east-1:queue:webda-test");
  }

  @test
  getQueueInfos() {
    let queue: SQSQueue = <SQSQueue>this.webda.getService("sqsqueue");
    queue._params.queue = "none";
    let error = false;
    try {
      let info = queue._getQueueInfosFromUrl();
    } catch (ex) {
      error = true;
    }
    assert.equal(error, true);
  }
}
