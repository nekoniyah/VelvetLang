import assignmentHandler from "./assignmentHandler";
import { VelvetError } from "./ErrorHandler";
import handleFunctions from "./handleFunctions";

export default function variableDeclaraton(element: any, variableMemory: any) {
    let { name, var_type, value } = element;

    let isReturn = false;
    let strictVarType = var_type === "any" ? "any" : value.type.toLowerCase();

    if (variableMemory.has(name) && strictVarType === "any") {
        assignmentHandler(element, variableMemory);
        return;
    }

    if (variableMemory.has(name) && strictVarType !== "any") {
        new VelvetError(
            `Variable ${name} already declared`,
            element.row,
            element.col,
            element.text
        );
    }

    if (element.value && element.value.type === "function_call") {
        value = handleFunctions(value, variableMemory);
        isReturn = true;
    }

    if (!isReturn && strictVarType !== "any" && strictVarType !== value.type) {
        new VelvetError(
            `Type mismatch: ${strictVarType} != ${value.type}`,
            element.row,
            element.col,
            element.text
        );
    }

    if (strictVarType === "string") {
        let finalString = "";

        if (value && value.chars) {
            for (let char of value.chars) {
                if (typeof char === "object" && "variable" in char) {
                    if (!variableMemory.has(char.variable)) {
                        finalString += "undefined";
                    } else {
                        let variable = variableMemory.get(char.variable)!;
                        if (variable.type !== "String") {
                            finalString += "undefined";
                        }
                        finalString += variable.value;
                        break;
                    }
                }

                finalString += char;
            }
        } else {
            finalString = value.value || value;
        }

        variableMemory.set(name, {
            type: strictVarType,
            value: finalString || value,
        });
    }

    if (strictVarType === "bool") {
        variableMemory.set(name, {
            type: strictVarType,
            value: value.value || value,
        });
    }

    if (strictVarType === "float") {
        variableMemory.set(name, {
            type: strictVarType,
            value: value.value,
        });
    }

    if (strictVarType === "int") {
        variableMemory.set(name, {
            type: strictVarType,
            value: parseInt(value.value || value),
        });
    }

    if (strictVarType === "any") {
        variableMemory.set(name, {
            type: strictVarType,
            value: value.value || value,
        });
    }
}
