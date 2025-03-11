import handleFunctions from "./handleFunctions";
import { VelvetError } from "./ErrorHandler";
export default function assignmentHandler(element: any, variableMemory: any) {
    let { value } = element;
    let isReturn = false;

    if (element.value && element.value.type === "function_call") {
        value = handleFunctions(value, variableMemory);
        isReturn = true;
    }

    let strictVarType = variableMemory.get(element.name)!.type;
    if (!isReturn && strictVarType !== "any" && strictVarType !== value.type) {
        new VelvetError(
            `Type mismatch: ${strictVarType} != ${value.type}`,
            element.row,
            element.col,
            element.text
        );
    }

    variableMemory.set(element.name, {
        type: element.value.type,
        value: element.value.value,
    });
}
