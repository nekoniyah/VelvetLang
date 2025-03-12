import { evaluateElement } from "../evaluate";
import handleFunctionParameters from "./handleFunctionParameters";
import { MemoryManager } from "./MemoryManager";

export default function handleFunctions(element: any, memory: MemoryManager) {
    let args = handleFunctionParameters(element, memory);
    // Handle built-in functions
    if (
        [
            "len",
            "round",
            "ceil",
            "floor",
            "print",
            "json_stringify",
            "json_parse",
        ].includes(element.name)
    ) {
        switch (element.name) {
            case "len":
                return args[0].length;
            case "round":
                return Math.round(args[0]);
            case "ceil":
                return Math.ceil(args[0]);
            case "floor":
                return Math.floor(args[0]);
            case "print":
                console.log(...args);
                break;
            case "json_stringify":
                try {
                    console.log("json_stringify called with args:", args);
                    const result = JSON.stringify(args[0]);
                    console.log("Stringified result:", result);
                    return result;
                } catch (error) {
                    console.error("JSON stringify error:", error);
                    return "Error: " + error.message;
                }
            case "json_parse":
                try {
                    console.log("json_parse called with args:", args);
                    return JSON.parse(args[0]);
                } catch (error) {
                    console.error("JSON parse error:", error);
                    return "Error: " + error.message;
                }
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
