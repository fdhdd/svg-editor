import { NumberFormat } from "../util/NumberFormat";
import { XmlCodec } from "../util/XmlCodec";

export class ShapeStyle {
  private fillValue?: string;
  private strokeValue?: string;
  private strokeWidthValue?: string;

  isStyleAttribute(name: string): boolean {
    return name === "fill" || name === "stroke" || name === "stroke-width";
  }

  get(name: string): string | undefined {
    if (name === "fill") return this.fillValue;
    if (name === "stroke") return this.strokeValue;
    if (name === "stroke-width") return this.strokeWidthValue;
    return undefined;
  }

  set(name: string, value: string): void {
    if (name === "fill") {
      this.fillValue = value;
      return;
    }
    if (name === "stroke") {
      this.strokeValue = value;
      return;
    }
    if (name === "stroke-width") {
      this.strokeWidthValue = NumberFormat.format(NumberFormat.parse(value));
      return;
    }
  }

  clear(name: string): void {
    if (name === "fill") this.fillValue = undefined;
    if (name === "stroke") this.strokeValue = undefined;
    if (name === "stroke-width") this.strokeWidthValue = undefined;
  }

  copyFrom(other: ShapeStyle): void {
    this.fillValue = other.fillValue;
    this.strokeValue = other.strokeValue;
    this.strokeWidthValue = other.strokeWidthValue;
  }

  snapshot(): { fill?: string; stroke?: string; strokeWidth?: string } {
    return {
      fill: this.fillValue,
      stroke: this.strokeValue,
      strokeWidth: this.strokeWidthValue,
    };
  }

  restore(state: { fill?: string; stroke?: string; strokeWidth?: string }): void {
    this.fillValue = state.fill;
    this.strokeValue = state.stroke;
    this.strokeWidthValue = state.strokeWidth;
  }

  readAttributes(attributes: Readonly<Record<string, string>>): void {
    if (attributes.fill !== undefined) this.fillValue = attributes.fill;
    if (attributes.stroke !== undefined) this.strokeValue = attributes.stroke;
    if (attributes["stroke-width"] !== undefined) {
      this.strokeWidthValue = NumberFormat.format(NumberFormat.parse(attributes["stroke-width"]));
    }
  }

  toSvgAttrs(): string {
    let text = "";
    if (this.fillValue !== undefined) text += ` fill="${XmlCodec.escape(this.fillValue)}"`;
    if (this.strokeValue !== undefined) text += ` stroke="${XmlCodec.escape(this.strokeValue)}"`;
    if (this.strokeWidthValue !== undefined) text += ` stroke-width="${this.strokeWidthValue}"`;
    return text;
  }

  treeSuffix(): string {
    let text = "";
    if (this.fillValue !== undefined) text += ` fill=${this.fillValue}`;
    if (this.strokeValue !== undefined) text += ` stroke=${this.strokeValue}`;
    if (this.strokeWidthValue !== undefined) text += ` stroke-width=${this.strokeWidthValue}`;
    return text;
  }

  showLines(): string[] {
    const lines: string[] = [];
    if (this.fillValue !== undefined) lines.push(`  fill=${this.fillValue}`);
    if (this.strokeValue !== undefined) lines.push(`  stroke=${this.strokeValue}`);
    if (this.strokeWidthValue !== undefined) lines.push(`  stroke-width=${this.strokeWidthValue}`);
    return lines;
  }
}
