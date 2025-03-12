Program = Statement*


Statement
  =
    ForLoop
  / VariableDeclaration
  / Assignment
  / IfStatement
  / FunctionCall
  / ExpressionStatement
  / FunctionDeclaration         
  / ReturnStatement  
  / Comments
  / ArrayDeclaration
  / ArrayMethodCall
  

// Variable Declaration
VariableDeclaration
  = type:Type? _ name:Identifier _ ":" _ value:Expression _ {
      return { type: "variable_declaration", name, value, var_type: type ? type : "any", location:location() };
    }

// Assignment
Assignment
  = name:Identifier _ ":" _ value:Expression _ {
      return { type: "assignment", name, value, location:location() };
    }

// Function Call
FunctionCall
  = name:("len" / "round" / "ceil" / "floor" / "print" / "max" / "min" / "abs" / "json_parse" / "json_stringify") "(" _ args:Arguments? _ ")" _ {
      return { type: "function_call", name, args, location: location() };
    }

// Expression Statement
ExpressionStatement
  = expr:Expression _ {
      return { type: "expression_statement", expr, location:location() };
    }

// Expressions

Expression
  = first:Term tail:(_ ("+" / "-") _ term2:Term)* {
      return tail.reduce(function(result, element) {
        if (result instanceof String && result == "") result = { value: 0 };

        if (result instanceof Object && !result.hasOwnProperty('value')) {
          result = { value: result };
        }
        if (element[3] instanceof Object && !element[3].hasOwnProperty('value')) {
          element[3] = { value: element[3] };
        }

        if (element[1] === "+") { 
          return { value: result.value + element[3].value };
        }
        if (element[1] === "-") { 
          return { value: result.value - element[3].value }; 
        }

        return result;
      }, first);
    } / FunctionCall / ArrayMethodCall / Identifier / Literal / ArrayAccess

Term
  = first:Factor tail:(_ ("*" / "/") _ factor2:Factor)* {
      return tail.reduce(function(result, element) {
        if (result instanceof String && result == "") result = { value: 1 };

        if (result instanceof Object && !result.hasOwnProperty('value')) {
          result = { value: result };
        }
        if (element[3] instanceof Object && !element[3].hasOwnProperty('value')) {
          element[3] = { value: element[3] };
        }

        if (element[1] === "*") { 
          return { value: result.value * element[3].value };
        }
        if (element[1] === "/") { 
          return { value: result.value / element[3].value }; 
        }

        return result;
      }, first);
    } / ArrayAccess


Factor
  = ArrayAccess
  / ArrayMethodCall
  / "(" _ expr:Expression _ ")" { return expr; }
  / NumberLiteral
  / FunctionCall
  / Identifier


// Literals
Literal
  = StringLiteral
  / ArrayLiteral
  / NumberLiteral
  / BoolLiteral

StringLiteral
  = _ '"' chars:StringChar* '"' _ {
      var regex = /([^{}]+)|\{(\w+)\}/g
      let result = []
      let match;

      while ((match = regex.exec(chars.join(""))) !== null) {
          if (match[1]) {  // If a fixed string is matched
              result.push(match[1]);
          } else if (match[2]) {  // If a variable is matched
              result.push({ variable: match[2] });
          }
      }
      
      return { type: "string", chars: result, value: chars.join("") };
  }

