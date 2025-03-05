import handleFunctions from "./handleFunctions";

export default function variableDeclaraton(element: any, variableMemory: any) {
    let { name, var_type, value } = element;
    let isReturn = false;
    let strictVarType = var_type === "any" ? value.type : var_type;

    if (element.value && element.value.type === "function_call") {
        value = handleFunctions(value, variableMemory);
        isReturn = true;
    }

    if (!isReturn && strictVarType.toLowerCase() !== value.type) {
        console.error(`Type mismatch: ${strictVarType} != ${value.type}`);
        process.exit(1);
    }

    console.log(`Variable ${name} of type ${strictVarType} declared`);

    if (strictVarType.toLowerCase() === "string") {
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

    if (strictVarType.toLowerCase() === "bool") {
        variableMemory.set(name, {
            type: strictVarType,
            value: value.value || value,
        });
    }

    if (strictVarType.toLowerCase() === "float") {
        variableMemory.set(name, {
            type: strictVarType,
            value: value.value,
        });
    }

    if (strictVarType.toLowerCase() === "int") {
        variableMemory.set(name, {
            type: strictVarType,
            value: parseInt(value.value || value),
        });
    }
}
