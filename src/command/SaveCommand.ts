import { AppContext } from "../app/AppContext";
import { EditorError } from "../error/EditorError";
import { SvgWriter } from "../io/SvgWriter";

export class SaveCommand {
  static run(ctx: AppContext, args: string[]): string {
    if (args.length > 1) {
      throw new EditorError("usage: save [file.svg]");
    }
    const document = ctx.requireDocument();
    const path = args[0] ?? document.sourcePath;
    if (!path) {
      throw new EditorError("no save path. use 'save <file.svg>'");
    }
    ctx.files.write(path, new SvgWriter().write(document));
    document.setSourcePath(path);
    ctx.lockHistory();
    return `saved to ${path} (${document.count()} elements)`;
  }
}
