import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";
import { EditorSession } from "../src/app/EditorSession";
import { GroupShape } from "../src/shape/GroupShape";

function run(lines: string[]): string[] {
  const session = new EditorSession();
  const output: string[] = [];
  for (const line of lines) {
    const result = session.executeLine(line);
    if (result !== null) {
      output.push(result);
    }
  }
  return output;
}

function last(lines: string[]): string[] {
  return run(lines);
}

test("section 6 transcript", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "svg-editor-"));
  const demo = path.join(dir, "demo.svg");
  const other = path.join(dir, "other.svg");
  fs.copyFileSync(path.resolve("examples/other.svg"), other);
  const output = run([
    "init 800 600",
    "create rect bg 0 0 800 600 #ffffff",
    'create text title 20 40 "My Diagram"',
    "create circle c1 100 100 20 red",
    "create rect box 200 80 60 60 #3366ff",
    "group markers c1 box",
    "tree",
    "move c1 30 0",
    "undo",
    "redo",
    'set title text "My Diagram v2"',
    "undo",
    "group bad c1 markers",
    "delete box",
    "undo",
    `save ${demo}`,
    "undo",
    `read ${other}`,
    "tree",
  ]);
  assert.deepEqual(output.slice(0, 6), [
    "canvas 800x600 created",
    "rect#bg created",
    "text#title created",
    "circle#c1 created",
    "rect#box created",
    "g#markers created with 2 children",
  ]);
  assert.equal(
    output[6],
    [
      "svg (800x600)",
      "├── rect#bg        x=0 y=0 w=800 h=600 fill=#ffffff",
      '├── text#title     (20,40) "My Diagram"',
      "└── g#markers",
      "    ├── circle#c1  cx=100 cy=100 r=20 fill=red",
      "    └── rect#box   x=200 y=80 w=60 h=60 fill=#3366ff",
    ].join("\n"),
  );
  assert.deepEqual(output.slice(7, 15), [
    "circle#c1 moved to (130,100)",
    "circle#c1 moved back to (100,100)",
    "circle#c1 moved to (130,100)",
    'text#title updated: text="My Diagram v2"',
    'text#title updated: text="My Diagram"',
    "error: cannot group a container into its own descendant: markers",
    "rect#box deleted",
    "rect#box restored into g#markers",
  ]);
  assert.equal(output[15], `saved to ${demo} (5 elements)`);
  assert.equal(output[16], "error: undo not allowed after io command");
  assert.equal(output[17], `warning: assigned id rect1 to unnamed <rect>\nread ${other} (7 elements)`);
  assert.equal(
    output[18],
    [
      "svg (400x300)",
      "├── rect#rect1     x=0 y=0 w=400 h=300 fill=#ffffff",
      '├── text#t1        (10,290) "imported"',
      "├── circle#c1      cx=50 cy=50 r=10",
      "├── g#g1",
      "│   ├── rect#r2    x=0 y=0 w=10 h=10",
      "│   └── circle#c2  cx=5 cy=5 r=2",
      "└── ellipse#e1     cx=1 cy=2 rx=3 ry=4",
    ].join("\n"),
  );
  const saved = fs.readFileSync(demo, "utf8");
  assert.match(saved, /<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="800" height="600" viewBox="0 0 800 600">/);
  assert.match(saved, /<g id="markers">/);
  assert.equal(saved.endsWith("\n"), true);
});

