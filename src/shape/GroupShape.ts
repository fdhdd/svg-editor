import { Shape } from "./Shape";
import type { ChildOwner } from "./ChildOwner";
import { NumberFormat } from "../util/NumberFormat";
import { XmlCodec } from "../util/XmlCodec";

export class GroupShape extends Shape implements ChildOwner {
  private readonly childList: Shape[] = [];
  private compositeKind?: string;

  constructor(id: string, private readonly synthetic: boolean) {
    super(id);
  }

  get typeName(): string {
    return "g";
  }

  override isContainer(): boolean {
    return true;
  }

  override asGroup(): GroupShape {
    return this;
  }

  override isCompositeShape(): boolean {
    return this.compositeKind !== undefined;
  }

  markComposite(kind: string): void {
    this.compositeKind = kind;
  }

  isSyntheticRoot(): boolean {
    return this.synthetic;
  }

  placementLabel(): string {
    return this.synthetic ? "svg" : this.label();
  }

  owningShape(): Shape {
    return this;
  }

  override childShapes(): readonly Shape[] {
    return this.childList;
  }

  children(): readonly Shape[] {
    return this.childList;
  }

  childCount(): number {
    return this.childList.length;
  }

  indexOf(shape: Shape): number {
    return this.childList.indexOf(shape);
  }

  insertChild(shape: Shape, index: number): void {
    const bounded = Math.max(0, Math.min(index, this.childList.length));
    this.childList.splice(bounded, 0, shape);
    shape.attachTo(this);
  }

  detachChild(shape: Shape): void {
    const index = this.childList.indexOf(shape);
    if (index < 0) {
      return;
    }
    this.childList.splice(index, 1);
    shape.attachTo(null);
  }

  positionLabel(): string {
    return "(0,0)";
  }

  override describeMove(dx: number, dy: number, undone: boolean): string {
    const x = undone ? -dx : dx;
    const y = undone ? -dy : dy;
    const verb = undone ? "moved back by" : "moved by";
    return `${this.label()} ${verb} (${NumberFormat.format(x)},${NumberFormat.format(y)})`;
  }

  override treeLabel(): string {
    return this.compositeKind ? `${this.label()} (${this.compositeKind})` : this.label();
  }

  move(dx: number, dy: number): void {
    for (const child of this.childList) {
      child.move(dx, dy);
    }
  }

  scale(factor: number): void {
    for (const child of this.childList) {
      child.scale(factor);
    }
  }

  captureState(): unknown {
    return { style: this.styleSnapshot() };
  }

  restoreState(state: unknown): void {
    const saved = state as { style: { fill?: string; stroke?: string; strokeWidth?: string } };
    this.restoreStyle(saved.style);
  }

  treeDetail(): string {
    return "";
  }

  protected override showBodyLines(): string[] {
    const lines = [`  children=${this.childList.length}`];
    if (this.compositeKind) {
      lines.push(`  kind=${this.compositeKind}`);
    }
    return lines;
  }

  toSvg(indent: string): string[] {
    const kind = this.compositeKind ? ` data-kind="${XmlCodec.escape(this.compositeKind)}"` : "";
    if (this.childList.length === 0) {
      return [`${indent}<g id="${XmlCodec.escape(this.id)}"${kind}${this.styleSvgAttrs()}/>`];
    }
    const lines = [`${indent}<g id="${XmlCodec.escape(this.id)}"${kind}${this.styleSvgAttrs()}>`];
    for (const child of this.childList) {
      lines.push(...child.toSvg(`${indent}  `));
    }
    lines.push(`${indent}</g>`);
    return lines;
  }
}
