import variableDeclaraton from "./lib/variableDeclaration";
import handleFunctions from "./lib/handleFunctions";
import { parser } from "./parser";
import evaluateCondition from "./lib/evaluateCondition";

function evaluate(text: string) {
    let ast = parser.parse(text);

    const variableMemory: Map<string, { type: string; value: any }> = new Map();

    ast.forEach((element: any) => {
        element = Object.assign(element, {
            row: element.location.start.line,
            col: element.location.start.column,
            text: text,
        });

        switch (element.type) {
            case "assignment":
                variableMemory.set(element.name, {
                    type: element.value.type,
                    value: element.value.value,
                });
                break;
            case "variable_declaration":
                variableDeclaraton(element, variableMemory);
                break;
            case "function_call":
                handleFunctions(element, variableMemory);
                break;
            case "if_statement":
                evaluateCondition(element.condition, variableMemory) &&
                    element.body.forEach((stmt: any) => evaluate(stmt));
                break;
            case "if_else_statement":
                if (evaluateCondition(element.condition, variableMemory)) {
                    element.ifBody.forEach((stmt: any) => evaluate(stmt));
                } else {
                    element.elseBody.forEach((stmt: any) => evaluate(stmt));
                }
                break;
        }
    });
}

export default evaluate;
