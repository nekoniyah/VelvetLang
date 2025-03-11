import { MemoryManager } from "./MemoryManager";

export default function evaluateCondition(
    element: any,
    variableMemory: MemoryManager
): boolean {
    let { condition } = element;

    if (condition.type !== "condition") return false;

    if (typeof condition.left === "string") {
        condition.left = condition.left.replace(" ", "");

        if (variableMemory.hasVariable(condition.left)) {
            condition.left = variableMemory.getVariable(condition.left)?.value;
        }
    }

    if (typeof condition.right === "string") {
        condition.right = condition.right.replace(" ", "");

        if (variableMemory.hasVariable(condition.right)) {
            condition.right = variableMemory.getVariable(
                condition.right
            )?.value;
        }
    }

    const leftValue = getValueFromExpression(
        condition.left.value || condition.left,
        variableMemory
    );

    const rightValue = getValueFromExpression(
        condition.right.value || condition.right,
        variableMemory
    );

    switch (condition.operator) {
        case "=":
            return leftValue === rightValue;
        case "!=":
            return leftValue !== rightValue;
        case "<":
            return leftValue < rightValue;
        case ">":
            return leftValue > rightValue;
        case "<=":
            return leftValue <= rightValue;
        case ">=":
            return leftValue >= rightValue;
        default:
            return false;
    }
}

function getValueFromExpression(expr: any, variableMemory: MemoryManager) {
    if (expr.type === "variable") {
        return variableMemory.getVariable(expr.name)?.value;
    }

    return expr.value ? expr.value : expr;
}