test("flowchart version A and show", () => {
  const output = run([
    "init 800 600",
    "create g flowchart",
    "create g node1 in flowchart",
    "create rect start 120 100 160 60 #4a90d9 in node1",
    'create text start-label 155 135 "开始" in node1',
    "create g node2 in flowchart",
    "create rect process 520 100 160 60 #f5a623 in node2",
    'create text process-label 545 135 "处理数据" in node2',
    "create line arrow1 280 130 520 130 black in flowchart",
    "tree",
    "move node2 0 100",
    "undo",
    'set process-label text "处理数据 v2"',
    "show start-label",
    "show flowchart",
  ]);
  assert.deepEqual(output.slice(0, 9), [
    "canvas 800x600 created",
    "g#flowchart created",
    "g#node1 created in g#flowchart",
    "rect#start created in g#node1",
    "text#start-label created in g#node1",
    "g#node2 created in g#flowchart",
    "rect#process created in g#node2",
    "text#process-label created in g#node2",
    "line#arrow1 created in g#flowchart",
  ]);
  assert.match(output[9], /g#flowchart/);
  assert.match(output[9], /rect#start\s+x=120 y=100 w=160 h=60 fill=#4a90d9/);
  assert.match(output[9], /text#start-label\s+\(155,135\) "开始"/);
  assert.match(output[9], /line#arrow1\s+\(280,130\) -> \(520,130\)/);
  assert.doesNotMatch(output[9], /line#arrow1.*stroke/);
  assert.equal(output[10], "g#node2 moved by (0,100)");
  assert.equal(output[11], "g#node2 moved back by (0,-100)");
  assert.equal(output[12], 'text#process-label updated: text="处理数据 v2"');
  assert.equal(output[13], ['text#start-label  parent=g#node1', "  x=155 y=135", '  text="开始"'].join("\n"));
  assert.match(output[14], /g#flowchart  parent=svg/);
  assert.match(output[14], /children=3/);
});

test("error table and failed commands do not mutate", () => {
  const output = run([
    "tree",
    "init 800 600",
    "create hexagon h1 1 2 3",
    "create rect r1 0 0 10 10",
    "create rect r1 1 1 1 1",
    "create circle c1 1 1 1 in missing",
    "create circle c1 1 1 1 in r1",
    "move missing 1 0",
    "scale r1 0",
    "scale r1 -2",
    "set r1 opacity 1",
    "canvas 0 10",
    "save",
    "read missing.svg",
    "undo",
    "tree",
  ]);
  assert.equal(output[0], "error: no document. use 'init' or 'read' first");
  assert.equal(output[2], "error: unknown shape type: hexagon (is the plugin loaded?)");
  assert.equal(output[4], "error: id already exists: r1");
  assert.equal(output[5], "error: no such container: missing");
  assert.equal(output[6], "error: not a container: r1");
  assert.equal(output[7], "error: no such shape: missing");
  assert.equal(output[8], "error: scale factor must be positive");
  assert.equal(output[9], "error: scale factor must be positive");
  assert.equal(output[10], "error: unknown attribute: opacity");
  assert.equal(output[11], "error: canvas size must be positive");
  assert.equal(output[12], "error: no save path. use 'save <file.svg>'");
  assert.equal(output[13], "error: cannot read file: missing.svg");
  assert.equal(output[14], "rect#r1 removed");
  assert.doesNotMatch(output[15], /rect#r1/);
  assert.doesNotMatch(output[15], /circle#c1/);
});

test("undo lock, redo clear, scale recursion, z-order, ungroup, case", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "svg-editor-"));
  const file = path.join(dir, "a.svg");
  const output = run([
    "init 200 100",
    "create g scene",
    "create rect R1 10 10 20 20 in scene",
    "create rect r1 0 0 5 5 in scene",
    "ungroup scene",
    "create g inner in scene",
    "create circle c1 4 4 2 in inner",
    "ungroup inner",
    "undo",
    "scale scene 2",
    "tree scene",
    "undo",
    "front c1",
    "undo",
    "back R1",
    "undo",
    "addto inner r1",
    "undo",
    "addto inner scene",
    `save ${file}`,
    "redo",
    "create rect extra 1 1 1 1",
    "redo",
    "canvas",
    "canvas 300 100",
    "undo",
  ]);
  assert.equal(output[4], "error: cannot ungroup top-level container: scene");
  assert.equal(output[7], "g#inner ungrouped");
  assert.equal(output[8], "g#inner restored with 1 child");
  assert.equal(output[9], "g#scene scaled by 2");
  assert.match(output[10], /circle#c1\s+cx=8 cy=8 r=4/);
  assert.match(output[10], /rect#R1\s+x=20 y=20 w=40 h=40/);
  assert.equal(output[12], "circle#c1 brought to front");
  assert.equal(output[13], "circle#c1 z-order restored");
  assert.equal(output[14], "rect#R1 sent to back");
  assert.equal(output[16], "rect#r1 added to g#inner");
  assert.equal(output[18], "error: cannot add a container into its own descendant: scene");
  assert.equal(output[20], "error: undo not allowed after io command");
  assert.equal(output[22], "error: nothing to redo");
  assert.equal(output[23], "canvas 200x100");
  assert.equal(output[24], "canvas 300x100");
  assert.equal(output[25], "error: undo not allowed after io command");
  assert.equal(last(["init 10 10", "create rect a 1 1 1 1", "undo", "redo"])[3], "rect#a created");
});

test("composite kind refuses ungroup and read degrades data-kind", () => {
  const session = new EditorSession();
  for (const line of ["init 100 100", "create g outer", "create g n1 in outer"]) {
    session.executeLine(line);
  }
  const shape = session.requireDocument().requireShape("n1");
  assert.ok(shape instanceof GroupShape);
  shape.markComposite("box");
  assert.equal(session.executeLine("ungroup n1"), "error: cannot ungroup composite shape: n1");
  assert.equal(session.executeLine("ungroup missing"), "error: no such shape: missing");
  assert.equal(session.executeLine("ungroup outer"), "error: cannot ungroup top-level container: outer");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "svg-editor-"));
  const file = path.join(dir, "box.svg");
  fs.writeFileSync(
    file,
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <g id="outer">
    <g id="n1" data-kind="box">
      <rect id="n1-rect" x="1" y="2" width="3" height="4"/>
    </g>
  </g>
</svg>
`,
  );
  assert.match(session.executeLine(`read ${file}`) ?? "", /read .* \(3 elements\)/);
  assert.equal(session.executeLine("ungroup n1"), "g#n1 ungrouped");
  assert.match(session.executeLine("tree") ?? "", /rect#n1-rect/);
});

test("round trip keeps geometry, styles, and quoted text", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "svg-editor-"));
  const file = path.join(dir, "round.svg");
  const session = new EditorSession();
  const lines = [
    "init 80 40",
    "create ellipse e1 10 12 3 4 blue",
    "create line edge 1 2 3 4 black",
    'set edge stroke-width 2.5',
    'create text t1 8 9 "say \\"hi\\""',
    `save ${file}`,
  ];
  for (const line of lines) {
    const result = session.executeLine(line);
    assert.equal(result?.startsWith("error:"), false, result ?? "");
  }
  const again = new EditorSession();
  const read = again.executeLine(`read ${file}`);
  assert.match(read ?? "", /\(3 elements\)/);
  const tree = again.executeLine("tree") ?? "";
  assert.match(tree, /ellipse#e1\s+cx=10 cy=12 rx=3 ry=4 fill=blue/);
  assert.match(tree, /line#edge\s+\(1,2\) -> \(3,4\)/);
  assert.doesNotMatch(tree, /stroke=black/);
  const show = again.executeLine("show edge") ?? "";
  assert.match(show, /stroke=black/);
  assert.match(show, /stroke-width=2.5/);
  assert.match(again.executeLine("show t1") ?? "", /text="say "hi""/);
});

test("comments, empty lines, and id check before container", () => {
  const output = run([
    "# just a comment",
    "",
    "init 800 600",
    "create rect r1 0 0 1 1",
    "create circle r1 1 1 1 in missing",
    "group g1 r1 r1",
  ]);
  assert.equal(output[0], "canvas 800x600 created");
  assert.equal(output[1], "rect#r1 created");
  assert.equal(output[2], "error: id already exists: r1");
  assert.equal(output[3], "error: duplicate shape in group: r1");
});

test("cli banner and init", async () => {
  const output = await new Promise<string>((resolve, reject) => {
    const child = spawn(process.execPath, [path.resolve("node_modules/tsx/dist/cli.mjs"), "src/cli/Cli.ts"], {
      cwd: path.resolve("."),
      stdio: ["pipe", "pipe", "pipe"],
    });
    let text = "";
    child.stdout.on("data", (chunk) => {
      text += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      text += String(chunk);
    });
    child.on("error", reject);
    child.stdin.write("init 800 600\n");
    child.stdin.end();
    child.on("close", () => resolve(text));
  });
  assert.match(output, /svg-editor 0\.1 — type 'help' for commands/);
  assert.match(output, /canvas 800x600 created/);
});
