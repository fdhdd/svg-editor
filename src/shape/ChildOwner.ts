import type { Shape } from "./Shape";

/** 容器对子节点的最小能力。叶子与组合都通过它找父级，避免 Shape ↔ GroupShape 循环依赖。 */
export interface ChildOwner {
  readonly id: string;
  readonly typeName: string;
  isSyntheticRoot(): boolean;
  placementLabel(): string;
  owningShape(): Shape;
  childCount(): number;
  children(): readonly Shape[];
  indexOf(shape: Shape): number;
  insertChild(shape: Shape, index: number): void;
  detachChild(shape: Shape): void;
}
