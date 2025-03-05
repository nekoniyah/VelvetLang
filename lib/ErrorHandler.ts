// Custom Error Class to handle errors in Velvet
// Use console.error instead and process.exit(1)

import chalk from "chalk";

export class VelvetError {
    constructor(
        message: string,
        private line: number = 0,
        private row: number = 0,
        private text: string = ""
    ) {
        console.log(chalk.red(`Error at ${this.line}:${this.row}`));
        console.log(chalk.red(message));
        let lines = text.split("\n");

        for (let i = 1; i < lines.length; i++) {
            if (i === this.line - 1) {
                console.log(chalk.red(`\t${lines[i]}`));
                console.log(chalk.red("\t" + "^".repeat(this.row)));
            } else {
                console.log(chalk.red(`\t${lines[i]}`));
            }
        }

        process.exit(1);
    }
}
