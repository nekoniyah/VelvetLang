import handleFunctions from "./handleFunctions";
import { VelvetError } from "./ErrorHandler";
import { MemoryManager } from "./MemoryManager";
export default function assignmentHandler(
    element: any,
    variableMemory: MemoryManager
) {
    let { value } = element;
    let isReturn = false;

    if (element.value && element.value.type === "function_call") {
        value = handleFunctions(value, variableMemory);
        isReturn = true;
    }

    let strictVarType = variableMemory.getVariable(element.name)?.value;
    if (!isReturn && strictVarType !== "any" && strictVarType !== value.type) {
        new VelvetError(
            `Type mismatch: ${strictVarType} != ${value.type}`,
            element.row,
            element.col,
            element.text
        );
    }

    variableMemory.setVariable(
        element.name,
        element.value.type,
        element.value.value
    );
}
