import variableDeclarator from "./lib/variableDeclaration";
import handleFunctions from "./lib/handleFunctions";
import { parser } from "./parser";
import evaluateCondition from "./lib/evaluateCondition";
import assignmentHandler from "./lib/assignmentHandler";
import { MemoryManager } from "./lib/MemoryManager";
import { VelvetError } from "./lib/ErrorHandler";

export function evaluateElement(element: any, memory: MemoryManager) {
    // Dispatch table for evaluation
    const handlers: Record<string, (element: any) => void> = {
        assignment: (element) => assignmentHandler(element, memory),
        function_call: (element) => handleFunctions(element, memory),
        function_declaration: (element) =>
            handleFunctionDeclaration(element, memory),
        if: (element) => evaluateIfStatement(element, memory),
        for: (element) => evaluateForLoop(element, memory),
        return: (element) => handleReturn(element, memory),
        variable_declaration: (element) => variableDeclarator(element, memory),
        array_declaration: (element) => handleArrayDeclaration(element, memory),
        array_method_call: (element) => evaluateExpression(element, memory),
    };

    const handler = handlers[element.type];
    if (handler) {
        handler(element);
    }

    function handleFunctionDeclaration(element: any, memory: MemoryManager) {
        memory.setFunction(element.name, {
            params: element.params,
            body: element.body,
        });
    }

    function evaluateForLoop(element: any, memory: MemoryManager) {
        const start = evaluateExpression(element.start, memory);
        const end = evaluateExpression(element.end, memory);

        memory.setVariable(element.name, "int", start);

        for (let i = start; i <= end; i++) {
            memory.setVariable(element.name, "int", i);
            for (const stmt of element.statements) {
                evaluateElement(stmt, memory);
            }
        }
    }

    function handleReturn(element: any, memory: MemoryManager) {
        const value = evaluateExpression(element.value, memory);
        throw { type: "return", value };
    }
    function evaluateIfStatement(element: any, memory: MemoryManager) {
        // The condition is directly in element.condition, not nested
        const mainConditionResult = evaluateCondition(
            { condition: element.condition }, // Wrap it properly for evaluateCondition
            memory
        );

        if (mainConditionResult) {
            // Execute main if block
            for (const stmt of element.statements || []) {
                evaluateElement(stmt, memory);
            }
            return;
        }

        // Check else-if conditions
        for (const elseIfPart of element.elseIfParts || []) {
            const elseIfConditionResult = evaluateCondition(
                { condition: elseIfPart.condition }, // Wrap it properly here too
                memory
            );

            if (elseIfConditionResult) {
                for (const stmt of elseIfPart.statements || []) {
                    evaluateElement(stmt, memory);
                }
                return;
            }
        }

        // If no conditions matched and there's an else block, execute it
        if (element.elsePart) {
            for (const stmt of element.elsePart.statements || []) {
                evaluateElement(stmt, memory);
            }
        }
    }

    function handleArrayDeclaration(element: any, memory: MemoryManager) {
        const evaluatedElements = (element.value || element.value.value).map(
            (expr: any) => evaluateExpression(expr, memory)
        );

        memory.setVariable(element.name, element.array_type, evaluatedElements);
    }
}

