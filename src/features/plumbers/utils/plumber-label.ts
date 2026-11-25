import type { Plumber, PlumberCategory } from "../types/plumber.types";

export const categoryLabel = (category: PlumberCategory) => (category === "labour" ? "Labour" : "Plumber");

/** Picker label: labour is marked so it isn't mistaken for a plumber of the same name. */
export const plumberLabel = (plumber: { name: string; category?: Plumber["category"] }) =>
  plumber.category === "labour" ? `${plumber.name} (Labour)` : plumber.name;

/** Only plumbers (not labour) can be set as a customer's plumber. */
export const onlyPlumbers = <T extends Pick<Plumber, "category">>(rows: T[]) => rows.filter((row) => row.category === "plumber");
