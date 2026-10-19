import { SvgDocument } from "../document/SvgDocument";
import { NumberFormat } from "../util/NumberFormat";
import { Shape } from "../shape/Shape";

interface TreeRow {
  prefix: string;
  label: string;
  detail: string;
}

export class TreeFormatter {
  formatDocument(document: SvgDocument): string {
    const header = `svg (${NumberFormat.format(document.width)}x${NumberFormat.format(document.height)})`;
    const rows = this.rowsOf(document.canvasOwner().children(), "");
    return [header, ...this.render(rows)].join("\n");
  }

  formatSubtree(shape: Shape): string {
    const rows: TreeRow[] = [
      { prefix: "", label: shape.treeLabel(), detail: shape.treeDetail() },
      ...this.rowsOf(shape.childShapes(), ""),
    ];
    return this.render(rows).join("\n");
  }

  private rowsOf(children: readonly Shape[], indent: string): TreeRow[] {
    const rows: TreeRow[] = [];
    children.forEach((child, index) => {
      const last = index === children.length - 1;
      const branch = last ? "└── " : "├── ";
      rows.push({
        prefix: indent + branch,
        label: child.treeLabel(),
        detail: child.treeDetail(),
      });
      const childIndent = indent + (last ? "    " : "│   ");
      rows.push(...this.rowsOf(child.childShapes(), childIndent));
    });
    return rows;
  }

  private render(rows: TreeRow[]): string[] {
    const detailed = rows.filter((row) => row.detail !== "");
    const column = detailed.reduce((max, row) => Math.max(max, row.prefix.length + row.label.length), 0) + 2;
    return rows.map((row) => {
      if (row.detail === "") {
        return `${row.prefix}${row.label}`;
      }
      const pad = Math.max(1, column - row.prefix.length - row.label.length);
      return `${row.prefix}${row.label}${" ".repeat(pad)}${row.detail}`;
    });
  }
}
