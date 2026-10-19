import { EditorError } from "../error/EditorError";
import { NumberFormat } from "../util/NumberFormat";
import { XmlCodec } from "../util/XmlCodec";
import { Shape } from "./Shape";

interface CircleState {
  cx: number;
  cy: number;
  r: number;
  style: { fill?: string; stroke?: string; strokeWidth?: string };
}

export class CircleShape extends Shape {
  private cx: number;
  private cy: number;
  private r: number;

  constructor(id: string, cx: number, cy: number, r: number) {
    super(id);
    this.cx = cx;
    this.cy = cy;
    this.r = r;
  }

  get typeName(): string {
    return "circle";
  }

  static fromCli(id: string, args: string[]): CircleShape {
    if (args.length < 3 || args.length > 4) {
      throw new EditorError("usage: create circle <id> <cx> <cy> <r> [fill] [in <containerId>]");
    }
    const shape = new CircleShape(
      id,
      NumberFormat.parse(args[0]),
      NumberFormat.parse(args[1]),
      NumberFormat.parse(args[2]),
    );
    if (args[3] !== undefined) {
      shape.setAttribute("fill", args[3]);
    }
    return shape;
  }

  static fromXml(id: string, attributes: Readonly<Record<string, string>>): CircleShape {
    const shape = new CircleShape(
      id,
      NumberFormat.parse(attributes.cx ?? "0"),
      NumberFormat.parse(attributes.cy ?? "0"),
      NumberFormat.parse(attributes.r ?? "0"),
    );
    shape.readStyle(attributes);
    return shape;
  }

  positionLabel(): string {
    return `(${NumberFormat.format(this.cx)},${NumberFormat.format(this.cy)})`;
  }

  move(dx: number, dy: number): void {
    this.cx += dx;
    this.cy += dy;
  }

  scale(factor: number): void {
    this.cx *= factor;
    this.cy *= factor;
    this.r *= factor;
  }

  captureState(): CircleState {
    return { cx: this.cx, cy: this.cy, r: this.r, style: this.styleSnapshot() };
  }

  restoreState(state: unknown): void {
    const saved = state as CircleState;
    this.cx = saved.cx;
    this.cy = saved.cy;
    this.r = saved.r;
    this.restoreStyle(saved.style);
  }

  protected override isGeometryAttribute(name: string): boolean {
    return name === "cx" || name === "cy" || name === "r";
  }

  protected override readGeometry(name: string): string | undefined {
    if (name === "cx") return NumberFormat.format(this.cx);
    if (name === "cy") return NumberFormat.format(this.cy);
    if (name === "r") return NumberFormat.format(this.r);
    return undefined;
  }

  protected override writeGeometry(name: string, value: string): void {
    const parsed = NumberFormat.parse(value);
    if (name === "cx") this.cx = parsed;
    else if (name === "cy") this.cy = parsed;
    else if (name === "r") this.r = parsed;
    else throw new EditorError(`unknown attribute: ${name}`);
  }

  treeDetail(): string {
    return `cx=${NumberFormat.format(this.cx)} cy=${NumberFormat.format(this.cy)} r=${NumberFormat.format(this.r)}${this.styleTreeSuffix()}`;
  }

  protected showBodyLines(): string[] {
    return [`  cx=${NumberFormat.format(this.cx)} cy=${NumberFormat.format(this.cy)} r=${NumberFormat.format(this.r)}`];
  }

  toSvg(indent: string): string[] {
    return [
      `${indent}<circle id="${XmlCodec.escape(this.id)}" cx="${NumberFormat.format(this.cx)}" cy="${NumberFormat.format(this.cy)}" r="${NumberFormat.format(this.r)}"${this.styleSvgAttrs()}/>`,
    ];
  }
}
