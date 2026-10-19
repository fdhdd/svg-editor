import { EditorError } from "../error/EditorError";
import { NumberFormat } from "../util/NumberFormat";
import { XmlCodec } from "../util/XmlCodec";
import { Shape } from "./Shape";

interface RectState {
  x: number;
  y: number;
  width: number;
  height: number;
  style: { fill?: string; stroke?: string; strokeWidth?: string };
}

export class RectShape extends Shape {
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  constructor(id: string, x: number, y: number, width: number, height: number) {
    super(id);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get typeName(): string {
    return "rect";
  }

  static fromCli(id: string, args: string[]): RectShape {
    if (args.length < 4 || args.length > 5) {
      throw new EditorError("usage: create rect <id> <x> <y> <w> <h> [fill] [in <containerId>]");
    }
    const shape = new RectShape(
      id,
      NumberFormat.parse(args[0]),
      NumberFormat.parse(args[1]),
      NumberFormat.parse(args[2]),
      NumberFormat.parse(args[3]),
    );
    if (args[4] !== undefined) {
      shape.setAttribute("fill", args[4]);
    }
    return shape;
  }

  static fromXml(id: string, attributes: Readonly<Record<string, string>>): RectShape {
    const shape = new RectShape(
      id,
      NumberFormat.parse(attributes.x ?? "0"),
      NumberFormat.parse(attributes.y ?? "0"),
      NumberFormat.parse(attributes.width ?? "0"),
      NumberFormat.parse(attributes.height ?? "0"),
    );
    shape.readStyle(attributes);
    return shape;
  }

  positionLabel(): string {
    return `(${NumberFormat.format(this.x)},${NumberFormat.format(this.y)})`;
  }

  move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  scale(factor: number): void {
    this.x *= factor;
    this.y *= factor;
    this.width *= factor;
    this.height *= factor;
  }

  captureState(): RectState {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      style: this.styleSnapshot(),
    };
  }

  restoreState(state: unknown): void {
    const saved = state as RectState;
    this.x = saved.x;
    this.y = saved.y;
    this.width = saved.width;
    this.height = saved.height;
    this.restoreStyle(saved.style);
  }

  protected override isGeometryAttribute(name: string): boolean {
    return name === "x" || name === "y" || name === "width" || name === "height";
  }

  protected override readGeometry(name: string): string | undefined {
    if (name === "x") return NumberFormat.format(this.x);
    if (name === "y") return NumberFormat.format(this.y);
    if (name === "width") return NumberFormat.format(this.width);
    if (name === "height") return NumberFormat.format(this.height);
    return undefined;
  }

  protected override writeGeometry(name: string, value: string): void {
    const parsed = NumberFormat.parse(value);
    if (name === "x") this.x = parsed;
    else if (name === "y") this.y = parsed;
    else if (name === "width") this.width = parsed;
    else if (name === "height") this.height = parsed;
    else throw new EditorError(`unknown attribute: ${name}`);
  }

  treeDetail(): string {
    return `x=${NumberFormat.format(this.x)} y=${NumberFormat.format(this.y)} w=${NumberFormat.format(this.width)} h=${NumberFormat.format(this.height)}${this.styleTreeSuffix()}`;
  }

  protected showBodyLines(): string[] {
    return [
      `  x=${NumberFormat.format(this.x)} y=${NumberFormat.format(this.y)} width=${NumberFormat.format(this.width)} height=${NumberFormat.format(this.height)}`,
    ];
  }

  toSvg(indent: string): string[] {
    return [
      `${indent}<rect id="${XmlCodec.escape(this.id)}" x="${NumberFormat.format(this.x)}" y="${NumberFormat.format(this.y)}" width="${NumberFormat.format(this.width)}" height="${NumberFormat.format(this.height)}"${this.styleSvgAttrs()}/>`,
    ];
  }
}
