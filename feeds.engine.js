import { viri } from "./viri.mind.js";
let t = 0;
setInterval(()=>{
  t += 1;
  const pulse = 0.6 + 0.4*Math.sin(t/10);
  viri.learn("engine", { value:pulse, note:"heart" });
}, 3000);
