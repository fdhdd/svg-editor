import { EditorError } from "../error/EditorError";
import { NumberFormat } from "../util/NumberFormat";
import { XmlCodec } from "../util/XmlCodec";
import { Shape } from "./Shape";

interface TextState {
  x: number;
  y: number;
  text: string;
  style: { fill?: string; stroke?: string; strokeWidth?: string };
}

export class TextShape extends Shape {
  private x: number;
  private y: number;
  private text: string;

  constructor(id: string, x: number, y: number, text: string) {
    super(id);
    this.x = x;
    this.y = y;
    this.text = text;
  }

  get typeName(): string {
    return "text";
  }

  static fromCli(id: string, args: string[]): TextShape {
    if (args.length !== 3) {
      throw new EditorError('usage: create text <id> <x> <y> "content" [in <containerId>]');
    }
    return new TextShape(id, NumberFormat.parse(args[0]), NumberFormat.parse(args[1]), args[2]);
  }

  static fromXml(id: string, attributes: Readonly<Record<string, string>>, text: string): TextShape {
    const shape = new TextShape(
      id,
      NumberFormat.parse(attributes.x ?? "0"),
      NumberFormat.parse(attributes.y ?? "0"),
      text,
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
  }

  captureState(): TextState {
    return { x: this.x, y: this.y, text: this.text, style: this.styleSnapshot() };
  }

  restoreState(state: unknown): void {
    const saved = state as TextState;
    this.x = saved.x;
    this.y = saved.y;
    this.text = saved.text;
    this.restoreStyle(saved.style);
  }

  protected override isGeometryAttribute(name: string): boolean {
    return name === "x" || name === "y" || name === "text";
  }

  protected override readGeometry(name: string): string | undefined {
    if (name === "x") return NumberFormat.format(this.x);
    if (name === "y") return NumberFormat.format(this.y);
    if (name === "text") return this.text;
    return undefined;
  }

  protected override writeGeometry(name: string, value: string): void {
    if (name === "text") {
      this.text = value;
      return;
    }
    const parsed = NumberFormat.parse(value);
    if (name === "x") this.x = parsed;
    else if (name === "y") this.y = parsed;
    else throw new EditorError(`unknown attribute: ${name}`);
  }

  treeDetail(): string {
    return `(${NumberFormat.format(this.x)},${NumberFormat.format(this.y)}) "${this.text}"`;
  }

  protected showBodyLines(): string[] {
    return [`  x=${NumberFormat.format(this.x)} y=${NumberFormat.format(this.y)}`, `  text="${this.text}"`];
  }

  toSvg(indent: string): string[] {
    return [
      `${indent}<text id="${XmlCodec.escape(this.id)}" x="${NumberFormat.format(this.x)}" y="${NumberFormat.format(this.y)}"${this.styleSvgAttrs()}>${XmlCodec.escape(this.text)}</text>`,
    ];
  }
}
