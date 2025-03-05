import { VelvetError } from "./ErrorHandler";
import handleFunctionParameters from "./handleFunctionParameters";
import TypeHandler from "./TypeHandler";

export default function handleFunctions(element: any, variableMemory: any) {
    let params = handleFunctionParameters(element, variableMemory);

    switch (element.name) {
        case "len":
            if (params[0] === undefined)
                new VelvetError(
                    "len() requires an argument",
                    element.row,
                    element.col,
                    element.text
                );

            if (
                !TypeHandler(params[0], "string") ||
                !TypeHandler(params[0], "array")
            ) {
                new VelvetError(
                    "len() first argument must be a string or array",
                    element.row,
                    element.col,
                    element.text
                );
            }

            return params[0].length;
        case "round":
            if (params[0] === undefined)
                new VelvetError(
                    "round() requires an argument",
                    element.row,
                    element.col,
                    element.text
                );

            if (!TypeHandler(params[0], "float"))
                new VelvetError(
                    "round() first argument must be a float",
                    element.row,
                    element.col,
                    element.text
                );

            return Math.round(params[0]);
        case "ceil":
            if (params[0] === undefined)
                new VelvetError(
                    "ceil() requires an argument",
                    element.row,
                    element.col,
                    element.text
                );

            if (!TypeHandler(params[0], "float"))
                new VelvetError(
                    "ceil() first argument must be a float",
                    element.row,
                    element.col,
                    element.text
                );

            return Math.ceil(params[0]);
        case "floor":
            if (params[0] === undefined)
                throw new VelvetError(
                    "floor() requires an argument",
                    element.row,
                    element.col,
                    element.text
                );

            if (!TypeHandler(params[0], "float"))
                throw new VelvetError(
                    "floor() first argument must be a float",
                    element.row,
                    element.col,
                    element.text
                );

            return Math.floor(params[0]);
        case "print":
            if (params.length === 0)
                new VelvetError(
                    "print() requires at least one argument",
                    element.row,
                    element.col,
                    element.text
                );

            console.log(...params);
    }
}
