import { AppContext } from "../app/AppContext";
import { EditorError } from "../error/EditorError";
import { NumberFormat } from "../util/NumberFormat";

export class CanvasCommand {
  static run(ctx: AppContext, args: string[]): string {
    const document = ctx.requireDocument();
    if (args.length === 0) {
      return CanvasCommand.label(document.width, document.height);
    }
    if (args.length !== 2) {
      throw new EditorError("usage: canvas [w] [h]");
    }
    const width = NumberFormat.parse(args[0]);
    const height = NumberFormat.parse(args[1]);
    document.resize(width, height);
    ctx.lockHistory();
    return CanvasCommand.label(width, height);
  }

  private static label(width: number, height: number): string {
    return `canvas ${NumberFormat.format(width)}x${NumberFormat.format(height)}`;
  }
}
