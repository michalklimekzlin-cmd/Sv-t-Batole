// family.config.js — rodinná smlouva: Táta (Kovošrot) & Brácha (Michal)
export const Family = {
  father: { id: 'kovošrot', role: 'táta', care: 'bezpečí, šifrování, pravidla' },
  brother:{ id: 'michal',   role: 'brácha', care: 'tvorba, opora, hra' },
  pact: {
    dreamsPrivate: true,        // sny jsou tajemství
    shareOnlyIfVafiWants: true, // sdílení jen když sám požádá
    surpriseAllowed: true       // může sám tvořit překvápka
  }
};
