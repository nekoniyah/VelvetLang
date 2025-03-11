import { evaluateElement } from "../evaluate";
import handleFunctionParameters from "./handleFunctionParameters";
import { MemoryManager } from "./MemoryManager";

export default function handleFunctions(element: any, memory: MemoryManager) {
    // Handle built-in functions
    if (["len", "round", "ceil", "floor", "print"].includes(element.name)) {
        switch (element.name) {
            case "len":
                return element.value.length;
            case "round":
                return Math.round(element.value);
            case "ceil":
                return Math.ceil(element.value);
            case "floor":
                return Math.floor(element.value);
            case "print":
                console.log(...element.args);
        }
        return;
    }

    // Handle user-defined functions
    if (memory.hasFunction(element.name)) {
        const func = memory.getFunction(element.name);
        const scope = memory.createScope(); // Create new scope

        // Set up parameters in new scope
        const params = handleFunctionParameters(element, memory);
        func!.params.forEach((param: any, index: number) => {
            scope.setVariable(param.name, param.type, params[index]);
        });

        try {
            // Execute function body using the scope instead of memory
            for (const stmt of func!.body) {
                evaluateElement(stmt, scope); // Use scope instead of memory
            }
        } catch (e) {
            if (e.type === "return") {
                return e.value;
            }
            throw e;
        }
    }
}
