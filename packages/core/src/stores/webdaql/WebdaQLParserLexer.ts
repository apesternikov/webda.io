// Generated from src/stores/webdaql/WebdaQLParser.g4 by ANTLR 4.9.0-SNAPSHOT

import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import * as Utils from "antlr4ts/misc/Utils";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

export class WebdaQLParserLexer extends Lexer {
  public static readonly SPACE = 1;
  public static readonly LR_BRACKET = 2;
  public static readonly RR_BRACKET = 3;
  public static readonly COMMA = 4;
  public static readonly SINGLE_QUOTE_SYMB = 5;
  public static readonly DOUBLE_QUOTE_SYMB = 6;
  public static readonly LR_SQ_BRACKET = 7;
  public static readonly RR_SQ_BRACKET = 8;
  public static readonly AND = 9;
  public static readonly OR = 10;
  public static readonly EQUAL = 11;
  public static readonly NOT_EQUAL = 12;
  public static readonly GREATER = 13;
  public static readonly GREATER_OR_EQUAL = 14;
  public static readonly LESS = 15;
  public static readonly LESS_OR_EQUAL = 16;
  public static readonly LIKE = 17;
  public static readonly IN = 18;
  public static readonly TRUE = 19;
  public static readonly FALSE = 20;
  public static readonly LIMIT = 21;
  public static readonly OFFSET = 22;
  public static readonly ORDER_BY = 23;
  public static readonly ASC = 24;
  public static readonly DESC = 25;
  public static readonly DQUOTED_STRING_LITERAL = 26;
  public static readonly SQUOTED_STRING_LITERAL = 27;
  public static readonly INTEGER_LITERAL = 28;
  public static readonly IDENTIFIER = 29;
  public static readonly IDENTIFIER_WITH_NUMBER = 30;
  public static readonly FUNCTION_IDENTIFIER_WITH_UNDERSCORE = 31;

  // tslint:disable:no-trailing-whitespace
  public static readonly channelNames: string[] = [
    "DEFAULT_TOKEN_CHANNEL",
    "HIDDEN",
  ];

  // tslint:disable:no-trailing-whitespace
  public static readonly modeNames: string[] = ["DEFAULT_MODE"];

  public static readonly ruleNames: string[] = [
    "SPACE",
    "ID_LITERAL",
    "DQUOTA_STRING",
    "SQUOTA_STRING",
    "INT_DIGIT",
    "FN_LITERAL",
    "LR_BRACKET",
    "RR_BRACKET",
    "COMMA",
    "SINGLE_QUOTE_SYMB",
    "DOUBLE_QUOTE_SYMB",
    "LR_SQ_BRACKET",
    "RR_SQ_BRACKET",
    "QUOTE_SYMB",
    "AND",
    "OR",
    "EQUAL",
    "NOT_EQUAL",
    "GREATER",
    "GREATER_OR_EQUAL",
    "LESS",
    "LESS_OR_EQUAL",
    "LIKE",
    "IN",
    "TRUE",
    "FALSE",
    "LIMIT",
    "OFFSET",
    "ORDER_BY",
    "ASC",
    "DESC",
    "DQUOTED_STRING_LITERAL",
    "SQUOTED_STRING_LITERAL",
    "INTEGER_LITERAL",
    "IDENTIFIER",
    "IDENTIFIER_WITH_NUMBER",
    "FUNCTION_IDENTIFIER_WITH_UNDERSCORE",
  ];

