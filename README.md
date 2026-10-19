# svg-editor

Lab1 Phase 1：SVG 编辑器命令行。TypeScript，面向对象，内置 `rect` / `circle` / `ellipse` / `line` / `text` / `g`。

## 运行

```powershell
npm install
npm test
npm run build
npm run cli
```

Windows 终端如果中文或 `—` 乱码，先执行 `chcp 65001`。

启动横幅为 `svg-editor 0.1 — type 'help' for commands`，提示符为 `svg> `。`#` 开头的整行是注释。架构说明见 [doc/README.md](doc/README.md)。

`box` 属于后续插件阶段，本阶段 `create box` 会报 `unknown shape type`。
