import { EditorError } from "../error/EditorError";
import { NumberFormat } from "../util/NumberFormat";
import { XmlCodec } from "../util/XmlCodec";
import { Shape } from "./Shape";

interface LineState {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  style: { fill?: string; stroke?: string; strokeWidth?: string };
}

export class LineShape extends Shape {
  private x1: number;
  private y1: number;
  private x2: number;
  private y2: number;

  constructor(id: string, x1: number, y1: number, x2: number, y2: number) {
    super(id);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  get typeName(): string {
    return "line";
  }

  static fromCli(id: string, args: string[]): LineShape {
    if (args.length < 4 || args.length > 5) {
      throw new EditorError("usage: create line <id> <x1> <y1> <x2> <y2> [stroke] [in <containerId>]");
    }
    const shape = new LineShape(
      id,
      NumberFormat.parse(args[0]),
      NumberFormat.parse(args[1]),
      NumberFormat.parse(args[2]),
      NumberFormat.parse(args[3]),
    );
    if (args[4] !== undefined) {
      shape.setAttribute("stroke", args[4]);
    }
    return shape;
  }

  static fromXml(id: string, attributes: Readonly<Record<string, string>>): LineShape {
    const shape = new LineShape(
      id,
      NumberFormat.parse(attributes.x1 ?? "0"),
      NumberFormat.parse(attributes.y1 ?? "0"),
      NumberFormat.parse(attributes.x2 ?? "0"),
      NumberFormat.parse(attributes.y2 ?? "0"),
    );
    shape.readStyle(attributes);
    return shape;
  }

  positionLabel(): string {
    return `(${NumberFormat.format(this.x1)},${NumberFormat.format(this.y1)})`;
  }

  move(dx: number, dy: number): void {
    this.x1 += dx;
    this.y1 += dy;
    this.x2 += dx;
    this.y2 += dy;
  }

  scale(factor: number): void {
    this.x1 *= factor;
    this.y1 *= factor;
    this.x2 *= factor;
    this.y2 *= factor;
  }

  captureState(): LineState {
    return {
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      style: this.styleSnapshot(),
    };
  }

  restoreState(state: unknown): void {
    const saved = state as LineState;
    this.x1 = saved.x1;
    this.y1 = saved.y1;
    this.x2 = saved.x2;
    this.y2 = saved.y2;
    this.restoreStyle(saved.style);
  }

  protected override isGeometryAttribute(name: string): boolean {
    return name === "x1" || name === "y1" || name === "x2" || name === "y2";
  }

  protected override readGeometry(name: string): string | undefined {
    if (name === "x1") return NumberFormat.format(this.x1);
    if (name === "y1") return NumberFormat.format(this.y1);
    if (name === "x2") return NumberFormat.format(this.x2);
    if (name === "y2") return NumberFormat.format(this.y2);
    return undefined;
  }

  protected override writeGeometry(name: string, value: string): void {
    const parsed = NumberFormat.parse(value);
    if (name === "x1") this.x1 = parsed;
    else if (name === "y1") this.y1 = parsed;
    else if (name === "x2") this.x2 = parsed;
    else if (name === "y2") this.y2 = parsed;
    else throw new EditorError(`unknown attribute: ${name}`);
  }

  treeDetail(): string {
    return `(${NumberFormat.format(this.x1)},${NumberFormat.format(this.y1)}) -> (${NumberFormat.format(this.x2)},${NumberFormat.format(this.y2)})`;
  }

  protected showBodyLines(): string[] {
    return [
      `  x1=${NumberFormat.format(this.x1)} y1=${NumberFormat.format(this.y1)} x2=${NumberFormat.format(this.x2)} y2=${NumberFormat.format(this.y2)}`,
    ];
  }

  toSvg(indent: string): string[] {
    return [
      `${indent}<line id="${XmlCodec.escape(this.id)}" x1="${NumberFormat.format(this.x1)}" y1="${NumberFormat.format(this.y1)}" x2="${NumberFormat.format(this.x2)}" y2="${NumberFormat.format(this.y2)}"${this.styleSvgAttrs()}/>`,
    ];
  }
}
