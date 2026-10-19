import fs from "node:fs";
import { EditorError } from "../error/EditorError";

export class FileStore {
  read(path: string): string {
    try {
      return fs.readFileSync(path, "utf8");
    } catch {
      throw new EditorError(`cannot read file: ${path}`);
    }
  }

  write(path: string, content: string): void {
    try {
      fs.writeFileSync(path, content, "utf8");
    } catch {
      throw new EditorError(`cannot write file: ${path}`);
    }
  }
}
