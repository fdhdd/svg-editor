import { EditorError } from "../error/EditorError";
import type { ChildOwner } from "../shape/ChildOwner";
import { GroupShape } from "../shape/GroupShape";
import { Shape } from "../shape/Shape";

export interface Placement {
  parent: ChildOwner;
  index: number;
}

export class SvgDocument {
  private readonly root: GroupShape;
  private readonly ids = new Map<string, Shape>();
  private widthValue: number;
  private heightValue: number;
  private pathValue?: string;

  constructor(width: number, height: number) {
    SvgDocument.requirePositive(width, height);
    this.widthValue = width;
    this.heightValue = height;
    this.root = new GroupShape("", true);
  }

  static requirePositive(width: number, height: number): void {
    if (!(width > 0) || !(height > 0)) {
      throw new EditorError("canvas size must be positive");
    }
  }

  get width(): number {
    return this.widthValue;
  }

  get height(): number {
    return this.heightValue;
  }

  get sourcePath(): string | undefined {
    return this.pathValue;
  }

  setSourcePath(path: string): void {
    this.pathValue = path;
  }

  resize(width: number, height: number): void {
    SvgDocument.requirePositive(width, height);
    this.widthValue = width;
    this.heightValue = height;
  }

  count(): number {
    return this.ids.size;
  }

  has(id: string): boolean {
    return this.ids.has(id);
  }

  canvasOwner(): ChildOwner {
    return this.root;
  }

  requireShape(id: string): Shape {
    const shape = this.ids.get(id);
    if (!shape) {
      throw new EditorError(`no such shape: ${id}`);
    }
    return shape;
  }

  requireContainer(id: string): GroupShape {
    const shape = this.ids.get(id);
    if (!shape) {
      throw new EditorError(`no such container: ${id}`);
    }
    if (!shape.isContainer()) {
      throw new EditorError(`not a container: ${id}`);
    }
    return shape.asGroup();
  }

  adopt(shape: Shape, parent: ChildOwner, index: number): void {
    this.assertFree(shape);
    parent.insertChild(shape, index);
    this.indexTree(shape);
  }

  remove(shape: Shape): Placement {
    const placement = this.detach(shape);
    this.unindexTree(shape);
    return placement;
  }

  restore(shape: Shape, placement: Placement): void {
    placement.parent.insertChild(shape, placement.index);
    this.indexTree(shape);
  }

  reparent(shape: Shape, parent: ChildOwner, index: number): Placement {
    const previous = this.detach(shape);
    parent.insertChild(shape, index);
    return previous;
  }

  register(shape: Shape): void {
    if (this.ids.has(shape.id)) {
      throw new EditorError(`id already exists: ${shape.id}`);
    }
    this.ids.set(shape.id, shape);
  }

  unregister(shape: Shape): void {
    this.ids.delete(shape.id);
  }

  compareOrder(left: Shape, right: Shape): number {
    const leftPath = this.indexPath(left);
    const rightPath = this.indexPath(right);
    const length = Math.min(leftPath.length, rightPath.length);
    for (let i = 0; i < length; i++) {
      if (leftPath[i] !== rightPath[i]) {
        return leftPath[i] - rightPath[i];
      }
    }
    return leftPath.length - rightPath.length;
  }

  private detach(shape: Shape): Placement {
    const parent = shape.parentGroup();
    const index = parent.indexOf(shape);
    if (index < 0) {
      throw new EditorError(`no such shape: ${shape.id}`);
    }
    parent.detachChild(shape);
    return { parent, index };
  }

  private assertFree(shape: Shape): void {
    if (this.ids.has(shape.id)) {
      throw new EditorError(`id already exists: ${shape.id}`);
    }
    for (const child of shape.childShapes()) {
      this.assertFree(child);
    }
  }

  private indexTree(shape: Shape): void {
    this.ids.set(shape.id, shape);
    for (const child of shape.childShapes()) {
      this.indexTree(child);
    }
  }

  private unindexTree(shape: Shape): void {
    this.ids.delete(shape.id);
    for (const child of shape.childShapes()) {
      this.unindexTree(child);
    }
  }

  private indexPath(shape: Shape): number[] {
    const path: number[] = [];
    let current: Shape | null = shape;
    while (current) {
      const parent = current.getParent();
      if (!parent) {
        break;
      }
      path.push(parent.indexOf(current));
      current = parent.isSyntheticRoot() ? null : parent.owningShape();
    }
    path.reverse();
    return path;
  }
}
