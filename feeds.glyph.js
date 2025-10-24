import { viri } from "./viri.mind.js";
export function saySymbol(sym, meaning=""){ viri.learn("glyph", { signal:sym, value:0.6, note:meaning }); }
globalThis.VAFI ||= {}; globalThis.VAFI.glyph = { saySymbol };
