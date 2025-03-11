import variableDeclarator from "./lib/variableDeclaration";
import handleFunctions from "./lib/handleFunctions";
import { parser } from "./parser";
import evaluateCondition from "./lib/evaluateCondition";
import assignmentHandler from "./lib/assignmentHandler";
import { MemoryManager } from "./lib/MemoryManager";

export function evaluateElement(element: any, memory: MemoryManager) {
    // Dispatch table for evaluation
    const handlers: Record<string, (element: any) => void> = {
        assignment: (element) => assignmentHandler(element, memory),
        function_call: (element) => handleFunctions(element, memory),
        function_declaration: (element) =>
            handleFunctionDeclaration(element, memory),
        if: (element) => evaluateIfStatement(element, memory),
        for_loop: (element) => evaluateForLoop(element, memory),
        return: (element) => handleReturn(element, memory),
        variable_declaration: (element) => variableDeclarator(element, memory),
    };

    const handler = handlers[element.type];
    if (handler) {
        handler(element);
    } else {
        console.warn(`Unknown element type: ${element.type}`);
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

        for (let i = start; i <= end; i++) {
            memory.setVariable(element.variable, "int", i);
            for (const stmt of element.body) {
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
        return memory.getVariable(expr)?.value;
    }

    // Handle objects with value property
    if (expr && typeof expr === "object" && "value" in expr) {
        return expr.value;
    }

    // Handle function calls
    if (expr && expr.type === "function_call") {
        return handleFunctions(expr, memory);
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
