import { EditorError } from "../error/EditorError";
import { CircleShape } from "../shape/CircleShape";
import { EllipseShape } from "../shape/EllipseShape";
import { GroupShape } from "../shape/GroupShape";
import { LineShape } from "../shape/LineShape";
import { RectShape } from "../shape/RectShape";
import { Shape } from "../shape/Shape";
import { TextShape } from "../shape/TextShape";

interface ShapeBuilder {
  fromCli(id: string, args: string[]): Shape;
  fromXml(id: string, attributes: Readonly<Record<string, string>>, text: string): Shape;
}

/**
 * 按类型名创建图形。
 * TODO(refactor): 这里是架构方案中标注的两处「按名字分派」之一。
 * 插件化阶段应改为 ShapeProvider 注册，而不是在内核里枚举 rect/circle/...。
 */
export class ShapeFactory {
  private readonly builders = new Map<string, ShapeBuilder>();

  constructor() {
    this.builders.set("rect", RectShape);
    this.builders.set("circle", CircleShape);
    this.builders.set("ellipse", EllipseShape);
    this.builders.set("line", LineShape);
    this.builders.set("text", TextShape);
    this.builders.set("g", {
      fromCli: (id, args) => {
        if (args.length !== 0) {
          throw new EditorError("usage: create g <id> [in <containerId>]");
        }
        return new GroupShape(id, false);
      },
      fromXml: (id, attributes) => {
        const group = new GroupShape(id, false);
        group.importStyle(attributes);
        return group;
      },
    });
  }

  createFromCli(typeName: string, id: string, args: string[]): Shape {
    const builder = this.builderFor(typeName);
    return builder.fromCli(id, args);
  }

  createFromXml(typeName: string, id: string, attributes: Readonly<Record<string, string>>, text: string): Shape {
    const builder = this.builderFor(typeName);
    return builder.fromXml(id, attributes, text);
  }

  private builderFor(typeName: string): ShapeBuilder {
    const builder = this.builders.get(typeName);
    if (!builder) {
      throw new EditorError(`unknown shape type: ${typeName} (is the plugin loaded?)`);
    }
    return builder;
  }
}
