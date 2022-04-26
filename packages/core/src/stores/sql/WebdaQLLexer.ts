// Generated from src/stores/sql/WebdaQLLexer.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { NotNull } from "antlr4ts/Decorators";
import { Override } from "antlr4ts/Decorators";
import { RuleContext } from "antlr4ts/RuleContext";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";


export class WebdaQLLexer extends Lexer {
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
	public static readonly DQUOTED_STRING_LITERAL = 21;
	public static readonly SQUOTED_STRING_LITERAL = 22;
	public static readonly INTEGER_LITERAL = 23;
	public static readonly IDENTIFIER = 24;
	public static readonly IDENTIFIER_WITH_NUMBER = 25;
	public static readonly FUNCTION_IDENTIFIER_WITH_UNDERSCORE = 26;

	// tslint:disable:no-trailing-whitespace
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"SPACE", "ID_LITERAL", "DQUOTA_STRING", "SQUOTA_STRING", "INT_DIGIT", 
		"FN_LITERAL", "LR_BRACKET", "RR_BRACKET", "COMMA", "SINGLE_QUOTE_SYMB", 
		"DOUBLE_QUOTE_SYMB", "LR_SQ_BRACKET", "RR_SQ_BRACKET", "QUOTE_SYMB", "AND", 
		"OR", "EQUAL", "NOT_EQUAL", "GREATER", "GREATER_OR_EQUAL", "LESS", "LESS_OR_EQUAL", 
		"LIKE", "IN", "TRUE", "FALSE", "DQUOTED_STRING_LITERAL", "SQUOTED_STRING_LITERAL", 
		"INTEGER_LITERAL", "IDENTIFIER", "IDENTIFIER_WITH_NUMBER", "FUNCTION_IDENTIFIER_WITH_UNDERSCORE",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, "'('", "')'", "','", "'''", "'\"'", "'['", "']'", 
		"'AND'", "'OR'", "'='", "'!='", "'>'", "'>='", "'<'", "'<='", "'LIKE'", 
		"'IN'", "'TRUE'", "'FALSE'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "SPACE", "LR_BRACKET", "RR_BRACKET", "COMMA", "SINGLE_QUOTE_SYMB", 
		"DOUBLE_QUOTE_SYMB", "LR_SQ_BRACKET", "RR_SQ_BRACKET", "AND", "OR", "EQUAL", 
		"NOT_EQUAL", "GREATER", "GREATER_OR_EQUAL", "LESS", "LESS_OR_EQUAL", "LIKE", 
		"IN", "TRUE", "FALSE", "DQUOTED_STRING_LITERAL", "SQUOTED_STRING_LITERAL", 
		"INTEGER_LITERAL", "IDENTIFIER", "IDENTIFIER_WITH_NUMBER", "FUNCTION_IDENTIFIER_WITH_UNDERSCORE",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(WebdaQLLexer._LITERAL_NAMES, WebdaQLLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return WebdaQLLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(WebdaQLLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "WebdaQLLexer.g4"; }

	// @Override
	public get ruleNames(): string[] { return WebdaQLLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return WebdaQLLexer._serializedATN; }

	// @Override
	public get channelNames(): string[] { return WebdaQLLexer.channelNames; }

	// @Override
	public get modeNames(): string[] { return WebdaQLLexer.modeNames; }

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02\x1C\xC7\b\x01" +
		"\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06" +
		"\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r" +
		"\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t" +
		"\x12\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t" +
		"\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t" +
		"\x1C\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x03\x02" +
		"\x06\x02E\n\x02\r\x02\x0E\x02F\x03\x02\x03\x02\x03\x03\x06\x03L\n\x03" +
		"\r\x03\x0E\x03M\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x07\x04" +
		"V\n\x04\f\x04\x0E\x04Y\v\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x05\x07\x05c\n\x05\f\x05\x0E\x05f\v\x05\x03\x05\x03\x05" +
		"\x03\x06\x03\x06\x03\x07\x03\x07\x07\x07n\n\x07\f\x07\x0E\x07q\v\x07\x03" +
		"\b\x03\b\x03\t\x03\t\x03\n\x03\n\x03\v\x03\v\x03\f\x03\f\x03\r\x03\r\x03" +
		"\x0E\x03\x0E\x03\x0F\x03\x0F\x05\x0F\x83\n\x0F\x03\x10\x03\x10\x03\x10" +
		"\x03\x10\x03\x11\x03\x11\x03\x11\x03\x12\x03\x12\x03\x13\x03\x13\x03\x13" +
		"\x03\x14\x03\x14\x03\x15\x03\x15\x03\x15\x03\x16\x03\x16\x03\x17\x03\x17" +
		"\x03\x17\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x19\x03\x19\x03\x19" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x03\x1B\x03\x1B" +
		"\x03\x1B\x03\x1B\x03\x1C\x03\x1C\x03\x1D\x03\x1D\x03\x1E\x06\x1E\xB3\n" +
		"\x1E\r\x1E\x0E\x1E\xB4\x03\x1F\x06\x1F\xB8\n\x1F\r\x1F\x0E\x1F\xB9\x03" +
		" \x06 \xBD\n \r \x0E \xBE\x03!\x03!\x07!\xC3\n!\f!\x0E!\xC6\v!\x02\x02" +
		"\x02\"\x03\x02\x03\x05\x02\x02\x07\x02\x02\t\x02\x02\v\x02\x02\r\x02\x02" +
		"\x0F\x02\x04\x11\x02\x05\x13\x02\x06\x15\x02\x07\x17\x02\b\x19\x02\t\x1B" +
		"\x02\n\x1D\x02\x02\x1F\x02\v!\x02\f#\x02\r%\x02\x0E\'\x02\x0F)\x02\x10" +
		"+\x02\x11-\x02\x12/\x02\x131\x02\x143\x02\x155\x02\x167\x02\x179\x02\x18" +
		";\x02\x19=\x02\x1A?\x02\x1BA\x02\x1C\x03\x02\v\x05\x02\v\f\x0F\x0F\"\"" +
		"\x05\x022;C\\c|\x04\x02$$^^\x04\x02))^^\x03\x022;\x03\x02C\\\x04\x02C" +
		"\\aa\x04\x02C\\c|\x07\x02002;C\\aac|\x02\xCE\x02\x03\x03\x02\x02\x02\x02" +
		"\x0F\x03\x02\x02\x02\x02\x11\x03\x02\x02\x02\x02\x13\x03\x02\x02\x02\x02" +
		"\x15\x03\x02\x02\x02\x02\x17\x03\x02\x02\x02\x02\x19\x03\x02\x02\x02\x02" +
		"\x1B\x03\x02\x02\x02\x02\x1F\x03\x02\x02\x02\x02!\x03\x02\x02\x02\x02" +
		"#\x03\x02\x02\x02\x02%\x03\x02\x02\x02\x02\'\x03\x02\x02\x02\x02)\x03" +
		"\x02\x02\x02\x02+\x03\x02\x02\x02\x02-\x03\x02\x02\x02\x02/\x03\x02\x02" +
		"\x02\x021\x03\x02\x02\x02\x023\x03\x02\x02\x02\x025\x03\x02\x02\x02\x02" +
		"7\x03\x02\x02\x02\x029\x03\x02\x02\x02\x02;\x03\x02\x02\x02\x02=\x03\x02" +
		"\x02\x02\x02?\x03\x02\x02\x02\x02A\x03\x02\x02\x02\x03D\x03\x02\x02\x02" +
		"\x05K\x03\x02\x02\x02\x07O\x03\x02\x02\x02\t\\\x03\x02\x02\x02\vi\x03" +
		"\x02\x02\x02\rk\x03\x02\x02\x02\x0Fr\x03\x02\x02\x02\x11t\x03\x02\x02" +
		"\x02\x13v\x03\x02\x02\x02\x15x\x03\x02\x02\x02\x17z\x03\x02\x02\x02\x19" +
		"|\x03\x02\x02\x02\x1B~\x03\x02\x02\x02\x1D\x82\x03\x02\x02\x02\x1F\x84" +
		"\x03\x02\x02\x02!\x88\x03\x02\x02\x02#\x8B\x03\x02\x02\x02%\x8D\x03\x02" +
		"\x02\x02\'\x90\x03\x02\x02\x02)\x92\x03\x02\x02\x02+\x95\x03\x02\x02\x02" +
		"-\x97\x03\x02\x02\x02/\x9A\x03\x02\x02\x021\x9F\x03\x02\x02\x023\xA2\x03" +
		"\x02\x02\x025\xA7\x03\x02\x02\x027\xAD\x03\x02\x02\x029\xAF\x03\x02\x02" +
		"\x02;\xB2\x03\x02\x02\x02=\xB7\x03\x02\x02\x02?\xBC\x03\x02\x02\x02A\xC0" +
		"\x03\x02\x02\x02CE\t\x02\x02\x02DC\x03\x02\x02\x02EF\x03\x02\x02\x02F" +
		"D\x03\x02\x02\x02FG\x03\x02\x02\x02GH\x03\x02\x02\x02HI\b\x02\x02\x02" +
		"I\x04\x03\x02\x02\x02JL\t\x03\x02\x02KJ\x03\x02\x02\x02LM\x03\x02\x02" +
		"\x02MK\x03\x02\x02\x02MN\x03\x02\x02\x02N\x06\x03\x02\x02\x02OW\x07$\x02" +
		"\x02PQ\x07^\x02\x02QV\v\x02\x02\x02RS\x07$\x02\x02SV\x07$\x02\x02TV\n" +
		"\x04\x02\x02UP\x03\x02\x02\x02UR\x03\x02\x02\x02UT\x03\x02\x02\x02VY\x03" +
		"\x02\x02\x02WU\x03\x02\x02\x02WX\x03\x02\x02\x02XZ\x03\x02\x02\x02YW\x03" +
		"\x02\x02\x02Z[\x07$\x02\x02[\b\x03\x02\x02\x02\\d\x07)\x02\x02]^\x07^" +
		"\x02\x02^c\v\x02\x02\x02_`\x07)\x02\x02`c\x07)\x02\x02ac\n\x05\x02\x02" +
		"b]\x03\x02\x02\x02b_\x03\x02\x02\x02ba\x03\x02\x02\x02cf\x03\x02\x02\x02" +
		"db\x03\x02\x02\x02de\x03\x02\x02\x02eg\x03\x02\x02\x02fd\x03\x02\x02\x02" +
		"gh\x07)\x02\x02h\n\x03\x02\x02\x02ij\t\x06\x02\x02j\f\x03\x02\x02\x02" +
		"ko\t\x07\x02\x02ln\t\b\x02\x02ml\x03\x02\x02\x02nq\x03\x02\x02\x02om\x03" +
		"\x02\x02\x02op\x03\x02\x02\x02p\x0E\x03\x02\x02\x02qo\x03\x02\x02\x02" +
		"rs\x07*\x02\x02s\x10\x03\x02\x02\x02tu\x07+\x02\x02u\x12\x03\x02\x02\x02" +
		"vw\x07.\x02\x02w\x14\x03\x02\x02\x02xy\x07)\x02\x02y\x16\x03\x02\x02\x02" +
		"z{\x07$\x02\x02{\x18\x03\x02\x02\x02|}\x07]\x02\x02}\x1A\x03\x02\x02\x02" +
		"~\x7F\x07_\x02\x02\x7F\x1C\x03\x02\x02\x02\x80\x83\x05\x15\v\x02\x81\x83" +
		"\x05\x17\f\x02\x82\x80\x03\x02\x02\x02\x82\x81\x03\x02\x02\x02\x83\x1E" +
		"\x03\x02\x02\x02\x84\x85\x07C\x02\x02\x85\x86\x07P\x02\x02\x86\x87\x07" +
		"F\x02\x02\x87 \x03\x02\x02\x02\x88\x89\x07Q\x02\x02\x89\x8A\x07T\x02\x02" +
		"\x8A\"\x03\x02\x02\x02\x8B\x8C\x07?\x02\x02\x8C$\x03\x02\x02\x02\x8D\x8E" +
		"\x07#\x02\x02\x8E\x8F\x07?\x02\x02\x8F&\x03\x02\x02\x02\x90\x91\x07@\x02" +
		"\x02\x91(\x03\x02\x02\x02\x92\x93\x07@\x02\x02\x93\x94\x07?\x02\x02\x94" +
		"*\x03\x02\x02\x02\x95\x96\x07>\x02\x02\x96,\x03\x02\x02\x02\x97\x98\x07" +
		">\x02\x02\x98\x99\x07?\x02\x02\x99.\x03\x02\x02\x02\x9A\x9B\x07N\x02\x02" +
		"\x9B\x9C\x07K\x02\x02\x9C\x9D\x07M\x02\x02\x9D\x9E\x07G\x02\x02\x9E0\x03" +
		"\x02\x02\x02\x9F\xA0\x07K\x02\x02\xA0\xA1\x07P\x02\x02\xA12\x03\x02\x02" +
		"\x02\xA2\xA3\x07V\x02\x02\xA3\xA4\x07T\x02\x02\xA4\xA5\x07W\x02\x02\xA5" +
		"\xA6\x07G\x02\x02\xA64\x03\x02\x02\x02\xA7\xA8\x07H\x02\x02\xA8\xA9\x07" +
		"C\x02\x02\xA9\xAA\x07N\x02\x02\xAA\xAB\x07U\x02\x02\xAB\xAC\x07G\x02\x02" +
		"\xAC6\x03\x02\x02\x02\xAD\xAE\x05\x07\x04\x02\xAE8\x03\x02\x02\x02\xAF" +
		"\xB0\x05\t\x05\x02\xB0:\x03\x02\x02\x02\xB1\xB3\x05\v\x06\x02\xB2\xB1" +
		"\x03\x02\x02\x02\xB3\xB4\x03\x02\x02\x02\xB4\xB2\x03\x02\x02\x02\xB4\xB5" +
		"\x03\x02\x02\x02\xB5<\x03\x02\x02\x02\xB6\xB8\t\t\x02\x02\xB7\xB6\x03" +
		"\x02\x02\x02\xB8\xB9\x03\x02\x02\x02\xB9\xB7\x03\x02\x02\x02\xB9\xBA\x03" +
		"\x02\x02\x02\xBA>\x03\x02\x02\x02\xBB\xBD\t\n\x02\x02\xBC\xBB\x03\x02" +
		"\x02\x02\xBD\xBE\x03\x02\x02\x02\xBE\xBC\x03\x02\x02\x02\xBE\xBF\x03\x02" +
		"\x02\x02\xBF@\x03\x02\x02\x02\xC0\xC4\t\x07\x02\x02\xC1\xC3\t\b\x02\x02" +
		"\xC2\xC1\x03\x02\x02\x02\xC3\xC6\x03\x02\x02\x02\xC4\xC2\x03\x02\x02\x02" +
		"\xC4\xC5\x03\x02\x02\x02\xC5B\x03\x02\x02\x02\xC6\xC4\x03\x02\x02\x02" +
		"\x0F\x02FMUWbdo\x82\xB4\xB9\xBE\xC4\x03\b\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!WebdaQLLexer.__ATN) {
			WebdaQLLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(WebdaQLLexer._serializedATN));
		}

		return WebdaQLLexer.__ATN;
	}

}

