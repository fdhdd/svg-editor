import { AppContext } from "../app/AppContext";
import { Placement, SvgDocument } from "../document/SvgDocument";
import { EditorError } from "../error/EditorError";
import { Shape } from "../shape/Shape";
import { Command } from "./Command";

export class DeleteCommand implements Command {
  private placement?: Placement;

  private constructor(
    private readonly document: SvgDocument,
    private readonly shape: Shape,
  ) {}

  static run(ctx: AppContext, args: string[]): string {
    if (args.length !== 1) {
      throw new EditorError("usage: delete <id>");
    }
    const document = ctx.requireDocument();
    const shape = document.requireShape(args[0]);
    const command = new DeleteCommand(document, shape);
    const message = command.execute();
    ctx.history.push(command);
    return message;
  }

  execute(): string {
    this.placement = this.document.remove(this.shape);
    return `${this.shape.label()} deleted`;
  }

  undo(): string {
    const placement = this.requirePlacement();
    this.document.restore(this.shape, placement);
    return `${this.shape.label()} restored into ${placement.parent.placementLabel()}`;
  }

  private requirePlacement(): Placement {
    if (!this.placement) {
      throw new EditorError(`no such shape: ${this.shape.id}`);
    }
    return this.placement;
  }
}
