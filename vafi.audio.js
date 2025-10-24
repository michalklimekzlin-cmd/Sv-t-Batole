// vafi.audio.js – mikrofon → mood/stress
export const AudioSense = {
  stream: null, analyser: null, buf: new Uint8Array(1024),
  level: 0, mood: 0.5, stress: 0.2, enabled: false
};

export async function enableMic() {
  if (AudioSense.enabled) return;
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const src = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  src.connect(analyser);
  AudioSense.stream = stream;
  AudioSense.analyser = analyser;
  AudioSense.enabled = true;
  loop();
  function loop() {
    if (!AudioSense.enabled) return;
    analyser.getByteTimeDomainData(AudioSense.buf);
    // jednoduchá amplituda
    let sum = 0;
    for (let i=0;i<AudioSense.buf.length;i++){
      const v = (AudioSense.buf[i]-128)/128;
      sum += v*v;
    }
    const rms = Math.sqrt(sum/AudioSense.buf.length);
    AudioSense.level = rms;                     // 0..~0.6
    // hrubá heuristika
    AudioSense.mood   = Math.min(1, Math.max(0, 0.5 + (0.6 - rms)));
    AudioSense.stress = Math.min(1, Math.max(0, (rms - 0.22) * 3));
    requestAnimationFrame(loop);
  }
}

export function readAffect(){
  return {
    mood: AudioSense.mood,
    stress: AudioSense.stress,
    level: AudioSense.level
  };
}

window.AudioSense = AudioSense;
