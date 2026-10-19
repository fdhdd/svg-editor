import { EditorError } from "../error/EditorError";
import { NumberFormat } from "../util/NumberFormat";
import { XmlCodec } from "../util/XmlCodec";
import { Shape } from "./Shape";

interface EllipseState {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  style: { fill?: string; stroke?: string; strokeWidth?: string };
}

export class EllipseShape extends Shape {
  private cx: number;
  private cy: number;
  private rx: number;
  private ry: number;

  constructor(id: string, cx: number, cy: number, rx: number, ry: number) {
    super(id);
    this.cx = cx;
    this.cy = cy;
    this.rx = rx;
    this.ry = ry;
  }

  get typeName(): string {
    return "ellipse";
  }

  static fromCli(id: string, args: string[]): EllipseShape {
    if (args.length < 4 || args.length > 5) {
      throw new EditorError("usage: create ellipse <id> <cx> <cy> <rx> <ry> [fill] [in <containerId>]");
    }
    const shape = new EllipseShape(
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

  static fromXml(id: string, attributes: Readonly<Record<string, string>>): EllipseShape {
    const shape = new EllipseShape(
      id,
      NumberFormat.parse(attributes.cx ?? "0"),
      NumberFormat.parse(attributes.cy ?? "0"),
      NumberFormat.parse(attributes.rx ?? "0"),
      NumberFormat.parse(attributes.ry ?? "0"),
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
    this.rx *= factor;
    this.ry *= factor;
  }

  captureState(): EllipseState {
    return {
      cx: this.cx,
      cy: this.cy,
      rx: this.rx,
      ry: this.ry,
      style: this.styleSnapshot(),
    };
  }

  restoreState(state: unknown): void {
    const saved = state as EllipseState;
    this.cx = saved.cx;
    this.cy = saved.cy;
    this.rx = saved.rx;
    this.ry = saved.ry;
    this.restoreStyle(saved.style);
  }

  protected override isGeometryAttribute(name: string): boolean {
    return name === "cx" || name === "cy" || name === "rx" || name === "ry";
  }

  protected override readGeometry(name: string): string | undefined {
    if (name === "cx") return NumberFormat.format(this.cx);
    if (name === "cy") return NumberFormat.format(this.cy);
    if (name === "rx") return NumberFormat.format(this.rx);
    if (name === "ry") return NumberFormat.format(this.ry);
    return undefined;
  }

  protected override writeGeometry(name: string, value: string): void {
    const parsed = NumberFormat.parse(value);
    if (name === "cx") this.cx = parsed;
    else if (name === "cy") this.cy = parsed;
    else if (name === "rx") this.rx = parsed;
    else if (name === "ry") this.ry = parsed;
    else throw new EditorError(`unknown attribute: ${name}`);
  }

  treeDetail(): string {
    return `cx=${NumberFormat.format(this.cx)} cy=${NumberFormat.format(this.cy)} rx=${NumberFormat.format(this.rx)} ry=${NumberFormat.format(this.ry)}${this.styleTreeSuffix()}`;
  }

  protected showBodyLines(): string[] {
    return [
      `  cx=${NumberFormat.format(this.cx)} cy=${NumberFormat.format(this.cy)} rx=${NumberFormat.format(this.rx)} ry=${NumberFormat.format(this.ry)}`,
    ];
  }

  toSvg(indent: string): string[] {
    return [
      `${indent}<ellipse id="${XmlCodec.escape(this.id)}" cx="${NumberFormat.format(this.cx)}" cy="${NumberFormat.format(this.cy)}" rx="${NumberFormat.format(this.rx)}" ry="${NumberFormat.format(this.ry)}"${this.styleSvgAttrs()}/>`,
    ];
  }
}
