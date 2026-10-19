import { AppContext } from "../app/AppContext";
import { SvgDocument } from "../document/SvgDocument";
import { EditorError } from "../error/EditorError";
import type { ChildOwner } from "../shape/ChildOwner";
import { GroupShape } from "../shape/GroupShape";
import { Shape } from "../shape/Shape";
import { Command } from "./Command";

interface MemberPlacement {
  shape: Shape;
  parent: ChildOwner;
  index: number;
}

export class GroupCommand implements Command {
  private readonly members: MemberPlacement[];
  private readonly anchor: MemberPlacement;

  private constructor(
    private readonly document: SvgDocument,
    private readonly group: GroupShape,
    members: MemberPlacement[],
  ) {
    this.members = members;
    this.anchor = members[0];
  }

  static run(ctx: AppContext, args: string[]): string {
    if (args.length < 2) {
      throw new EditorError("usage: group <newGid> <id>…");
    }
    const document = ctx.requireDocument();
    const newId = args[0];
    if (document.has(newId)) {
      throw new EditorError(`id already exists: ${newId}`);
    }
    const seen = new Set<string>();
    const shapes: Shape[] = [];
    for (const id of args.slice(1)) {
      if (seen.has(id)) {
        throw new EditorError(`duplicate shape in group: ${id}`);
      }
      seen.add(id);
      shapes.push(document.requireShape(id));
    }
    for (const member of shapes) {
      for (const other of shapes) {
        if (other !== member && other.isDescendantOf(member)) {
          throw new EditorError(`cannot group a container into its own descendant: ${member.id}`);
        }
      }
    }
    shapes.sort((left, right) => document.compareOrder(left, right));
    const placements = shapes.map((shape) => ({
      shape,
      parent: shape.parentGroup(),
      index: shape.parentGroup().indexOf(shape),
    }));
    const command = new GroupCommand(document, new GroupShape(newId, false), placements);
    const message = command.execute();
    ctx.history.push(command);
    return message;
  }

  execute(): string {
    for (const member of this.members) {
      member.parent.detachChild(member.shape);
    }
    this.anchor.parent.insertChild(this.group, this.anchor.index);
    this.document.register(this.group);
    for (const member of this.members) {
      this.group.insertChild(member.shape, this.group.childCount());
    }
    const count = this.members.length;
    const noun = count === 1 ? "child" : "children";
    return `${this.group.label()} created with ${count} ${noun}`;
  }

  undo(): string {
    for (const member of [...this.members].reverse()) {
      this.group.detachChild(member.shape);
    }
    this.anchor.parent.detachChild(this.group);
    this.document.unregister(this.group);
    for (const member of this.members) {
      member.parent.insertChild(member.shape, member.index);
    }
    return `${this.group.label()} removed`;
  }
}
