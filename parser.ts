import peggy from "peggy";
import { existsSync, readFileSync } from "fs";
let filepath = process.argv[2];

if (filepath == undefined) {
    console.error("Please provide a filepath");
    process.exit(1);
}

if (!existsSync(filepath)) {
    console.error("File does not exist");
    process.exit(1);
}

let grammar = readFileSync("./velvet.pegjs", "utf-8");

export const parser = peggy.generate(grammar);
