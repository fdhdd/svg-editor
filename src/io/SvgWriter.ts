import { SvgDocument } from "../document/SvgDocument";
import { NumberFormat } from "../util/NumberFormat";

export class SvgWriter {
  write(document: SvgDocument): string {
    const width = NumberFormat.format(document.width);
    const height = NumberFormat.format(document.height);
    const lines = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    ];
    for (const child of document.canvasOwner().children()) {
      lines.push(...child.toSvg("  "));
    }
    lines.push("</svg>");
    return `${lines.join("\n")}\n`;
  }
}