StringChar
  = "\\\\" { return "\\"; }
  / "\\\"" { return "\""; }
  / "\\n" { return "\n"; }
  / "\\r" { return "\r"; }
  / "\\t" { return "\t"; }
  / [^\"\\]

NumberLiteral
  = value:[0-9]+ "." fraction:[0-9]+ _ {
      return { type: "float", value: parseFloat((value.join("") + "." + fraction.join("")).trim()),location:location() };
    }
  / value:[0-9]+ _ {
      return { type: "int", value: parseInt(value.join("").trim()),location:location() };
    }

BoolLiteral
  = "true" _ { return { type: "bool", value: true }; }
  / "false" _ { return { type: "bool", value: false }; }

// Identifiers
Identifier
  = [a-zA-Z_][a-zA-Z0-9_]* _ {
      return text();  // Return the identifier as a string
    }

// Types
Type
  = "String" 
  / "Int"
  / "Float"
  / "Bool"
  / "Array" / "Array " "(" Type ")"

// Arguments
Arguments
  = first:Expression rest:(_ "," _ Expression)* {
      return [first].concat(rest.map(r => r[3]));  // Collect arguments in an array
}

SimpleConditionOperator = "=" / "<" / ">"
TwoCharactersConditionOperator = "!=" / "<=" / ">="

NonCalculationStatement = Identifier / FunctionCall / Literal

Operator = TwoCharactersConditionOperator / SimpleConditionOperator

Condition = left:NonCalculationStatement _ operator:Operator _ right:NonCalculationStatement {
    return { type: "condition", left, operator, right, location: location() };
}

MultipleStatements = statements:(_ Statement) _ {
  return statements.filter(s =>  s !== null).filter(s => !("length" in s))
}

// Add rule for for loop
ForLoop = "for" " " name:Identifier "in" " " start:Expression "to" " " end:Expression ":" "\r" statements:MultipleStatements {
    return { type: "for", name, start, end, statements, location: location() };
}


IfStatement
  = "if" " " condition:Condition ":" "\r" statements:MultipleStatements 
    elseIfParts:ElseIfPart* 
    elsePart:ElsePart? {
      return { 
        type: "if",
        condition,
        statements,
        elseIfParts: elseIfParts || [],
        elsePart: elsePart,
        location: location()
      };
    }

// Add new rules for else-if and else
ElseIfPart
  = "else if" " " condition:Condition ":" "\r" statements:MultipleStatements {
      return {
        condition,
        statements
      };
    }

ElsePart
  = "else" ":" "\r" statements:MultipleStatements {
      return {
        statements
      };
    }

NotNewLine = [ \t\r]*

Comments
  = _ "//" _ {
    return { type: "comment", value: text(), location: location() };
}


// Add new rules for functions
FunctionDeclaration
  = "func" " " name:Identifier "(" _ params:Parameters? _ ")" ":" "\r" body:MultipleStatements {
      return {
        type: "function_declaration",
        name,
        params: params || [],
        body,
        location: location()
      };
    }

Parameters
  = first:Parameter rest:(_ "," _ Parameter)* {
      return [first].concat(rest.map(r => r[3]));
    }

Parameter
  = type:Type? _ name:Identifier {
      return { name, type: type || "any" };
    }

ReturnStatement
  = "return" " " value:Expression _ {
      return { type: "return", value, location: location() };
    }

// Array Declaration
ArrayDeclaration
  = "Array" "(" type:Type ")" NotNewLine name:Identifier NotNewLine ":" NotNewLine value:ArrayLiteral _ {
      return { type: "array_declaration", name, value, array_type: type, location: location() };
    }
  / "Array" name:Identifier NotNewLine ":" NotNewLine value:ArrayLiteral _ {
      return { type: "array_declaration", name, value, array_type: "any", location: location() };
    }

// Array Literal
ArrayLiteral
  = "[" NotNewLine elements:ExpressionList? NotNewLine "]" {
      return elements || [];
    }

// Expression List
ExpressionList
  = first:Expression rest:(_ "," _ Expression)* {
      return [first].concat(rest.map(r => r[3]));
    }

// Array Access
ArrayAccess
  = array:Identifier "[" _ index:Expression _ "]" {
      return { type: "array_access", array, index, location: location() };
    }

// Array Method Call
ArrayMethodCall
  = array:Identifier "." method:("push" / "pop" / "length" / "join") "(" _ args:Arguments? _ ")" _ {
      return { type: "array_method_call", array, method, args: args || [], location: location() };
    }

_ = [ \t\r\n]*