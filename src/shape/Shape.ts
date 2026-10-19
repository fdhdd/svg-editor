import type { ChildOwner } from "./ChildOwner";
import type { GroupShape } from "./GroupShape";
import { EditorError } from "../error/EditorError";
import { NumberFormat } from "../util/NumberFormat";
import { ShapeStyle } from "./ShapeStyle";

export abstract class Shape {
  private parentOwner: ChildOwner | null = null;
  private readonly style = new ShapeStyle();

  protected constructor(private readonly shapeId: string) {}

  get id(): string {
    return this.shapeId;
  }

  abstract get typeName(): string;

  label(): string {
    return `${this.typeName}#${this.id}`;
  }

  treeLabel(): string {
    return this.label();
  }

  isContainer(): boolean {
    return false;
  }

  asGroup(): GroupShape {
    throw new EditorError(`not a container: ${this.id}`);
  }

  isCompositeShape(): boolean {
    return false;
  }

  getParent(): ChildOwner | null {
    return this.parentOwner;
  }

  attachTo(owner: ChildOwner | null): void {
    this.parentOwner = owner;
  }

  parentGroup(): ChildOwner {
    const parent = this.parentOwner;
    if (!parent) {
      throw new EditorError(`no such shape: ${this.id}`);
    }
    return parent;
  }

  isDescendantOf(ancestor: Shape): boolean {
    let owner = this.parentOwner;
    while (owner) {
      if (owner.owningShape() === ancestor) {
        return true;
      }
      owner = owner.owningShape().getParent();
    }
    return false;
  }

  childShapes(): readonly Shape[] {
    return [];
  }

  abstract positionLabel(): string;

  describeMove(dx: number, dy: number, undone: boolean): string {
    const pos = this.positionLabel();
    return undone
      ? `${this.label()} moved back to ${pos}`
      : `${this.label()} moved to ${pos}`;
  }

  describeScale(factor: number, undone: boolean): string {
    if (undone) {
      return `${this.label()} scaled back by ${NumberFormat.format(1 / factor)}`;
    }
    return `${this.label()} scaled by ${NumberFormat.format(factor)}`;
  }

  abstract move(dx: number, dy: number): void;

  abstract scale(factor: number): void;

  abstract captureState(): unknown;

  abstract restoreState(state: unknown): void;

  protected styleSnapshot(): { fill?: string; stroke?: string; strokeWidth?: string } {
    return this.style.snapshot();
  }

  protected restoreStyle(state: { fill?: string; stroke?: string; strokeWidth?: string }): void {
    this.style.restore(state);
  }

  protected readStyle(attributes: Readonly<Record<string, string>>): void {
    this.style.readAttributes(attributes);
  }

  importStyle(attributes: Readonly<Record<string, string>>): void {
    this.readStyle(attributes);
  }

  protected styleSvgAttrs(): string {
    return this.style.toSvgAttrs();
  }

  protected styleTreeSuffix(): string {
    return this.style.treeSuffix();
  }

  protected styleShowLines(): string[] {
    return this.style.showLines();
  }

  getAttribute(name: string): string | undefined {
    if (this.style.isStyleAttribute(name)) {
      return this.style.get(name);
    }
    if (this.isGeometryAttribute(name)) {
      return this.readGeometry(name);
    }
    throw new EditorError(`unknown attribute: ${name}`);
  }

  setAttribute(name: string, value: string | undefined): void {
    if (value === undefined) {
      if (this.style.isStyleAttribute(name)) {
        this.style.clear(name);
        return;
      }
      throw new EditorError(`unknown attribute: ${name}`);
    }
    if (this.style.isStyleAttribute(name)) {
      this.style.set(name, value);
      return;
    }
    if (this.isGeometryAttribute(name)) {
      this.writeGeometry(name, value);
      return;
    }
    throw new EditorError(`unknown attribute: ${name}`);
  }

  protected isGeometryAttribute(_name: string): boolean {
    return false;
  }

  protected readGeometry(_name: string): string | undefined {
    return undefined;
  }

  protected writeGeometry(_name: string, _value: string): void {
    throw new EditorError(`unknown attribute: ${_name}`);
  }

  abstract treeDetail(): string;

  showText(): string {
    const parent = this.parentOwner;
    const parentLabel = parent ? parent.placementLabel() : "svg";
    const lines = [`${this.label()}  parent=${parentLabel}`, ...this.showBodyLines(), ...this.styleShowLines()];
    return lines.join("\n");
  }

  protected abstract showBodyLines(): string[];

  abstract toSvg(indent: string): string[];

  protected requireNumber(name: string, raw: string | undefined, fallback = 0): number {
    if (raw === undefined || raw === "") {
      return fallback;
    }
    return NumberFormat.parse(raw);
  }
}
