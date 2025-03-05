import { existsSync, readFileSync } from "fs";
import evaluate from "./evaluate";
let filepath = process.argv[2];

if (filepath == undefined) {
    console.error("Please provide a filepath");
    process.exit(1);
}

if (!existsSync(filepath)) {
    console.error("File does not exist");
    process.exit(1);
}

evaluate(readFileSync(filepath, "utf-8"));
