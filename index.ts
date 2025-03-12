import { existsSync, readFileSync } from "fs";
import evaluate from "./evaluate";
import { VelvetError } from "./lib/ErrorHandler";
let filepath = process.argv[2];

if (filepath == undefined) {
    console.error("Please provide a filepath");
    new VelvetError(
        "Filepath not provided",
        0,
        0,
        "",
        "File Error"
    ).handleError();
}

if (!existsSync(filepath)) {
    console.error("File does not exist");
    new VelvetError(
        "File does not exist",
        0,
        0,
        "",
        "File Error"
    ).handleError();
}

evaluate(readFileSync(filepath, "utf-8"));
