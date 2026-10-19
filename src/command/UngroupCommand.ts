import { AppContext } from "../app/AppContext";
import { SvgDocument } from "../document/SvgDocument";
import { EditorError } from "../error/EditorError";
import type { ChildOwner } from "../shape/ChildOwner";
import { GroupShape } from "../shape/GroupShape";
import { Shape } from "../shape/Shape";
import { Command } from "./Command";

export class UngroupCommand implements Command {
  private readonly children: Shape[];

  private constructor(
    private readonly document: SvgDocument,
    private readonly group: GroupShape,
    private readonly parent: ChildOwner,
    private readonly index: number,
  ) {
    this.children = [...group.childShapes()];
  }

  static run(ctx: AppContext, args: string[]): string {
    if (args.length !== 1) {
      throw new EditorError("usage: ungroup <gid>");
    }
    const document = ctx.requireDocument();
    const shape = document.requireShape(args[0]);
    if (!shape.isContainer()) {
      throw new EditorError(`not a container: ${shape.id}`);
    }
    if (shape.isCompositeShape()) {
      throw new EditorError(`cannot ungroup composite shape: ${shape.id}`);
    }
    const parent = shape.parentGroup();
    if (parent.isSyntheticRoot()) {
      throw new EditorError(`cannot ungroup top-level container: ${shape.id}`);
    }
    const command = new UngroupCommand(document, shape.asGroup(), parent, parent.indexOf(shape));
    const message = command.execute();
    ctx.history.push(command);
    return message;
  }

  execute(): string {
    this.parent.detachChild(this.group);
    this.document.unregister(this.group);
    for (const child of this.children) {
      this.group.detachChild(child);
    }
    this.children.forEach((child, offset) => {
      this.parent.insertChild(child, this.index + offset);
    });
    return `${this.group.label()} ungrouped`;
  }

  undo(): string {
    for (const child of [...this.children].reverse()) {
      this.parent.detachChild(child);
    }
    this.parent.insertChild(this.group, this.index);
    this.document.register(this.group);
    for (const child of this.children) {
      this.group.insertChild(child, this.group.childCount());
    }
    const count = this.children.length;
    const noun = count === 1 ? "child" : "children";
    return `${this.group.label()} restored with ${count} ${noun}`;
  }
}