  private static readonly _LITERAL_NAMES: Array<string | undefined> = [
    undefined,
    undefined,
    "'('",
    "')'",
    "','",
    "'''",
    "'\"'",
    "'['",
    "']'",
    "'AND'",
    "'OR'",
    "'='",
    "'!='",
    "'>'",
    "'>='",
    "'<'",
    "'<='",
    "'LIKE'",
    "'IN'",
    "'TRUE'",
    "'FALSE'",
    "'LIMIT'",
    "'OFFSET'",
    "'ORDER BY'",
    "'ASC'",
    "'DESC'",
  ];
  private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
    undefined,
    "SPACE",
    "LR_BRACKET",
    "RR_BRACKET",
    "COMMA",
    "SINGLE_QUOTE_SYMB",
    "DOUBLE_QUOTE_SYMB",
    "LR_SQ_BRACKET",
    "RR_SQ_BRACKET",
    "AND",
    "OR",
    "EQUAL",
    "NOT_EQUAL",
    "GREATER",
    "GREATER_OR_EQUAL",
    "LESS",
    "LESS_OR_EQUAL",
    "LIKE",
    "IN",
    "TRUE",
    "FALSE",
    "LIMIT",
    "OFFSET",
    "ORDER_BY",
    "ASC",
    "DESC",
    "DQUOTED_STRING_LITERAL",
    "SQUOTED_STRING_LITERAL",
    "INTEGER_LITERAL",
    "IDENTIFIER",
    "IDENTIFIER_WITH_NUMBER",
    "FUNCTION_IDENTIFIER_WITH_UNDERSCORE",
  ];
  public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(
    WebdaQLParserLexer._LITERAL_NAMES,
    WebdaQLParserLexer._SYMBOLIC_NAMES,
    []
  );

  // @Override
  // @NotNull
  public get vocabulary(): Vocabulary {
    return WebdaQLParserLexer.VOCABULARY;
  }
  // tslint:enable:no-trailing-whitespace

  constructor(input: CharStream) {
    super(input);
    this._interp = new LexerATNSimulator(WebdaQLParserLexer._ATN, this);
  }

  // @Override
  public get grammarFileName(): string {
    return "WebdaQLParser.g4";
  }

  // @Override
  public get ruleNames(): string[] {
    return WebdaQLParserLexer.ruleNames;
  }

  // @Override
  public get serializedATN(): string {
    return WebdaQLParserLexer._serializedATN;
  }

  // @Override
  public get channelNames(): string[] {
    return WebdaQLParserLexer.channelNames;
  }

  // @Override
  public get modeNames(): string[] {
    return WebdaQLParserLexer.modeNames;
  }

  public static readonly _serializedATN: string =
    "\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02!\xF0\b\x01\x04" +
    "\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04" +
    "\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r" +
    "\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12" +
    "\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17" +
    "\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C" +
    '\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04"\t"\x04' +
    "#\t#\x04$\t$\x04%\t%\x04&\t&\x03\x02\x06\x02O\n\x02\r\x02\x0E\x02P\x03" +
    "\x02\x03\x02\x03\x03\x06\x03V\n\x03\r\x03\x0E\x03W\x03\x04\x03\x04\x03" +
    "\x04\x03\x04\x03\x04\x03\x04\x07\x04`\n\x04\f\x04\x0E\x04c\v\x04\x03\x04" +
    "\x03\x04\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x07\x05m\n\x05" +
    "\f\x05\x0E\x05p\v\x05\x03\x05\x03\x05\x03\x06\x03\x06\x03\x07\x03\x07" +
    "\x07\x07x\n\x07\f\x07\x0E\x07{\v\x07\x03\b\x03\b\x03\t\x03\t\x03\n\x03" +
    "\n\x03\v\x03\v\x03\f\x03\f\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0F\x03\x0F" +
    "\x05\x0F\x8D\n\x0F\x03\x10\x03\x10\x03\x10\x03\x10\x03\x11\x03\x11\x03" +
    "\x11\x03\x12\x03\x12\x03\x13\x03\x13\x03\x13\x03\x14\x03\x14\x03\x15\x03" +
    "\x15\x03\x15\x03\x16\x03\x16\x03\x17\x03\x17\x03\x17\x03\x18\x03\x18\x03" +
    "\x18\x03\x18\x03\x18\x03\x19\x03\x19\x03\x19\x03\x1A\x03\x1A\x03\x1A\x03" +
    "\x1A\x03\x1A\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1C\x03" +
    "\x1C\x03\x1C\x03\x1C\x03\x1C\x03\x1C\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x03" +
    "\x1D\x03\x1D\x03\x1D\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03" +
    "\x1E\x03\x1E\x03\x1E\x03\x1F\x03\x1F\x03\x1F\x03\x1F\x03 \x03 \x03 \x03" +
    ' \x03 \x03!\x03!\x03"\x03"\x03#\x06#\xDC\n#\r#\x0E#\xDD\x03$\x06$\xE1' +
    "\n$\r$\x0E$\xE2\x03%\x06%\xE6\n%\r%\x0E%\xE7\x03&\x03&\x07&\xEC\n&\f&" +
    "\x0E&\xEF\v&\x02\x02\x02'\x03\x02\x03\x05\x02\x02\x07\x02\x02\t\x02\x02" +
    "\v\x02\x02\r\x02\x02\x0F\x02\x04\x11\x02\x05\x13\x02\x06\x15\x02\x07\x17" +
    "\x02\b\x19\x02\t\x1B\x02\n\x1D\x02\x02\x1F\x02\v!\x02\f#\x02\r%\x02\x0E" +
    "'\x02\x0F)\x02\x10+\x02\x11-\x02\x12/\x02\x131\x02\x143\x02\x155\x02" +
    "\x167\x02\x179\x02\x18;\x02\x19=\x02\x1A?\x02\x1BA\x02\x1CC\x02\x1DE\x02" +
    '\x1EG\x02\x1FI\x02 K\x02!\x03\x02\v\x05\x02\v\f\x0F\x0F""\x05\x022;' +
    "C\\c|\x04\x02$$^^\x04\x02))^^\x03\x022;\x03\x02C\\\x04\x02C\\aa\x04\x02" +
    "C\\c|\x07\x02002;C\\aac|\x02\xF7\x02\x03\x03\x02\x02\x02\x02\x0F\x03\x02" +
    "\x02\x02\x02\x11\x03\x02\x02\x02\x02\x13\x03\x02\x02\x02\x02\x15\x03\x02" +
    "\x02\x02\x02\x17\x03\x02\x02\x02\x02\x19\x03\x02\x02\x02\x02\x1B\x03\x02" +
    "\x02\x02\x02\x1F\x03\x02\x02\x02\x02!\x03\x02\x02\x02\x02#\x03\x02\x02" +
    "\x02\x02%\x03\x02\x02\x02\x02'\x03\x02\x02\x02\x02)\x03\x02\x02\x02\x02" +
    "+\x03\x02\x02\x02\x02-\x03\x02\x02\x02\x02/\x03\x02\x02\x02\x021\x03\x02" +
    "\x02\x02\x023\x03\x02\x02\x02\x025\x03\x02\x02\x02\x027\x03\x02\x02\x02" +
    "\x029\x03\x02\x02\x02\x02;\x03\x02\x02\x02\x02=\x03\x02\x02\x02\x02?\x03" +
    "\x02\x02\x02\x02A\x03\x02\x02\x02\x02C\x03\x02\x02\x02\x02E\x03\x02\x02" +
    "\x02\x02G\x03\x02\x02\x02\x02I\x03\x02\x02\x02\x02K\x03\x02\x02\x02\x03" +
    "N\x03\x02\x02\x02\x05U\x03\x02\x02\x02\x07Y\x03\x02\x02\x02\tf\x03\x02" +
    "\x02\x02\vs\x03\x02\x02\x02\ru\x03\x02\x02\x02\x0F|\x03\x02\x02\x02\x11" +
    "~\x03\x02\x02\x02\x13\x80\x03\x02\x02\x02\x15\x82\x03\x02\x02\x02\x17" +
    "\x84\x03\x02\x02\x02\x19\x86\x03\x02\x02\x02\x1B\x88\x03\x02\x02\x02\x1D" +
    "\x8C\x03\x02\x02\x02\x1F\x8E\x03\x02\x02\x02!\x92\x03\x02\x02\x02#\x95" +
    "\x03\x02\x02\x02%\x97\x03\x02\x02\x02'\x9A\x03\x02\x02\x02)\x9C\x03\x02" +
    "\x02\x02+\x9F\x03\x02\x02\x02-\xA1\x03\x02\x02\x02/\xA4\x03\x02\x02\x02" +
    "1\xA9\x03\x02\x02\x023\xAC\x03\x02\x02\x025\xB1\x03\x02\x02\x027\xB7\x03" +
    "\x02\x02\x029\xBD\x03\x02\x02\x02;\xC4\x03\x02\x02\x02=\xCD\x03\x02\x02" +
    "\x02?\xD1\x03\x02\x02\x02A\xD6\x03\x02\x02\x02C\xD8\x03\x02\x02\x02E\xDB" +
    "\x03\x02\x02\x02G\xE0\x03\x02\x02\x02I\xE5\x03\x02\x02\x02K\xE9\x03\x02" +
    "\x02\x02MO\t\x02\x02\x02NM\x03\x02\x02\x02OP\x03\x02\x02\x02PN\x03\x02" +
    "\x02\x02PQ\x03\x02\x02\x02QR\x03\x02\x02\x02RS\b\x02\x02\x02S\x04\x03" +
    "\x02\x02\x02TV\t\x03\x02\x02UT\x03\x02\x02\x02VW\x03\x02\x02\x02WU\x03" +
    "\x02\x02\x02WX\x03\x02\x02\x02X\x06\x03\x02\x02\x02Ya\x07$\x02\x02Z[\x07" +
    "^\x02\x02[`\v\x02\x02\x02\\]\x07$\x02\x02]`\x07$\x02\x02^`\n\x04\x02\x02" +
    "_Z\x03\x02\x02\x02_\\\x03\x02\x02\x02_^\x03\x02\x02\x02`c\x03\x02\x02" +
    "\x02a_\x03\x02\x02\x02ab\x03\x02\x02\x02bd\x03\x02\x02\x02ca\x03\x02\x02" +
    "\x02de\x07$\x02\x02e\b\x03\x02\x02\x02fn\x07)\x02\x02gh\x07^\x02\x02h" +
    "m\v\x02\x02\x02ij\x07)\x02\x02jm\x07)\x02\x02km\n\x05\x02\x02lg\x03\x02" +
    "\x02\x02li\x03\x02\x02\x02lk\x03\x02\x02\x02mp\x03\x02\x02\x02nl\x03\x02" +
    "\x02\x02no\x03\x02\x02\x02oq\x03\x02\x02\x02pn\x03\x02\x02\x02qr\x07)" +
    "\x02\x02r\n\x03\x02\x02\x02st\t\x06\x02\x02t\f\x03\x02\x02\x02uy\t\x07" +
    "\x02\x02vx\t\b\x02\x02wv\x03\x02\x02\x02x{\x03\x02\x02\x02yw\x03\x02\x02" +
    "\x02yz\x03\x02\x02\x02z\x0E\x03\x02\x02\x02{y\x03\x02\x02\x02|}\x07*\x02" +
    "\x02}\x10\x03\x02\x02\x02~\x7F\x07+\x02\x02\x7F\x12\x03\x02\x02\x02\x80" +
    "\x81\x07.\x02\x02\x81\x14\x03\x02\x02\x02\x82\x83\x07)\x02\x02\x83\x16" +
    "\x03\x02\x02\x02\x84\x85\x07$\x02\x02\x85\x18\x03\x02\x02\x02\x86\x87" +
    "\x07]\x02\x02\x87\x1A\x03\x02\x02\x02\x88\x89\x07_\x02\x02\x89\x1C\x03" +
    "\x02\x02\x02\x8A\x8D\x05\x15\v\x02\x8B\x8D\x05\x17\f\x02\x8C\x8A\x03\x02" +
    "\x02\x02\x8C\x8B\x03\x02\x02\x02\x8D\x1E\x03\x02\x02\x02\x8E\x8F\x07C" +
    "\x02\x02\x8F\x90\x07P\x02\x02\x90\x91\x07F\x02\x02\x91 \x03\x02\x02\x02" +
    '\x92\x93\x07Q\x02\x02\x93\x94\x07T\x02\x02\x94"\x03\x02\x02\x02\x95\x96' +
    "\x07?\x02\x02\x96$\x03\x02\x02\x02\x97\x98\x07#\x02\x02\x98\x99\x07?\x02" +
    "\x02\x99&\x03\x02\x02\x02\x9A\x9B\x07@\x02\x02\x9B(\x03\x02\x02\x02\x9C" +
    "\x9D\x07@\x02\x02\x9D\x9E\x07?\x02\x02\x9E*\x03\x02\x02\x02\x9F\xA0\x07" +
    ">\x02\x02\xA0,\x03\x02\x02\x02\xA1\xA2\x07>\x02\x02\xA2\xA3\x07?\x02\x02" +
    "\xA3.\x03\x02\x02\x02\xA4\xA5\x07N\x02\x02\xA5\xA6\x07K\x02\x02\xA6\xA7" +
    "\x07M\x02\x02\xA7\xA8\x07G\x02\x02\xA80\x03\x02\x02\x02\xA9\xAA\x07K\x02" +
    "\x02\xAA\xAB\x07P\x02\x02\xAB2\x03\x02\x02\x02\xAC\xAD\x07V\x02\x02\xAD" +
    "\xAE\x07T\x02\x02\xAE\xAF\x07W\x02\x02\xAF\xB0\x07G\x02\x02\xB04\x03\x02" +
    "\x02\x02\xB1\xB2\x07H\x02\x02\xB2\xB3\x07C\x02\x02\xB3\xB4\x07N\x02\x02" +
    "\xB4\xB5\x07U\x02\x02\xB5\xB6\x07G\x02\x02\xB66\x03\x02\x02\x02\xB7\xB8" +
    "\x07N\x02\x02\xB8\xB9\x07K\x02\x02\xB9\xBA\x07O\x02\x02\xBA\xBB\x07K\x02" +
    "\x02\xBB\xBC\x07V\x02\x02\xBC8\x03\x02\x02\x02\xBD\xBE\x07Q\x02\x02\xBE" +
    "\xBF\x07H\x02\x02\xBF\xC0\x07H\x02\x02\xC0\xC1\x07U\x02\x02\xC1\xC2\x07" +
    "G\x02\x02\xC2\xC3\x07V\x02\x02\xC3:\x03\x02\x02\x02\xC4\xC5\x07Q\x02\x02" +
    "\xC5\xC6\x07T\x02\x02\xC6\xC7\x07F\x02\x02\xC7\xC8\x07G\x02\x02\xC8\xC9" +
    '\x07T\x02\x02\xC9\xCA\x07"\x02\x02\xCA\xCB\x07D\x02\x02\xCB\xCC\x07[' +
    "\x02\x02\xCC<\x03\x02\x02\x02\xCD\xCE\x07C\x02\x02\xCE\xCF\x07U\x02\x02" +
    "\xCF\xD0\x07E\x02\x02\xD0>\x03\x02\x02\x02\xD1\xD2\x07F\x02\x02\xD2\xD3" +
    "\x07G\x02\x02\xD3\xD4\x07U\x02\x02\xD4\xD5\x07E\x02\x02\xD5@\x03\x02\x02" +
    "\x02\xD6\xD7\x05\x07\x04\x02\xD7B\x03\x02\x02\x02\xD8\xD9\x05\t\x05\x02" +
    "\xD9D\x03\x02\x02\x02\xDA\xDC\x05\v\x06\x02\xDB\xDA\x03\x02\x02\x02\xDC" +
    "\xDD\x03\x02\x02\x02\xDD\xDB\x03\x02\x02\x02\xDD\xDE\x03\x02\x02\x02\xDE" +
    "F\x03\x02\x02\x02\xDF\xE1\t\t\x02\x02\xE0\xDF\x03\x02\x02\x02\xE1\xE2" +
    "\x03\x02\x02\x02\xE2\xE0\x03\x02\x02\x02\xE2\xE3\x03\x02\x02\x02\xE3H" +
    "\x03\x02\x02\x02\xE4\xE6\t\n\x02\x02\xE5\xE4\x03\x02\x02\x02\xE6\xE7\x03" +
    "\x02\x02\x02\xE7\xE5\x03\x02\x02\x02\xE7\xE8\x03\x02\x02\x02\xE8J\x03" +
    "\x02\x02\x02\xE9\xED\t\x07\x02\x02\xEA\xEC\t\b\x02\x02\xEB\xEA\x03\x02" +
    "\x02\x02\xEC\xEF\x03\x02\x02\x02\xED\xEB\x03\x02\x02\x02\xED\xEE\x03\x02" +
    "\x02\x02\xEEL\x03\x02\x02\x02\xEF\xED\x03\x02\x02\x02\x0F\x02PW_alny\x8C" +
    "\xDD\xE2\xE7\xED\x03\b\x02\x02";
  public static __ATN: ATN;
  public static get _ATN(): ATN {
    if (!WebdaQLParserLexer.__ATN) {
      WebdaQLParserLexer.__ATN = new ATNDeserializer().deserialize(
        Utils.toCharArray(WebdaQLParserLexer._serializedATN)
      );
    }

    return WebdaQLParserLexer.__ATN;
  }
}
