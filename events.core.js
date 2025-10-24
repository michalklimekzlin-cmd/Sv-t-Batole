// Globální brána událostí + broadcast (lze poslouchat přes addEventListener)
(function(){
  const emit = (type, detail)=>window.dispatchEvent(new CustomEvent(type,{detail}));
  window.EVENTS = {
    voice:  (msg)=>{ console.log('🎙️ Voice',msg);  emit('evt:voice',  msg); },
    mood:   (m)=>{   console.log('💫 Mood',m);     emit('evt:mood',   m);   },
    vision: (v)=>{   console.log('👁️ Vision',v);  emit('evt:vision', v);   },
    ground: ()=>{    console.log('🌍 Ground');     emit('evt:ground', {});  },
  };
})();