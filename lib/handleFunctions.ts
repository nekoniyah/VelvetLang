import { evaluateElement } from "../evaluate";
import handleFunctionParameters from "./handleFunctionParameters";
import { MemoryManager } from "./MemoryManager";

export default function handleFunctions(element: any, memory: MemoryManager) {
    // Handle built-in functions
    if (["len", "round", "ceil", "floor", "print"].includes(element.name)) {
        // Existing built-in function handling code...
        return;
    }

    // Handle user-defined functions
    if (memory.hasFunction(element.name)) {
        const func = memory.getFunction(element.name);
        const scope = memory.createScope();

        // Set up parameters in new scope
        const params = handleFunctionParameters(element, memory);
        func!.params.forEach((param: any, index: number) => {
            scope.setVariable(param.name, param.type, params[index]);
        });

        try {
            // Execute function body
            for (const stmt of func!.body) {
                evaluateElement(stmt, memory);
            }
        } catch (e) {
            if (e.type === "return") {
                return e.value;
            }
            throw e;
        }
    }
}
