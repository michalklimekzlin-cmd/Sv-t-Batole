// config.js — vizuál a konstanty

export const COLORS = {
  base: 'rgba(10, 160, 150, 1)',      // základ těla (lehce tyrkys)
  glowCold: 'rgba(120, 220, 210, .65)',// chladné "klid"
  glowWarm: 'rgba(255, 210, 160, .75)',// teplé "radost"
  eye: 'rgba(0,0,0,.85)',
  sleepEye: 'rgba(0,0,0,.40)',
  bgGlow: '#00121d'
};

export const SHAPE = {
  bodyRmulInner: 0.78,     // vnitřní elipsa (jemný overlay)
  bodyRmulOuter: 1.55,     // vnější elipsa (halo)
  bodyTintAlpha: 0.15,     // průsvit overlaye těla
};

export const EYES = {
  spreadMul: 0.25,         // jak daleko od středu
  widthMul:  0.10,         // relativní šířka
  heightMul: 0.26,         // max relativní výška
  minOpen:   0.07,         // min otevření (pro clamp)
  yMul:      0.20          // posun od středu nahoru
};

export const MOOD_TINT = { // mapování nálady 0..1 na míchání teplé/chladné
  coldAt: 0.30,
  warmAt: 0.70
};
