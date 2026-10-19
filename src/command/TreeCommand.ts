import { AppContext } from "../app/AppContext";
import { EditorError } from "../error/EditorError";
import { TreeFormatter } from "../view/TreeFormatter";

export class TreeCommand {
  static run(ctx: AppContext, args: string[]): string {
    const document = ctx.requireDocument();
    const formatter = new TreeFormatter();
    if (args.length === 0) {
      return formatter.formatDocument(document);
    }
    if (args.length !== 1) {
      throw new EditorError("usage: tree [id]");
    }
    return formatter.formatSubtree(document.requireShape(args[0]));
  }
}
