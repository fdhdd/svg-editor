import { SvgDocument } from "../document/SvgDocument";
import { EditorError } from "../error/EditorError";
import { ShapeFactory } from "../factory/ShapeFactory";
import { NumberFormat } from "../util/NumberFormat";
import { Shape } from "../shape/Shape";
import { XmlElement } from "./XmlElement";
import { XmlParser } from "./XmlParser";

export interface SvgReadResult {
  document: SvgDocument;
  warnings: string[];
}

/**
 * 未安装插件时忽略 data-kind，把复合图形降级成普通 g。
 * 本阶段内核不还原 box，因此读入不会调用 markComposite。
 */
export class SvgReader {
  constructor(private readonly factory: ShapeFactory) {}

  read(xml: string): SvgReadResult {
    const root = XmlParser.parse(xml);
    if (root.name !== "svg") {
      throw new EditorError("invalid svg: root must be svg");
    }
    const size = this.canvasSize(root.attributes);
    const document = new SvgDocument(size.width, size.height);
    const warnings: string[] = [];
    const reserved = new Set<string>();
    const counters = new Map<string, number>();
    this.rejectLooseText(root);
    for (const child of root.children) {
      const shape = this.readShape(child, warnings, reserved, counters);
      document.adopt(shape, document.canvasOwner(), document.canvasOwner().childCount());
    }
    return { document, warnings };
  }

  private readShape(
    element: XmlElement,
    warnings: string[],
    reserved: Set<string>,
    counters: Map<string, number>,
  ): Shape {
    this.rejectLooseText(element);
    const id = this.resolveId(element, warnings, reserved, counters);
    const shape = this.factory.createFromXml(element.name, id, element.attributes, element.text);
    if (element.name === "text" && element.children.length > 0) {
      throw new EditorError("invalid svg: text cannot contain elements");
    }
    if (shape.isContainer()) {
      const group = shape.asGroup();
      for (const child of element.children) {
        group.insertChild(this.readShape(child, warnings, reserved, counters), group.childCount());
      }
    } else if (element.children.length > 0) {
      throw new EditorError(`invalid svg: ${element.name} cannot contain elements`);
    }
    return shape;
  }

  private resolveId(
    element: XmlElement,
    warnings: string[],
    reserved: Set<string>,
    counters: Map<string, number>,
  ): string {
    const given = element.attributes.id;
    if (given !== undefined && given !== "") {
      this.claim(given, reserved);
      return given;
    }
    let sequence = counters.get(element.name) ?? 0;
    let id = "";
    do {
      sequence += 1;
      id = `${element.name}${sequence}`;
    } while (reserved.has(id));
    counters.set(element.name, sequence);
    this.claim(id, reserved);
    warnings.push(`assigned id ${id} to unnamed <${element.name}>`);
    return id;
  }

  private claim(id: string, reserved: Set<string>): void {
    if (reserved.has(id)) {
      throw new EditorError(`id already exists: ${id}`);
    }
    reserved.add(id);
  }

  private rejectLooseText(element: XmlElement): void {
    if (element.name !== "text" && element.text.trim() !== "") {
      throw new EditorError("invalid svg: unexpected text");
    }
  }

  private canvasSize(attributes: Readonly<Record<string, string>>): { width: number; height: number } {
    let width = attributes.width;
    let height = attributes.height;
    if ((!width || !height) && attributes.viewBox) {
      const parts = attributes.viewBox.trim().split(/[\s,]+/);
      if (parts.length === 4) {
        width = width || parts[2];
        height = height || parts[3];
      }
    }
    if (!width || !height) {
      throw new EditorError("invalid svg: missing canvas size");
    }
    const parsedWidth = NumberFormat.parse(width);
    const parsedHeight = NumberFormat.parse(height);
    SvgDocument.requirePositive(parsedWidth, parsedHeight);
    return { width: parsedWidth, height: parsedHeight };
  }
}
