import variableDeclarator from "./lib/variableDeclaration";
import handleFunctions from "./lib/handleFunctions";
import { parser } from "./parser";
import evaluateCondition from "./lib/evaluateCondition";
import assignmentHandler from "./lib/assignmentHandler";
import { MemoryManager } from "./lib/MemoryManager";

// Evaluator function
function evaluate(text: string) {
    const ast = parser.parse(text);
    const memory = new MemoryManager();

    // Dispatch table for evaluation
    const handlers: Record<string, (element: any) => void> = {
        assignment: (element) => assignmentHandler(element, memory),
        function_call: (element) => handleFunctions(element, memory),
        if: (element) => evaluateIfStatement(element, memory),
        variable_declaration: (element) => variableDeclarator(element, memory),
    };

    function evaluateElement(element: any) {
        const handler = handlers[element.type];
        if (handler) {
            handler(element);
        } else {
            console.warn(`Unknown element type: ${element.type}`);
        }
    }

    function evaluateIfStatement(element: any, memory: MemoryManager) {
        const result = evaluateCondition(element, memory);
        if (result) {
            for (const stmt of element.statements || []) {
                evaluateElement(stmt);
            }
        }
    }

    // Iterative evaluation instead of recursion
    for (const element of ast) {
        evaluateElement(element);
    }
}

export default evaluate;
