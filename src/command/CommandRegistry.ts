import { AppContext } from "../app/AppContext";
import { EditorError } from "../error/EditorError";

export type CommandHandler = (ctx: AppContext, args: string[]) => string;

export class CommandRegistry {
  private readonly handlers = new Map<string, CommandHandler>();

  register(name: string, handler: CommandHandler): void {
    this.handlers.set(name, handler);
  }

  require(name: string): CommandHandler {
    const handler = this.handlers.get(name);
    if (!handler) {
      throw new EditorError(`unknown command: ${name}`);
    }
    return handler;
  }
}
