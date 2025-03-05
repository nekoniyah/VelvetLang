import peggy from "peggy";
import { readFileSync } from "fs";

let grammar = readFileSync("./velvet.pegjs", "utf-8");

export const parser = peggy.generate(grammar);
