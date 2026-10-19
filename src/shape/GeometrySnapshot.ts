import { Shape } from "./Shape";

interface GeometryRecord {
  shape: Shape;
  state: unknown;
}

export class GeometrySnapshot {
  private readonly records: GeometryRecord[] = [];

  static capture(shape: Shape): GeometrySnapshot {
    const snapshot = new GeometrySnapshot();
    const walk = (current: Shape): void => {
      snapshot.records.push({ shape: current, state: current.captureState() });
      for (const child of current.childShapes()) {
        walk(child);
      }
    };
    walk(shape);
    return snapshot;
  }

  restore(): void {
    for (const record of this.records) {
      record.shape.restoreState(record.state);
    }
  }
}
