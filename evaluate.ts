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

    return 0; // Default return for unhandled cases
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
