import ace from './ace.js';

export default "mode-sql-plus-plus";

(function() {

  // some globals used by both the highlighter and the autocompleter
  var keywords = (
      "all|alter|and|any|apply|as|asc|at|autogenerated|between|btree|by|case|closed|collection|compact|compaction|connect|connected|correlate|create|current|dataset|dataverse|declare|definition|delete|desc|disconnect|distinct|div|drop|element|else|end|enforced|every|except|exclude|exists|explain|external|feed|filter|first|flatten|following|for|from|full|fulltext|function|group|groups|having|hints|if|ignore|in|index|ingestion|inner|insert|internal|intersect|into|is|join|key|keyword|known|last|left|let|letting|like|limit|link|load|missing|mod|ngram|no|nodegroup|not|null|nulls|offset|on|open|or|order|others|outer|output|over|partition|path|policy|preceding|primary|range|raw|refresh|respect|return|returning|row|rows|rtree|run|satisfies|secondary|select|set|some|start|stop|temporary|then|ties|to|type|unbounded|union all|union|unknown|unnest|update|upsert|use|using|value|valued|when|where|with|write"
  );
  var keywords_array = keywords.split('|');

  var builtinConstants = (
      "true|false"
  );
  var builtinConstants_array = builtinConstants.split('|');

  var builtinFunctions = (
      "ABS|ACOS|ARRAY_APPEND|ARRAY_AVG|ARRAY_CONCAT|ARRAY_CONTAINS|ARRAY_COUNT|ARRAY_DISTINCT|ARRAY_FLATTEN|ARRAY_IFNULL|ARRAY_INSERT|ARRAY_INTERSECT|ARRAY_LENGTH|ARRAY_MAX|ARRAY_MIN|ARRAY_POSITION|ARRAY_PREPEND|ARRAY_PUT|ARRAY_RANGE|ARRAY_REMOVE|ARRAY_REPEAT|ARRAY_REPLACE|ARRAY_REVERSE|ARRAY_SORT|ARRAY_STAR|ARRAY_SUM|ARRAY_SYMDIFF|ARRAY_SYMDIFF1|ARRAY_SYMDIFFN|ARRAY_UNION|ASIN|ATAN|ATAN2|AVG|CEIL|CLOCK_LOCAL|CLOCK_MILLIS|CLOCK_STR|CLOCK_TZ|CLOCK_UTC|CONCAT|CONTAINS|COS|COUNT|DATE_ADD_MILLIS|DATE_ADD_STR|DATE_DIFF_MILLIS|DATE_DIFF_STR|DATE_FORMAT_STR|DATE_PART_MILLIS|DATE_PART_STR|DATE_RANGE_MILLIS|DATE_RANGE_STR|DATE_TRUNC_MILLIS|DATE_TRUNC_STR|DECODE_JSON|DEGREES|DURATION_TO_STR|E|ENCODE_JSON|ENCODED_SIZE|EXP|FLOOR|GREATEST|IF_INF|IF_MISSING|IF_MISSING_OR_NULL|IF_NAN|IF_NAN_OR_INF|IF_NULL|IFINF|IFMISSING|IFMISSINGORNULL|IFNAN|IFNANORINF|IFNULL|INITCAP|IS_ARRAY|IS_ATOM|IS_BOOL|IS_BOOLEAN|IS_NUM|IS_NUMBER|IS_OBJ|IS_OBJECT|IS_STR|IS_STRING|ISARRAY|ISATOM|ISBOOL|ISBOOLEAN|ISNUM|ISNUMBER|ISOBJ|ISOBJECT|ISSTR|ISSTRING|LEAST|LENGTH|LN|LOG|LOWER|LTRIM|MAX|META|MILLIS|MILLIS_TO_LOCAL|MILLIS_TO_STR|MILLIS_TO_TZ|MILLIS_TO_UTC|MILLIS_TO_ZONE_NAME|MIN|MISSING_IF|MISSINGIF|NAN_IF|NANIF|NEGINF_IF|NEGINFIF|NOW_LOCAL|NOW_MILLIS|NOW_STR|NOW_TZ|NOW_UTC|NULL_IF|NULLIF|OBJECT_ADD|OBJECT_CONCAT|OBJECT_INNER_VALUES|OBJECT_LENGTH|OBJECT_NAMES|OBJECT_PAIRS|OBJECT_PUT|OBJECT_REMOVE|OBJECT_RENAME|OBJECT_REPLACE|OBJECT_UNWRAP|OBJECT_VALUES|PAIRS|PI|POSINF_IF|POSINFIF|POSITION|POWER|RADIANS|RANDOM|REGEXP_CONTAINS|REGEXP_LIKE|REGEXP_POSITION|REGEXP_REPLACE|REPEAT|REPLACE|REVERSE|ROUND|RTRIM|SIGN|SIN|SPLIT|SQRT|STR_TO_DURATION|STR_TO_MILLIS|STR_TO_TZ|STR_TO_UTC|STR_TO_ZONE_NAME|SUBSTR|SUM|TAN|TITLE|TO_ARRAY|TO_ATOM|TO_BOOL|TO_BOOLEAN|TO_NUM|TO_NUMBER|TO_OBJ|TO_OBJECT|TO_STR|TO_STRING|TOARRAY|TOATOM|TOBOOL|TOBOOLEAN|TONUM|TONUMBER|TOOBJ|TOOBJECT|TOSTR|TOSTRING|TRIM|TRUNC|TYPE|TYPENAME|UPPER|UUID|WEEKDAY_MILLIS|WEEKDAY_STR"
  );
  var builtinFunctions_array = builtinFunctions.split('|');

  var dataTypes = (
      ""
  );
  var dataTypes_array = dataTypes.split('|');

  var terms = [
    {name:"keyword", tokens: keywords_array},
    {name:"built-in", tokens: builtinConstants_array},
    {name:"function", tokens: builtinFunctions_array}
  ];

  ace.define("ace/mode/sql-plus-plus_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],
      function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var SqlPlusPlusHighlightRules = function() {

      var keywordMapper = this.createKeywordMapper({
        "support.function": builtinFunctions,
        "keyword": keywords,
        "constant.language": builtinConstants,
        "storage.type": dataTypes
      }, "identifier", true);

      this.$rules = {
          "start" : [ {
            token : "comment",
            regex : "--.*$"
          },  {
            token : "comment",
            start : "/\\*",
            end : "\\*/"
          }, {
            token : "constant.numeric",   // " string, make blue like numbers
            regex : '".*?"'
          }, {
            token : "constant.numeric",   // ' string, make blue like numbers
            regex : "'.*?'"
          }, {
            token : "identifier",         // ` quoted identifier, make like identifiers
            regex : "[`](([`][`])|[^`])+[`]"
          }, {
            token : "constant.numeric",   // float
            regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
          }, {
            token : keywordMapper,
            regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
          }, {
            token : "keyword.operator",
            regex : "\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|="
          }, {
            token : "paren.lparen",
            regex : "[\\(]"
          }, {
            token : "paren.rparen",
            regex : "[\\)]"
          }, {
            token : "text",
            regex : "\\s+"
          } ]
      };
      this.normalizeRules();
    };

    oop.inherits(SqlPlusPlusHighlightRules, TextHighlightRules);

    exports.SqlPlusPlusHighlightRules = SqlPlusPlusHighlightRules;
  });


  /*
   * Define the SQL++ mode
   */

  ace.define("ace/mode/sql-plus-plus_completions",["require","exports","module","ace/token_iterator"], function(require, exports, module) {
    "use strict";

    var TokenIterator = require("../token_iterator").TokenIterator;


    function is(token, type) {
      return token.type.lastIndexOf(type + ".xml") > -1;
    }

    function findTagName(session, pos) {
      var iterator = new TokenIterator(session, pos.row, pos.column);
      var token = iterator.getCurrentToken();
      while (token && !is(token, "tag-name")){
        token = iterator.stepBackward();
      }
      if (token)
        return token.value;
    }

    var SqlPlusPlusCompletions = function() {
    };

    (function() {

      this.getCompletions = function(state, session, pos, prefix) {
        var token = session.getTokenAt(pos.row, pos.column);
        var results = [];
        var prefix_upper = prefix.toLocaleUpperCase();
        for (var i = 0; i < terms.length; i++) {
          for (var t = 0; t < terms[i].tokens.length; t++) {
            if (_.startsWith(terms[i].tokens[t].toLocaleUpperCase(), prefix_upper)) {
              results.push({ value: terms[i].tokens[t], meta: terms[i].name, score: 1 });
            }
          }
        }
        return results;
      };
    }).call(SqlPlusPlusCompletions.prototype);

    exports.SqlPlusPlusCompletions = SqlPlusPlusCompletions;
  });

  ace.define("ace/mode/sql-plus-plus",["require","exports","module","ace/lib/oop","ace/mode/text",
    "ace/mode/sql-plus-plus_highlight_rules","ace/mode/query-formatter"],
      function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var TextMode = require("./text").Mode;
    var SqlPlusPlusHighlightRules = require("./sql-plus-plus_highlight_rules").SqlPlusPlusHighlightRules;
    var SqlPlusPlusCompletions = require("./sql-plus-plus_completions").SqlPlusPlusCompletions;

    //////////////////////////////////////////////////////////////////////////////////////
    // build a SQL++ formatter from the more generic formatter package
    //
    // it needs to know keywords or function names (to be upper cased)
    //////////////////////////////////////////////////////////////////////////////////////

    var kw_regex_str = '\\b(' + keywords + '|' + builtinConstants + ')\\b';
    var function_regex_str = '\\b(' + builtinFunctions + ')\\s*\\(';

    var formatter = require("ace/mode/query-formatter").create(kw_regex_str,function_regex_str);

    //////////////////////////////////////////////////////////////////////////////////////

    var Mode = function() {
      this.HighlightRules = SqlPlusPlusHighlightRules;
      this.$completer = new SqlPlusPlusCompletions();
      this.format = formatter;
    };
    oop.inherits(Mode, TextMode);

    (function() {

      this.lineCommentStart = "--";

      this.getCompletions = function(state, session, pos, prefix) {
        return this.$completer.getCompletions(state, session, pos, prefix);
      };

      this.$id = "ace/mode/sql-plus-plus";
    }).call(Mode.prototype);

    exports.Mode = Mode;
    exports.Instance = new Mode();

  });

})();

