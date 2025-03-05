import variableDeclaraton from "./lib/variableDeclaration";
import handleFunctions from "./lib/handleFunctions";
import { parser } from "./parser";

function evaluate(text: string) {
    let ast = parser.parse(text);

    const variableMemory: Map<string, { type: string; value: any }> = new Map();

    let textToArray = text.split("\n");

    ast.forEach((element: any, line: number) => {
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
                variableDeclaraton(
                    element.name,
                    element.var_type,
                    element.value,
                    variableMemory
                );
                break;
            case "function_call":
                handleFunctions(element, variableMemory);
                break;
        }
    });
}

export default evaluate;
