import { getBlueprint } from "./world.builder.js";
export function exportJSON(){
  const blob = new Blob([JSON.stringify(getBlueprint(),null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "viri-blueprint.json"; a.click();
  URL.revokeObjectURL(url);
}
globalThis.VAFI ||= {}; globalThis.VAFI.exporter = { exportJSON };
