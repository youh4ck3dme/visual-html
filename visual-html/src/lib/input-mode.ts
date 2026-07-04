export const INPUT_MODES = ["upload", "url", "text", "import"] as const;

export type InputMode = (typeof INPUT_MODES)[number];

export function isInputMode(value: string): value is InputMode {
  return (INPUT_MODES as readonly string[]).includes(value);
}