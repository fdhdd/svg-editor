export class XmlElement {
  constructor(
    readonly name: string,
    readonly attributes: Readonly<Record<string, string>>,
    readonly children: readonly XmlElement[],
    readonly text: string,
  ) {}
}
