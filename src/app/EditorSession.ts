import { CommandHistory } from "../command/CommandHistory";
import { CommandRegistrar } from "../command/CommandRegistrar";
import { CommandRegistry } from "../command/CommandRegistry";
import { CommandTokenizer } from "./CommandTokenizer";
import { SvgDocument } from "../document/SvgDocument";
import { EditorError } from "../error/EditorError";
import { ShapeFactory } from "../factory/ShapeFactory";
import { FileStore } from "../io/FileStore";
import { AppContext } from "./AppContext";

export class EditorSession implements AppContext {
  readonly history = new CommandHistory();
  readonly factory = new ShapeFactory();
  readonly files = new FileStore();
  private document?: SvgDocument;
  private readonly registry = new CommandRegistry();

  constructor() {
    new CommandRegistrar().register(this.registry);
  }

  requireDocument(): SvgDocument {
    if (!this.document) {
      throw new EditorError("no document. use 'init' or 'read' first");
    }
    return this.document;
  }

  replaceDocument(document: SvgDocument): void {
    this.document = document;
    this.history.clearAndLock();
  }

  lockHistory(): void {
    this.history.lock();
  }

  executeLine(line: string): string | null {
    const trimmed = line.replace(/\r$/, "").trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      return null;
    }
    try {
      const tokens = CommandTokenizer.tokenize(trimmed);
      if (tokens.length === 0) {
        return null;
      }
      const [name, ...args] = tokens;
      return this.registry.require(name)(this, args);
    } catch (error) {
      if (error instanceof EditorError) {
        return `error: ${error.message}`;
      }
      throw error;
    }
  }
}
