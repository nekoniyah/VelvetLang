Program = Statement*


Statement
  =
   VariableDeclaration
  / Assignment
  / IfStatement
  / FunctionCall
  / ExpressionStatement
  / FunctionDeclaration  
  / ForLoop           
  / ReturnStatement  
  / Comments
  

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
  = name:("len" / "round" / "ceil" / "floor" / "print") "(" _ args:Arguments? _ ")" _ {
      return { type: "function_call", name, args, location: location() };
    }

// Expression Statement
ExpressionStatement
  = expr:Expression _ {
      return { type: "expression_statement", expr, location:location() };
    }

// Expressions

Expression
  = term:Term tail:(_ ("+" / "-") _ term2:Term)* {
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
      }, term);
    } / FunctionCall / Identifier / Literal

Term
  = factor:Factor tail:(_ ("*" / "/") _ factor2:Factor)* {
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
      }, factor);
    }


Factor
  = "(" _ expr:Expression _ ")" { return expr; }
  / NumberLiteral / FunctionCall
  / Identifier


// Literals
Literal
  = StringLiteral
  / NumberLiteral
  / BoolLiteral

StringLiteral
  = _ '"' chars: ([^\"]*) '"' _ {
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
  = "func" _ name:Identifier "(" _ params:Parameters? _ ")" ":" "\r" body:MultipleStatements {
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
  = "return" _ value:Expression _ {
      return { type: "return", value, location: location() };
    }

// Add rule for for loop
ForLoop
  = "for" _ variable:Identifier _ "in" _ start:Expression _ "to" _ end:Expression ":" "\r" body:MultipleStatements {
      return {
        type: "for_loop",
        variable,
        start,
        end,
        body,
        location: location()
      };
    }

_ = [ \t\r\n]*