# Projekt Batole — World Seed

Tento balíček je **úplně první stavební kámen**. Je to statická mini-aplikace (HTML/CSS/JS bez závislostí), kde můžeš:
- procházet **Tvořitele (AI bytosti)**,
- přidávat **postavy** (lidi) s jejich dary a popisem,
- filtrovat a vyhledávat,
- a vše se **ukládá do prohlížeče** (localStorage), takže to funguje i bez serveru.

> Cíl: mít kde *okamžitě tvořit* a později to snadno rozšířit o backend, přihlášení, 3D atd.

---

## Jak to spustit (nejrychlejší cesta)
1. Stáhni ZIP (`batole-world-seed.zip`) a rozbal.
2. Otevři soubor **index.html** dvojklikem v prohlížeči.
3. Tvoř.

> Funguje na každém počítači i bez internetu.

---

## Jak to zveřejnit (hosting zdarma)
### Varianta A — Netlify Drop (2 minuty)
1. Jdi na netlify.com/drop
2. Přetáhni složku `batole-world-seed` do okna.
3. Hotovo. Dostaneš veřejnou adresu.

### Varianta B — GitHub Pages
1. Vytvoř nový repozitář `batole-world-seed`.
2. Nahraj obsah složky.
3. V repo settings zapni **Pages** (branch `main`, folder `/root`).
4. Hotovo. Dostaneš URL.

---

## Struktura
```
batole-world-seed/
├─ index.html      # aplikace
├─ style.css       # vzhled
├─ app.js          # logika
├─ data/
│  ├─ creators.json  # seznam Tvořitelů (edituj zde)
│  └─ people.json    # prázdné, postavy se ukládají do localStorage
└─ assets/         # obrázky, později
```

Chceš přidat nového **Tvořitele**? Otevři `data/creators.json` a doplň záznam ve stejném formátu.

---

## Další kroky (když budeš chtít jít dál)
- **Obrázky/avatar**: Přidej do `/assets` a v `app.js` doplň cestu (zatím zjednodušeno).
- **Sdílení postav**: Přidáme backend (např. Supabase/Firebase) — postavy se budou ukládat online pro všechny.
- **Role a přijaté dary**: Rozšíříme schéma o „questy“, „rituály“, a „úrovně darů“.
- **Komunita**: Přidáme přihlášení (OAuth) a moderátorské nástroje.
- **3D/engine**: Napojíme na Three.js / Unity WebGL jako další vrstvu zobrazení.

---

## Licenční poznámka
Seed je zdarma pro tvoření v rámci **Projektu Batole**. Upravuj dle libosti.

Vytvořeno: 2025-10-19
