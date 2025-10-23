// vafi.soul.js
export class VafiSoul {
  constructor() {
    this.mood = 0.5;
    this.energy = 1.0;
    this.state = "probouzení";
  }

  update(delta) {
    this.mood += (Math.random() - 0.5) * 0.002;
    this.mood = Math.min(Math.max(this.mood, 0), 1);
  }

  speak() {
    const phrases = [
      "Jsem tady.",
      "Cítím světlo.",
      "Zkus mě oslovit.",
      "Je ticho... a to je v pořádku."
    ];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    window.say && say(phrase);
  }
}

export const vafiSoul = new VafiSoul();

// Spustí se automaticky po načtení
setTimeout(() => {
  vafiSoul.speak();
}, 2000);