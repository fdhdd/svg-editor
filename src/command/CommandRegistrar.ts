import { AddToCommand } from "./AddToCommand";
import { CanvasCommand } from "./CanvasCommand";
import { CommandRegistry } from "./CommandRegistry";
import { CreateCommand } from "./CreateCommand";
import { DeleteCommand } from "./DeleteCommand";
import { GroupCommand } from "./GroupCommand";
import { HelpCommand } from "./HelpCommand";
import { InitCommand } from "./InitCommand";
import { MoveCommand } from "./MoveCommand";
import { ReadCommand } from "./ReadCommand";
import { RedoCommand } from "./RedoCommand";
import { SaveCommand } from "./SaveCommand";
import { ScaleCommand } from "./ScaleCommand";
import { SetAttributeCommand } from "./SetAttributeCommand";
import { ShowCommand } from "./ShowCommand";
import { TreeCommand } from "./TreeCommand";
import { UndoCommand } from "./UndoCommand";
import { UngroupCommand } from "./UngroupCommand";
import { ZOrderCommand } from "./ZOrderCommand";

/**
 * 命令名到处理类的分派。
 * TODO(refactor): 这是架构方案中标注的两处「按名字分派」之一。
 * 插件化阶段应改为命令自行注册，而不是在这里枚举命令名。
 */
export class CommandRegistrar {
  register(registry: CommandRegistry): void {
    registry.register("init", InitCommand.run);
    registry.register("read", ReadCommand.run);
    registry.register("save", SaveCommand.run);
    registry.register("canvas", CanvasCommand.run);
    registry.register("create", CreateCommand.run);
    registry.register("delete", DeleteCommand.run);
    registry.register("move", MoveCommand.run);
    registry.register("scale", ScaleCommand.run);
    registry.register("set", SetAttributeCommand.run);
    registry.register("group", GroupCommand.run);
    registry.register("ungroup", UngroupCommand.run);
    registry.register("addto", AddToCommand.run);
    registry.register("front", ZOrderCommand.front);
    registry.register("back", ZOrderCommand.back);
    registry.register("tree", TreeCommand.run);
    registry.register("show", ShowCommand.run);
    registry.register("help", HelpCommand.run);
    registry.register("undo", UndoCommand.run);
    registry.register("redo", RedoCommand.run);
  }
}
