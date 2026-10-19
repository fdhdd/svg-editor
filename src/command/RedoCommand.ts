import { AppContext } from "../app/AppContext";
import { EditorError } from "../error/EditorError";

export class RedoCommand {
  static run(ctx: AppContext, args: string[]): string {
    if (args.length !== 0) {
      throw new EditorError("usage: redo");
    }
    ctx.requireDocument();
    return ctx.history.redo();
  }
}
