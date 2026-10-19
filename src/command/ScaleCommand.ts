import { AppContext } from "../app/AppContext";
import { EditorError } from "../error/EditorError";
import { GeometrySnapshot } from "../shape/GeometrySnapshot";
import { Shape } from "../shape/Shape";
import { NumberFormat } from "../util/NumberFormat";
import { Command } from "./Command";

export class ScaleCommand implements Command {
  private readonly snapshot: GeometrySnapshot;

  private constructor(
    private readonly shape: Shape,
    private readonly factor: number,
  ) {
    this.snapshot = GeometrySnapshot.capture(shape);
  }

  static run(ctx: AppContext, args: string[]): string {
    if (args.length !== 2) {
      throw new EditorError("usage: scale <id> <factor>");
    }
    const document = ctx.requireDocument();
    const shape = document.requireShape(args[0]);
    const factor = NumberFormat.parse(args[1]);
    if (!(factor > 0)) {
      throw new EditorError("scale factor must be positive");
    }
    const command = new ScaleCommand(shape, factor);
    const message = command.execute();
    ctx.history.push(command);
    return message;
  }

  execute(): string {
    this.shape.scale(this.factor);
    return this.shape.describeScale(this.factor, false);
  }

  undo(): string {
    this.snapshot.restore();
    return this.shape.describeScale(this.factor, true);
  }
}
