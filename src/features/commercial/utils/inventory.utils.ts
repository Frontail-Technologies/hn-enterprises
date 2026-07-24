import { materials } from "../data/materials.data";

export function getMaterial(id: string) {
  return materials.find((item) => item.id === id) ?? materials[0];
}

export function getMaterialByName(name: string) {
  return materials.find((item) => item.name === name) ?? materials[0];
}
