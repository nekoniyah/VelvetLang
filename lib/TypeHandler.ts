// Types Validator

export default function TypeHandler<T>(
    value: T,
    type: "array" | "string" | "int" | "boolean" | "float"
): boolean {
    switch (type) {
        case "array":
            return Array.isArray(value);
        case "string":
            return typeof value === "string";
        case "int":
            return typeof value === "number" && Number.isInteger(value);
        case "boolean":
            return typeof value === "boolean";
        case "float":
            return typeof value === "number" && !Number.isInteger(value);
        default:
            return false;
    }
}
