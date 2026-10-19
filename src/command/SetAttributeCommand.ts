import { AppContext } from "../app/AppContext";
import { EditorError } from "../error/EditorError";
import { Shape } from "../shape/Shape";
import { Command } from "./Command";

export class SetAttributeCommand implements Command {
  private readonly previous: string | undefined;

  private constructor(
    private readonly shape: Shape,
    private readonly name: string,
    private readonly value: string | undefined,
  ) {
    this.previous = shape.getAttribute(name);
  }

  static run(ctx: AppContext, args: string[]): string {
    if (args.length !== 3 && args.length !== 2) {
      throw new EditorError("usage: set <id> <attr> <value>");
    }
    const shape = ctx.requireDocument().requireShape(args[0]);
    const command = new SetAttributeCommand(shape, args[1], args[2]);
    const message = command.execute();
    ctx.history.push(command);
    return message;
  }

  execute(): string {
    this.shape.setAttribute(this.name, this.value);
    return SetAttributeCommand.describe(this.shape, this.name, this.value);
  }

  undo(): string {
    this.shape.setAttribute(this.name, this.previous);
    return SetAttributeCommand.describe(this.shape, this.name, this.previous);
  }

  static describe(shape: Shape, name: string, value: string | undefined): string {
    if (value === undefined) {
      return `${shape.label()} updated: ${name} cleared`;
    }
    if (name === "text") {
      return `${shape.label()} updated: text="${value}"`;
    }
    return `${shape.label()} updated: ${name}=${value}`;
  }
}
