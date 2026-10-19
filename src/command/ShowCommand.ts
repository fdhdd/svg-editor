import { AppContext } from "../app/AppContext";
import { EditorError } from "../error/EditorError";

export class ShowCommand {
  static run(ctx: AppContext, args: string[]): string {
    if (args.length !== 1) {
      throw new EditorError("usage: show <id>");
    }
    return ctx.requireDocument().requireShape(args[0]).showText();
  }
}
