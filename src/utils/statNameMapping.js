import { capitalizeWords } from "./capitalizeWords";

const statNameMapping = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Special Attack",
  "special-defense": "Special Defense",
  speed: "Speed"
};

export function getStatName(originalName) {
  return statNameMapping[originalName] || capitalizeWords(originalName);
}
