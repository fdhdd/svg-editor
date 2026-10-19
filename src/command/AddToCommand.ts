import { AppContext } from "../app/AppContext";
import { Placement, SvgDocument } from "../document/SvgDocument";
import { EditorError } from "../error/EditorError";
import { GroupShape } from "../shape/GroupShape";
import { Shape } from "../shape/Shape";
import { Command } from "./Command";

export class AddToCommand implements Command {
  private previous?: Placement;

  private constructor(
    private readonly document: SvgDocument,
    private readonly shape: Shape,
    private readonly container: GroupShape,
  ) {}

  static run(ctx: AppContext, args: string[]): string {
    if (args.length !== 2) {
      throw new EditorError("usage: addto <gid> <id>");
    }
    const document = ctx.requireDocument();
    const container = document.requireContainer(args[0]);
    const shape = document.requireShape(args[1]);
    if (shape === container || container.isDescendantOf(shape)) {
      throw new EditorError(`cannot add a container into its own descendant: ${shape.id}`);
    }
    const command = new AddToCommand(document, shape, container);
    const message = command.execute();
    ctx.history.push(command);
    return message;
  }

  execute(): string {
    const sameParent = this.shape.parentGroup() === this.container;
    const index = sameParent ? this.container.childCount() - 1 : this.container.childCount();
    this.previous = this.document.reparent(this.shape, this.container, index);
    return `${this.shape.label()} added to ${this.container.placementLabel()}`;
  }

  undo(): string {
    if (!this.previous) {
      throw new EditorError(`no such shape: ${this.shape.id}`);
    }
    this.document.reparent(this.shape, this.previous.parent, this.previous.index);
    return `${this.shape.label()} restored into ${this.previous.parent.placementLabel()}`;
  }
}
