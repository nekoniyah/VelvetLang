import handleFunctions from "./handleFunctions";
import { MemoryManager } from "./MemoryManager";

export default function handleFunctionParameters(
    element: any,
    variableMemory: MemoryManager
): any[] {
    if (element.value === "true" || element.value === "false") {
        return [element.value === "true"];
    }

    if (typeof element.value === "string") {
        if (!variableMemory.hasVariable(element.value)) {
            return [undefined];
        }

        return [variableMemory.getVariable(element.value)?.value];
    } else {
        if (!element.args) return [];

        let args = element.args.map((arg: any) => {
            if (arg.type === "function_call")
                // @ts-ignore
                return handleFunctions(arg, variableMemory)?.value;

            if (typeof arg === "string") {
                if (arg === "true" || arg === "false") {
                    return arg === "true";
                }

                if (!variableMemory.hasVariable(arg)) return undefined;

                return variableMemory.getVariable(arg)?.value;
            } else return arg.chars ? arg.chars.join(" ") : arg.value;
        });

        return args;
    }
}
