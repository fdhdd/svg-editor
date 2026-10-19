import { AppContext } from "../app/AppContext";
import { EditorError } from "../error/EditorError";

export class UndoCommand {
  static run(ctx: AppContext, args: string[]): string {
    if (args.length !== 0) {
      throw new EditorError("usage: undo");
    }
    ctx.requireDocument();
    return ctx.history.undo();
  }
}
