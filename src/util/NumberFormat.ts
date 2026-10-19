import { EditorError } from "../error/EditorError";

export class NumberFormat {
  static parse(token: string): number {
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(token)) {
      throw new EditorError(`invalid number: ${token}`);
    }
    const value = Number(token);
    if (!Number.isFinite(value)) {
      throw new EditorError(`invalid number: ${token}`);
    }
    return value;
  }

  static format(value: number): string {
    if (!Number.isFinite(value)) {
      throw new EditorError(`invalid number: ${value}`);
    }
    const rounded = Math.round(value * 1e6) / 1e6;
    if (rounded === 0) {
      return "0";
    }
    return String(rounded);
  }
}
