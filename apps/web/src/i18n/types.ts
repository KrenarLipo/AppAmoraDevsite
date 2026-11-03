import type en from "./dictionaries/en";

// English is the source of truth: every other language must have the same keys.
export type Dictionary = typeof en;
