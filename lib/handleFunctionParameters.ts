import handleFunctions from "./handleFunctions";
import { MemoryManager } from "./MemoryManager";
import { evaluateExpression } from "../evaluate";

export default function handleFunctionParameters(
    element: any,
    variableMemory: MemoryManager
): any[] {
    if (element.value === "true" || element.value === "false") {
        return [element.value === "true"];
    } else if (typeof element.value === "string") {
        if (!variableMemory.hasVariable(element.value)) {
            return [undefined];
        }

        if (Array.isArray(variableMemory.getVariable(element.value)?.value)) {
            return variableMemory
                .getVariable(element.value)
                ?.value.map((e: any) => e.value);
        }

        return [variableMemory.getVariable(element.value)?.value];
    } else {
        if (!element.args) return [];

        let args = element.args.map((arg: any) => {
            // Handle array access
            if (arg.type === "array_access") {
                return evaluateExpression(arg, variableMemory);
            }

            if (arg.type === "function_call")
                // @ts-ignore
                return handleFunctions(arg, variableMemory)?.value;

            if (typeof arg === "string") {
                if (arg === "true" || arg === "false") {
                    return arg === "true";
                }

                if (Array.isArray(variableMemory.getVariable(arg)?.value)) {
                    return variableMemory
                        .getVariable(arg)
                        ?.value.map((e: any) => e.value);
                }

                if (!variableMemory.hasVariable(arg)) return undefined;

                return variableMemory.getVariable(arg)?.value;
            } else return arg.chars ? arg.chars.join(" ") : arg.value;
        });

        return args;
    }
}
