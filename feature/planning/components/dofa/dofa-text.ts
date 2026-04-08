export function improveText(input: string) {
  const trimmed = input
    .trim()
    .replace(/^[•\-\u2022]+\s*/g, "")
    .replace(/\s+/g, " ");

  if (!trimmed) return "";

  const first = trimmed.charAt(0).toUpperCase();
  const rest = trimmed.slice(1);
  const sentence = `${first}${rest}`;

  if (/[.!?]$/.test(sentence)) return sentence;
  return `${sentence}.`;
}
