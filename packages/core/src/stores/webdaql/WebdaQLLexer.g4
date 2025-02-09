lexer grammar WebdaQLLexer;

// NOTE:
// This grammar is case-sensitive, although CESQL keywords are case-insensitive.
// In order to implement case-insensitivity, check out
// https://github.com/antlr/antlr4/blob/master/doc/case-insensitive-lexing.md#custom-character-streams-approach

// Skip tab, carriage return and newlines

SPACE:                               [ \t\r\n]+    -> skip;

// Fragments for Literal primitives

fragment ID_LITERAL:                 [a-zA-Z0-9]+;
fragment DQUOTA_STRING:              '"' ( '\\'. | '""' | ~('"'| '\\') )* '"';
fragment SQUOTA_STRING:              '\'' ('\\'. | '\'\'' | ~('\'' | '\\'))* '\'';
fragment INT_DIGIT:                  [0-9];
fragment FN_LITERAL:                 [A-Z] [A-Z_]*;

// Constructors symbols

LR_BRACKET:                          '(';
RR_BRACKET:                          ')';
COMMA:                               ',';
SINGLE_QUOTE_SYMB:                   '\'';
DOUBLE_QUOTE_SYMB:                   '"';
LR_SQ_BRACKET:                          '[';
RR_SQ_BRACKET:                          ']';

fragment QUOTE_SYMB
    : SINGLE_QUOTE_SYMB | DOUBLE_QUOTE_SYMB
    ;

// Operators
// - Logic

AND: 'AND';
OR: 'OR';

// - Comparison

EQUAL:                        '=';
NOT_EQUAL:                    '!=';
GREATER:                      '>';
GREATER_OR_EQUAL:             '>=';
LESS:                         '<';
LESS_OR_EQUAL:                '<=';

// Like, exists, in

LIKE: 'LIKE';
IN: 'IN';

// Booleans

TRUE: 'TRUE';
FALSE: 'FALSE';

// Limit
LIMIT: 'LIMIT';
OFFSET: 'OFFSET';

// Order by
ORDER_BY: 'ORDER BY';
ASC: 'ASC';
DESC: 'DESC';

// Literals

DQUOTED_STRING_LITERAL:                      DQUOTA_STRING;
SQUOTED_STRING_LITERAL:                      SQUOTA_STRING;
INTEGER_LITERAL:                             INT_DIGIT+;

// Identifiers

IDENTIFIER:                                 [a-zA-Z]+;
IDENTIFIER_WITH_NUMBER: [a-zA-Z0-9._]+;
FUNCTION_IDENTIFIER_WITH_UNDERSCORE:                        [A-Z] [A-Z_]*;