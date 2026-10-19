import { AppContext } from "../app/AppContext";
import { SvgDocument } from "../document/SvgDocument";
import { EditorError } from "../error/EditorError";
import { NumberFormat } from "../util/NumberFormat";

export class InitCommand {
  static run(ctx: AppContext, args: string[]): string {
    if (args.length !== 0 && args.length !== 2) {
      throw new EditorError("usage: init [w] [h]");
    }
    const width = args.length === 0 ? 800 : NumberFormat.parse(args[0]);
    const height = args.length === 0 ? 600 : NumberFormat.parse(args[1]);
    const document = new SvgDocument(width, height);
    ctx.replaceDocument(document);
    return `canvas ${NumberFormat.format(width)}x${NumberFormat.format(height)} created`;
  }
}
