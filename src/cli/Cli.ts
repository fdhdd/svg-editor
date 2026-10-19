import readline from "node:readline";
import { EditorSession } from "../app/EditorSession";

export class Cli {
  static main(): void {
    const session = new EditorSession();
    process.stdout.write("svg-editor 0.1 — type 'help' for commands\n");
    const reader = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });
    const prompt = (): void => {
      process.stdout.write("svg> ");
    };
    prompt();
    reader.on("line", (line) => {
      try {
        const output = session.executeLine(line);
        if (output !== null && output !== "") {
          process.stdout.write(`${output}\n`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.stack ?? error.message : String(error);
        process.stderr.write(`${message}\n`);
      }
      prompt();
    });
    reader.on("close", () => {
      process.exit(0);
    });
  }
}

if (require.main === module) {
  Cli.main();
}
