import { EditorError } from "../error/EditorError";

export class CommandTokenizer {
  static tokenize(line: string): string[] {
    const tokens: string[] = [];
    let index = 0;
    while (index < line.length) {
      while (index < line.length && /\s/.test(line[index])) {
        index += 1;
      }
      if (index >= line.length) {
        break;
      }
      if (line[index] === '"') {
        index += 1;
        let value = "";
        let closed = false;
        while (index < line.length) {
          const current = line[index];
          if (current === "\\") {
            const next = line[index + 1];
            if (next === undefined) {
              throw new EditorError("unterminated string");
            }
            value += next;
            index += 2;
            continue;
          }
          if (current === '"') {
            closed = true;
            index += 1;
            break;
          }
          value += current;
          index += 1;
        }
        if (!closed) {
          throw new EditorError("unterminated string");
        }
        tokens.push(value);
        continue;
      }
      const start = index;
      while (index < line.length && !/\s/.test(line[index])) {
        index += 1;
      }
      tokens.push(line.slice(start, index));
    }
    return tokens;
  }
}
