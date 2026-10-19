import { EditorError } from "../error/EditorError";
import { XmlCodec } from "../util/XmlCodec";
import { XmlElement } from "./XmlElement";

export class XmlParser {
  private index = 0;

  private constructor(private readonly source: string) {}

  static parse(source: string): XmlElement {
    const text = source.replace(/^\uFEFF/, "");
    return new XmlParser(text).parseDocument();
  }

  private parseDocument(): XmlElement {
    this.skipMisc();
    if (this.index >= this.source.length || this.source[this.index] !== "<") {
      throw new EditorError("invalid svg: missing root element");
    }
    return this.parseElement();
  }

  private parseElement(): XmlElement {
    this.expect("<");
    const name = this.readName();
    const attributes = this.readAttributes();
    this.skipWhitespace();
    if (this.startsWith("/>")) {
      this.index += 2;
      return new XmlElement(name, attributes, [], "");
    }
    this.expect(">");
    const children: XmlElement[] = [];
    let text = "";
    while (this.index < this.source.length) {
      if (this.startsWith("</")) {
        this.index += 2;
        const endName = this.readName();
        this.skipWhitespace();
        this.expect(">");
        if (endName !== name) {
          throw new EditorError(`invalid svg: mismatched tag ${endName}`);
        }
        return new XmlElement(name, attributes, children, text);
      }
      if (this.startsWith("<!--")) {
        this.skipUntil("-->");
        continue;
      }
      if (this.startsWith("<?")) {
        this.skipUntil("?>");
        continue;
      }
      if (this.startsWith("<")) {
        children.push(this.parseElement());
        continue;
      }
      text += this.readText();
    }
    throw new EditorError(`invalid svg: unclosed tag ${name}`);
  }

  private readAttributes(): Record<string, string> {
    const attributes: Record<string, string> = {};
    while (this.index < this.source.length) {
      this.skipWhitespace();
      if (this.startsWith("/>") || this.startsWith(">")) {
        break;
      }
      const name = this.readName();
      this.skipWhitespace();
      this.expect("=");
      this.skipWhitespace();
      attributes[name] = XmlCodec.unescape(this.readAttributeValue());
    }
    return attributes;
  }

  private readAttributeValue(): string {
    const quote = this.source[this.index];
    if (quote === '"' || quote === "'") {
      this.index += 1;
      const start = this.index;
      while (this.index < this.source.length && this.source[this.index] !== quote) {
        this.index += 1;
      }
      if (this.index >= this.source.length) {
        throw new EditorError("invalid svg: unterminated attribute");
      }
      const value = this.source.slice(start, this.index);
      this.index += 1;
      return value;
    }
    const start = this.index;
    while (this.index < this.source.length && !/[\s>/"']/.test(this.source[this.index])) {
      this.index += 1;
    }
    if (start === this.index) {
      throw new EditorError("invalid svg: missing attribute value");
    }
    return this.source.slice(start, this.index);
  }

  private readText(): string {
    const start = this.index;
    while (this.index < this.source.length && this.source[this.index] !== "<") {
      this.index += 1;
    }
    return XmlCodec.unescape(this.source.slice(start, this.index));
  }

  private readName(): string {
    const start = this.index;
    if (this.index < this.source.length && /[A-Za-z_:]/.test(this.source[this.index])) {
      this.index += 1;
      while (this.index < this.source.length && /[A-Za-z0-9_.:-]/.test(this.source[this.index])) {
        this.index += 1;
      }
    }
    if (start === this.index) {
      throw new EditorError("invalid svg: expected name");
    }
    return this.source.slice(start, this.index);
  }

  private skipMisc(): void {
    while (this.index < this.source.length) {
      this.skipWhitespace();
      if (this.startsWith("<?")) {
        this.skipUntil("?>");
        continue;
      }
      if (this.startsWith("<!--")) {
        this.skipUntil("-->");
        continue;
      }
      if (this.startsWith("<!")) {
        this.skipUntil(">");
        continue;
      }
      break;
    }
  }

  private skipWhitespace(): void {
    while (this.index < this.source.length && /\s/.test(this.source[this.index])) {
      this.index += 1;
    }
  }

  private skipUntil(marker: string): void {
    const found = this.source.indexOf(marker, this.index);
    if (found < 0) {
      throw new EditorError("invalid svg: unclosed markup");
    }
    this.index = found + marker.length;
  }

  private expect(token: string): void {
    if (!this.startsWith(token)) {
      throw new EditorError("invalid svg: unexpected markup");
    }
    this.index += token.length;
  }

  private startsWith(token: string): boolean {
    return this.source.startsWith(token, this.index);
  }
}
