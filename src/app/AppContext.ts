import { CommandHistory } from "../command/CommandHistory";
import { SvgDocument } from "../document/SvgDocument";
import { ShapeFactory } from "../factory/ShapeFactory";
import { FileStore } from "../io/FileStore";

export interface AppContext {
  requireDocument(): SvgDocument;
  replaceDocument(document: SvgDocument): void;
  lockHistory(): void;
  readonly history: CommandHistory;
  readonly factory: ShapeFactory;
  readonly files: FileStore;
}
