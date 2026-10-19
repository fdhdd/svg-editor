import { AppContext } from "../app/AppContext";
import { EditorError } from "../error/EditorError";
import { SvgReader } from "../io/SvgReader";

export class ReadCommand {
  static run(ctx: AppContext, args: string[]): string {
    if (args.length !== 1) {
      throw new EditorError("usage: read <file.svg>");
    }
    const path = args[0];
    const xml = ctx.files.read(path);
    const loaded = new SvgReader(ctx.factory).read(xml);
    loaded.document.setSourcePath(path);
    ctx.replaceDocument(loaded.document);
    const lines = loaded.warnings.map((warning) => `warning: ${warning}`);
    lines.push(`read ${path} (${loaded.document.count()} elements)`);
    return lines.join("\n");
  }
}
