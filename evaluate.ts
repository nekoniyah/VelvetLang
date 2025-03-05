import variableDeclaraton from "./lib/variableDeclaration";
import handleFunctions from "./lib/handleFunctions";
import { parser } from "./parser";

function evaluate(text: string) {
    let ast = parser.parse(text);

    const variableMemory: Map<string, { type: string; value: any }> = new Map();

    ast.forEach((element: any, line: number) => {
        console.log(element);
        element = Object.assign(element, { line: line + 1 });

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
