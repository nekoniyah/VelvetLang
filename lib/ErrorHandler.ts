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
        console.log(
            chalk.red(`Error at line ${this.line}, column ${this.row}`)
        );
        console.log(chalk.red(message));
        let lines = this.text.split("\n");

        if (this.line > 0 && this.line <= lines.length) {
            // Show the line with the error
            console.log(chalk.red(`\t${lines[this.line - 1]}`));
            // Point to the exact column with ^
            console.log(chalk.red("\t" + " ".repeat(this.row - 1) + "^"));
        }

        process.exit(1);
    }
}
