import { AppContext } from "../app/AppContext";
import { EditorError } from "../error/EditorError";
import { GeometrySnapshot } from "../shape/GeometrySnapshot";
import { Shape } from "../shape/Shape";
import { NumberFormat } from "../util/NumberFormat";
import { Command } from "./Command";

export class MoveCommand implements Command {
  private readonly snapshot: GeometrySnapshot;

  private constructor(
    private readonly shape: Shape,
    private readonly dx: number,
    private readonly dy: number,
  ) {
    this.snapshot = GeometrySnapshot.capture(shape);
  }

  static run(ctx: AppContext, args: string[]): string {
    if (args.length !== 3) {
      throw new EditorError("usage: move <id> <dx> <dy>");
    }
    const shape = ctx.requireDocument().requireShape(args[0]);
    const command = new MoveCommand(shape, NumberFormat.parse(args[1]), NumberFormat.parse(args[2]));
    const message = command.execute();
    ctx.history.push(command);
    return message;
  }

  execute(): string {
    this.shape.move(this.dx, this.dy);
    return this.shape.describeMove(this.dx, this.dy, false);
  }

  undo(): string {
    this.snapshot.restore();
    return this.shape.describeMove(this.dx, this.dy, true);
  }
}
