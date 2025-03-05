export default function evaluateCondition(
    condition: any,
    variableMemory: Map<string, any>
): boolean {
    const leftValue = getValueFromExpression(condition.left, variableMemory);
    const rightValue = getValueFromExpression(condition.right, variableMemory);

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
    return expr.value;
}
