import { AppContext } from "../app/AppContext";
import { Placement, SvgDocument } from "../document/SvgDocument";
import { EditorError } from "../error/EditorError";
import { Shape } from "../shape/Shape";
import { Command } from "./Command";

export class ZOrderCommand implements Command {
  private previous?: Placement;

  private constructor(
    private readonly document: SvgDocument,
    private readonly shape: Shape,
    private readonly toFront: boolean,
  ) {}

  static front(ctx: AppContext, args: string[]): string {
    return ZOrderCommand.run(ctx, args, true);
  }

  static back(ctx: AppContext, args: string[]): string {
    return ZOrderCommand.run(ctx, args, false);
  }

  private static run(ctx: AppContext, args: string[], toFront: boolean): string {
    if (args.length !== 1) {
      throw new EditorError(`usage: ${toFront ? "front" : "back"} <id>`);
    }
    const document = ctx.requireDocument();
    const shape = document.requireShape(args[0]);
    const command = new ZOrderCommand(document, shape, toFront);
    const message = command.execute();
    ctx.history.push(command);
    return message;
  }

  execute(): string {
    const parent = this.shape.parentGroup();
    const index = this.toFront ? parent.childCount() - 1 : 0;
    this.previous = this.document.reparent(this.shape, parent, index);
    return this.toFront ? `${this.shape.label()} brought to front` : `${this.shape.label()} sent to back`;
  }

  undo(): string {
    if (!this.previous) {
      throw new EditorError(`no such shape: ${this.shape.id}`);
    }
    this.document.reparent(this.shape, this.previous.parent, this.previous.index);
    return `${this.shape.label()} z-order restored`;
  }
}
