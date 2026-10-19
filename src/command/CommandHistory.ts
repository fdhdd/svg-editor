import { EditorError } from "../error/EditorError";
import { Command } from "./Command";

export class CommandHistory {
  private readonly undoStack: Command[] = [];
  private readonly redoStack: Command[] = [];
  private locked = false;

  push(command: Command): void {
    this.undoStack.push(command);
    this.redoStack.length = 0;
    this.locked = false;
  }

  lock(): void {
    this.locked = true;
  }

  clearAndLock(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.locked = true;
  }

  undo(): string {
    this.rejectIfLocked();
    const command = this.undoStack.pop();
    if (!command) {
      throw new EditorError("nothing to undo");
    }
    const message = command.undo();
    this.redoStack.push(command);
    return message;
  }

  redo(): string {
    this.rejectIfLocked();
    const command = this.redoStack.pop();
    if (!command) {
      throw new EditorError("nothing to redo");
    }
    const message = command.execute();
    this.undoStack.push(command);
    return message;
  }

  private rejectIfLocked(): void {
    if (this.locked) {
      throw new EditorError("undo not allowed after io command");
    }
  }
}
