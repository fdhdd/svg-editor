import { AppContext } from "../app/AppContext";
import { SvgDocument } from "../document/SvgDocument";
import { EditorError } from "../error/EditorError";
import type { ChildOwner } from "../shape/ChildOwner";
import { Shape } from "../shape/Shape";
import { Command } from "./Command";
import { InClause } from "./InClause";

export class CreateCommand implements Command {
  private constructor(
    private readonly document: SvgDocument,
    private readonly shape: Shape,
    private readonly parent: ChildOwner,
    private readonly nested: boolean,
  ) {}

  static run(ctx: AppContext, args: string[]): string {
    if (args.length < 2) {
      throw new EditorError("usage: create <type> <id> [params…] [in <containerId>]");
    }
    const document = ctx.requireDocument();
    const typeName = args[0];
    const id = args[1];
    if (document.has(id)) {
      throw new EditorError(`id already exists: ${id}`);
    }
    const clause = InClause.split(args.slice(2));
    const parent = clause.containerId ? document.requireContainer(clause.containerId) : document.canvasOwner();
    const shape = ctx.factory.createFromCli(typeName, id, clause.args);
    const command = new CreateCommand(document, shape, parent, clause.containerId !== undefined);
    const message = command.execute();
    ctx.history.push(command);
    return message;
  }

  execute(): string {
    this.document.adopt(this.shape, this.parent, this.parent.childCount());
    return this.nested
      ? `${this.shape.label()} created in ${this.parent.placementLabel()}`
      : `${this.shape.label()} created`;
  }

  undo(): string {
    this.document.remove(this.shape);
    return this.nested
      ? `${this.shape.label()} removed from ${this.parent.placementLabel()}`
      : `${this.shape.label()} removed`;
  }
}
