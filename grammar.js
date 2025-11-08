/**
 * @file Typescript validator DSL
 * @author Jeff Martin <jeffmartin@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'arktype',

  conflicts: $ => [[$.member_expression, $.member_expression]],

  rules: {
    type: $ => seq(repeat(choice($.expression, $.parenthesized_expression))),

    _expressions: $ => choice($.expression),

    expression: $ =>
      choice(
        $.identifier,
        $.operator,
        $.regex,
        $.number,
        $.member_expression,
        $.string
      ),

    parenthesized_expression: $ => seq('(', repeat($._expressions), ')'),

    keyword: _ => /(\w)+/,

    member_expression: $ =>
      prec(
        10,
        seq(
          field('object', $.primitive),
          field('dot', '.'),
          field('property', $.keyword),
          repeat(seq(field('dot', '.'), field('property', $.keyword)))
        )
      ),

    string: $ =>
      choice(
        seq(
          '"',
          repeat(
            choice(
              alias($.unescaped_double_string_fragment, $.string_fragment),
              $.escape_sequence
            )
          )
        ),
        seq(
          "'",
          repeat(
            choice(
              alias($.unescaped_single_string_fragment, $.string_fragment),
              $.escape_sequence
            )
          ),
          "'"
        )
      ),

    // Workaround to https://github.com/tree-sitter/tree-sitter/issues/1156
    // We give names to the token() constructs containing a regexp
    // so as to obtain a node in the CST.
    //
    unescaped_double_string_fragment: _ =>
      token.immediate(prec(1, /[^"\\\r\n]+/)),

    // same here
    unescaped_single_string_fragment: _ =>
      token.immediate(prec(1, /[^'\\\r\n]+/)),

    escape_sequence: _ =>
      token.immediate(
        seq(
          '\\',
          choice(
            /[^xu0-7]/,
            /[0-7]{1,3}/,
            /x[0-9a-fA-F]{2}/,
            /u[0-9a-fA-F]{4}/,
            /u\{[0-9a-fA-F]+\}/,
            /[\r?][\n\u2028\u2029]/
          )
        )
      ),

    operator: _ => choice('.', '[]', '<', '<=', '>', '>=', '&', '|', '%'),

    primitive: _ =>
      choice(
        'string',
        'number',
        'bigint',
        'symbol',
        'boolean',
        'null',
        'undefined',
        'this'
      ),

    literal: _ => choice('true', 'false'),

    identifier: $ => choice($.primitive, $.literal, $.keyword),

    regex: $ =>
      seq(
        '/',
        field('pattern', $.regex_pattern),
        token.immediate(prec(1, '/')),
        optional(field('flags', $.regex_flags))
      ),

    regex_pattern: _ =>
      token.immediate(
        prec(
          -1,
          repeat1(
            choice(
              seq(
                '[',
                repeat(
                  choice(
                    seq('\\', /./), // escaped character
                    /[^\]\n\\]/ // any character besides ']' or '\n'
                  )
                ),
                ']'
              ), // square-bracket-delimited character class
              seq('\\', /./), // escaped character
              /[^/\\\[\n]/ // any character besides '[', '\', '/', '\n'
            )
          )
        )
      ),

    regex_flags: _ => token.immediate(/[a-z]+/),

    number: _ => {
      const decimalDigits = /\d(_?\d)*/

      const bigintLiteral = seq(decimalDigits, 'n')

      const decimalIntegerLiteral = choice(
        '0',
        seq(optional('0'), /[1-9]/, optional(seq(optional('_'), decimalDigits)))
      )

      const decimalLiteral = choice(
        seq(decimalIntegerLiteral, '.', optional(decimalDigits)),
        decimalDigits
      )

      return token(choice(decimalLiteral, bigintLiteral))
    },
  },
})
