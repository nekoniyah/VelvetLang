export default function variableDeclaraton(
    name: string,
    var_type: string,
    value: any,
    variableMemory: any
) {
    let strictVarType = var_type === "any" ? value.type : var_type;

    if (strictVarType.toLowerCase() !== value.type) {
        console.error(`Type mismatch: ${strictVarType} != ${value.type}`);
        process.exit(1);
    }

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
            finalString = value.value;
        }

        variableMemory.set(name, {
            type: strictVarType,
            value: finalString,
        });
    }

    if (strictVarType.toLowerCase() === "Number") {
        variableMemory.set(name, {
            type: strictVarType,
            value: value.value,
        });
    }

    if (strictVarType.toLowerCase() === "Bool") {
        variableMemory.set(name, {
            type: strictVarType,
            value: value.value,
        });
    }

    if (strictVarType.toLowerCase() === "Float") {
        variableMemory.set(name, {
            type: strictVarType,
            value: value.value,
        });
    }
}
