import * as colors from "colors";
import { LogFilter, WorkerLogLevel, WorkerMessage, WorkerOutput } from "..";
import * as util from "util";

/**
 * ConsoleLogger
 */
export class ConsoleLogger {
  format: string;
  level: WorkerLogLevel;

  constructor(output: WorkerOutput, level: WorkerLogLevel = "INFO", format: string = "%t [%l]") {
    this.level = level;
    this.format = format;
    output.on("message", (msg: WorkerMessage) => {
      ConsoleLogger.handleMessage(msg, this.level, this.format);
    });
  }

  /**
   *
   * @param level to get color from
   */
  static getColor(level: WorkerLogLevel): (s: string) => string {
    if (level === "ERROR") {
      return colors.red;
    } else if (level === "WARN") {
      return colors.yellow;
    } else if (level === "DEBUG" || level === "TRACE") {
      return colors.grey;
    }
    return s => s;
  }

  /**
   * Commonly handle a message
   * @param msg
   * @param level
   * @param format
   */
  static handleMessage(msg: WorkerMessage, level: WorkerLogLevel, format: string = "%t [%l]") {
    if (msg.type === "title.set" && LogFilter("INFO", level)) {
      console.log(msg);
      ConsoleLogger.display(
        <any>{
          timestamp: msg.timestamp,
          log: {
            level: "INFO",
            args: [msg.title]
          }
        },
        format
      );
    }
    if (msg.type === "log" && LogFilter(msg.log.level, level)) {
      ConsoleLogger.display(msg, format);
    }
  }

  /**
   * Display a message to the console
   *
   * @param msg
   * @param format
   */
  static display(msg: WorkerMessage, format: string = "%t [%l]") {
    console.log(
      ConsoleLogger.getColor(msg.log.level)(
        [
          msg.timestamp,
          msg.log.level,
          ...msg.log.args.map(a =>
            a === undefined ? "undefined" : typeof a === "object" ? util.inspect(a) : a.toString()
          )
        ].join(" ")
      )
    );
  }
}
