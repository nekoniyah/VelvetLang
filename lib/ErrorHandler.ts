// Custom Error Class to handle errors in Velvet
// Use console.error instead and process.exit(1)

import chalk from "chalk";

export class VelvetError {
    constructor(
        message: string,
        private line: number = 0,
        private row: number = 0,
        private text: string = "",
        private type: string = "General Error"
    ) {
        console.log(
            chalk.red(
                `Error [${this.type}] at line ${this.line}, column ${this.row}`
            )
        );
        console.log(chalk.red(message));
        let lines = this.text.split("\n");

        if (this.line > 0 && this.line <= lines.length) {
            // Show the line with the error
            console.log(chalk.red(`\t${lines[this.line - 1]}`));
            // Point to the exact column with ^
            console.log(chalk.red("\t" + " ".repeat(this.row - 1) + "^"));
        }

        // Suggest possible solutions or actions
        console.log(chalk.yellow("Suggested actions:"));
        console.log(
            chalk.yellow("- Check the syntax near the error location.")
        );
        console.log(
            chalk.yellow("- Ensure all variables and functions are defined.")
        );
        console.log(
            chalk.yellow("- Refer to the documentation for more details.")
        );
    }

    // New method to handle errors without exiting
    handleError() {
        console.log(chalk.blue("Attempting to recover from error..."));
        // Implement recovery logic here, e.g., skip the current operation
    }
}