export function evaluateExpression(expr: any, memory: MemoryManager) {
    // Handle different types of expressions
    if (
        typeof expr === "number" ||
        typeof expr === "string" ||
        typeof expr === "boolean"
    ) {
        return expr;
    }

    // Handle variable references
    if (typeof expr === "string" && memory.hasVariable(expr)) {
        if (Array.isArray(memory.getVariable(expr)?.value)) {
            return memory.getVariable(expr)?.value.map((e: any) => e.value);
        }

        return memory.getVariable(expr)?.value;
    }

    // Handle objects with value property
    if (expr && typeof expr === "object" && "value" in expr) {
        return expr.value;
    }

    // Handle function calls
    if (expr && expr.type === "function_call") {
        switch (expr.name) {
            case "max":
                return Math.max(
                    ...expr.args.map((arg) => evaluateExpression(arg, memory))
                );
            case "min":
                return Math.min(
                    ...expr.args.map((arg) => evaluateExpression(arg, memory))
                );
            case "abs":
                return Math.abs(evaluateExpression(expr.args[0], memory));
            case "json_parse":
                try {
                    const jsonString = evaluateExpression(expr.args[0], memory);
                    if (typeof jsonString !== "string") {
                        new VelvetError(
                            "json_parse expects a string argument",
                            0,
                            0,
                            "",
                            "JSON Error"
                        ).handleError();
                        return null;
                    }

                    const parsed = JSON.parse(jsonString);

                    // Convert the parsed JSON to Velvet data structures
                    return convertJsonToVelvet(parsed);
                } catch (error) {
                    new VelvetError(
                        `JSON parse error: ${error.message}`,
                        0,
                        0,
                        "",
                        "JSON Error"
                    ).handleError();
                    return null;
                }
            case "json_stringify":
                try {
                    console.log("json_stringify called with args:", expr.args);
                    const value = evaluateExpression(expr.args[0], memory);
                    console.log("Value to stringify:", value);

                    // Convert Velvet data structures to JSON-compatible objects
                    const jsonCompatible = convertVelvetToJson(value);
                    console.log("JSON compatible value:", jsonCompatible);

                    const result = JSON.stringify(jsonCompatible);
                    console.log("Stringified result:", result);
                    return result;
                } catch (error) {
                    console.error("JSON stringify error:", error);
                    new VelvetError(
                        `JSON stringify error: ${error.message}`,
                        0,
                        0,
                        "",
                        "JSON Error"
                    ).handleError();
                    return null;
                }
            default:
                return handleFunctions(expr, memory);
        }
    }

    // Handle expressions with mathematical operations
    if (expr && expr.type === "expression") {
        const left = evaluateExpression(expr.left, memory);
        const right = evaluateExpression(expr.right, memory);

        switch (expr.operator) {
            case "+":
                return left + right;
            case "-":
                return left - right;
            case "*":
                return left * right;
            case "/":
                return left / right;
            default:
                return 0;
        }
    }

    // Handle array access
    if (expr && expr.type === "array_access") {
        const array = memory.getVariable(expr.array)?.value;
        const index = expr.index.value;
        if (Array.isArray(array) && typeof index === "number") {
            return array[index].value;
        }

        new VelvetError(
            "Invalid array access",
            0,
            0,
            "",
            "Array Error"
        ).handleError();
    }

    // Handle array method calls
    if (expr && expr.type === "array_method_call") {
        console.log(`Array method call: ${expr.array}.${expr.method}()`);
        const arrayVar = memory.getVariable(expr.array);
        if (!arrayVar || !Array.isArray(arrayVar.value)) {
            new VelvetError(
                `Cannot call method '${expr.method}' on non-array value`,
                0,
                0,
                "",
                "Array Error"
            ).handleError();
            return null;
        }

        const array = arrayVar.value;
        console.log(`Array: ${JSON.stringify(array)}`);

        switch (expr.method) {
            case "push":
                // Evaluate arguments and push them to the array
                console.log(`Push method called on array: ${expr.array}`);
                console.log(`Array type: ${arrayVar.type}`);
                console.log(`Array before push: ${JSON.stringify(array)}`);

                const valuesToPush = expr.args.map((arg: any) => {
                    console.log(`Push argument: ${JSON.stringify(arg)}`);
                    const evaluated = evaluateExpression(arg, memory);
                    console.log(
                        `Evaluated push arg: ${JSON.stringify(evaluated)}`
                    );
                    return evaluated;
                });
                console.log(`Pushing values: ${JSON.stringify(valuesToPush)}`);

                valuesToPush.forEach((value: any) => {
                    // Convert primitive values to objects with type and value
                    if (typeof value === "number") {
                        console.log(`Pushing number: ${value}`);
                        array.push({
                            type: Number.isInteger(value) ? "int" : "float",
                            value,
                            location: {},
                        });
                    } else if (typeof value === "string") {
                        console.log(`Pushing string: ${value}`);
                        array.push({ type: "string", value, location: {} });
                    } else if (typeof value === "boolean") {
                        console.log(`Pushing boolean: ${value}`);
                        array.push({ type: "bool", value, location: {} });
                    } else {
                        console.log(`Pushing other: ${JSON.stringify(value)}`);
                        array.push(value);
                    }
                });

                // Update the array in memory
                console.log(`Updating array in memory: ${expr.array}`);
                memory.setVariable(expr.array, arrayVar.type, array);

                console.log(`Array after push: ${JSON.stringify(array)}`);
                return array.length;

            case "pop":
                if (array.length === 0) {
                    new VelvetError(
                        "Cannot pop from an empty array",
                        0,
                        0,
                        "",
                        "Array Error"
                    ).handleError();
                    return null;
                }
                const popped = array.pop();
                console.log(`Popped: ${JSON.stringify(popped)}`);
                return popped.value;

            case "length":
                console.log(`Length: ${array.length}`);
                return array.length;

            case "join":
                const separator =
                    expr.args.length > 0
                        ? evaluateExpression(expr.args[0], memory)
                        : ",";
                const joined = array
                    .map((item: any) => item.value)
                    .join(separator);
                console.log(`Joined: ${joined}`);
                return joined;

            default:
                new VelvetError(
                    `Unknown array method: ${expr.method}`,
                    0,
                    0,
                    "",
                    "Array Error"
                ).handleError();
                return null;
        }
    }

    return 0; // Default return for unhandled cases
}

// Helper function to convert JSON to Velvet data structures
function convertJsonToVelvet(json: any): any {
    if (json === null || json === undefined) {
        return null;
    }

    if (typeof json === "number") {
        return Number.isInteger(json)
            ? { type: "int", value: json, location: {} }
            : { type: "float", value: json, location: {} };
    }

    if (typeof json === "string") {
        return { type: "string", value: json, location: {} };
    }

    if (typeof json === "boolean") {
        return { type: "bool", value: json, location: {} };
    }

    if (Array.isArray(json)) {
        return json.map((item) => convertJsonToVelvet(item));
    }

    if (typeof json === "object") {
        // For objects, we'll convert to an array of key-value pairs
        // since Velvet doesn't have native object support yet
        return Object.entries(json).map(([key, value]) => [
            { type: "string", value: key, location: {} },
            convertJsonToVelvet(value),
        ]);
    }

    return null;
}

// Helper function to convert Velvet data structures to JSON-compatible objects
function convertVelvetToJson(velvet: any): any {
    if (velvet === null || velvet === undefined) {
        return null;
    }

    // If it's a primitive value, return it directly
    if (typeof velvet !== "object") {
        return velvet;
    }

    // If it has a value property (like Velvet's typed values)
    if ("value" in velvet) {
        return velvet.value;
    }

    // If it's an array, convert each element
    if (Array.isArray(velvet)) {
        return velvet.map((item) => convertVelvetToJson(item));
    }

    // For other objects, convert all properties
    const result: any = {};
    for (const key in velvet) {
        if (Object.prototype.hasOwnProperty.call(velvet, key)) {
            result[key] = convertVelvetToJson(velvet[key]);
        }
    }

    return result;
}

// Evaluator function
export default function evaluate(text: string) {
    const ast = parser.parse(text);
    const memory = new MemoryManager();

    // Iterative evaluation instead of recursion
    for (const element of ast) {
        evaluateElement(element, memory);
    }
}
