import { capitalizeWords } from "./capitalizeWords";

export function spaceWords(name) {
  const withSpaces = name.replace(/[-_]/g, ' ');
  return capitalizeWords(withSpaces);
}
