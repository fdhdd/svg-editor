export class HelpText {
  static render(): string {
    return [
      "commands:",
      "  init [w] [h]",
      "  read <file.svg>",
      "  save [file.svg]",
      "  canvas [w] [h]",
      "  create <type> <id> [params…] [in <containerId>]",
      "  delete <id>",
      "  move <id> <dx> <dy>",
      "  scale <id> <factor>",
      "  set <id> <attr> <value>",
      "  group <newGid> <id1> <id2>…",
      "  ungroup <gid>",
      "  addto <gid> <id>",
      "  front <id>",
      "  back <id>",
      "  tree [id]",
      "  show <id>",
      "  help",
      "  undo",
      "  redo",
      "types: rect, circle, ellipse, line, text, g",
    ].join("\n");
  }
}
