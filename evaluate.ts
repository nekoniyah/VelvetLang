import variableDeclaraton from "./lib/variableDeclaration";
import handleFunctions from "./lib/handleFunctions";
import { parser } from "./parser";
import evaluateCondition from "./lib/evaluateCondition";

function evaluate(text: string) {
    let ast = parser.parse(text);

    const variableMemory: Map<string, { type: string; value: any }> = new Map();

    function evaluateElement(element: any) {
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
            case "if":
                let result = evaluateCondition(element, variableMemory);
                if (result) {
                    let statements = element.statements;

                    statements
                        .map((s: any) => s.expr)
                        .forEach((statement: any) => {
                            evaluateElement(statement);
                        });
                }
                break;
        }
    }

    ast.forEach((element: any) => {
        evaluateElement(element.expr || element);
    });
}

export default evaluate;
