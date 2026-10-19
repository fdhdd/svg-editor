import { EditorError } from "../error/EditorError";

export class InClause {
  static split(args: string[]): { args: string[]; containerId?: string } {
    if (args.length >= 1 && args[args.length - 1] === "in") {
      throw new EditorError("missing container id");
    }
    if (args.length >= 2 && args[args.length - 2] === "in") {
      return { args: args.slice(0, -2), containerId: args[args.length - 1] };
    }
    return { args };
  }
}
