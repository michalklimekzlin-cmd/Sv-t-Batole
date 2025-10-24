import { viri } from "./viri.mind.js";
export const Pedrovci = {
  emotion(emotion, value=0.5, note="") {
    viri.learn("pedrovci", { emotion, value, note });
  }
};
globalThis.VAFI ||= {}; globalThis.VAFI.pedrovci = Pedrovci;
