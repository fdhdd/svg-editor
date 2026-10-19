import { AppContext } from "../app/AppContext";
import { EditorError } from "../error/EditorError";
import { HelpText } from "./HelpText";

export class HelpCommand {
  static run(_ctx: AppContext, args: string[]): string {
    if (args.length !== 0) {
      throw new EditorError("usage: help");
    }
    return HelpText.render();
  }
}
