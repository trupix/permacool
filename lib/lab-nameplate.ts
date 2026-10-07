// Label-led suggestions only: unlabelled strings must be transcribed by a person.
export function parseNameplate(text: string) {
  const read = (label: string) => {
    const expression = new RegExp(
      `(?:^|\\n)[ \\t]*${label}[ \\t]*(?:number|no\\.?|#)?[ \\t]*[:#=.-]?[ \\t]*([^\\n]+)`,
      "i",
    );
    const match = text.match(expression);
    const value =
      match?.[1]
        ?.trim()
        .split(/\s{2,}|\s+(?:serial|model|volts?|hertz|amps?|s\/n)\b/i)[0]
        ?.trim() ?? "";
    return value && /[0-9]/.test(value) && value.length <= 100 ? value : "";
  };
  return {
    model: read("(?:model|mod\\.)"),
    serial: read("(?:serial|s\\s*[/\\-]\\s*n|ser\\.)"),
  };
}
export type LabPhoto = {
  id: string;
  assetId: string;
  kind: "nameplate" | "additional";
  caption: string;
  createdAt: string;
  author: string;
};
export function validPhotoId(id: string) {
  return /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
    id,
  );
}
