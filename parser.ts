import peggy from "peggy";
import { existsSync, readFileSync } from "fs";
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

let grammar = readFileSync("./velvet.pegjs", "utf-8");

export const parser = peggy.generate(grammar);
