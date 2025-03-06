export default function evaluateCondition(
    element: any,
    variableMemory: Map<string, any>
): boolean {
    let { condition } = element;

    if (condition.type !== "condition") return false;

    if (typeof condition.left === "string") {
        condition.left = condition.left.trimEnd();

        if (variableMemory.has(condition.left)) {
            condition.left = variableMemory.get(condition.left)!.value;
        }
    }

    if (typeof condition.right === "string") {
        condition.right = condition.right.trimStart();

        if (variableMemory.has(condition.right)) {
            condition.right = variableMemory.get(condition.right)!.value;
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

function getValueFromExpression(expr: any, variableMemory: Map<string, any>) {
    if (expr.type === "variable") {
        return variableMemory.get(expr.name)?.value;
    }
    return expr.value || expr;
}
