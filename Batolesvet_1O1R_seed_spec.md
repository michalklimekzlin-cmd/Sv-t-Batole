# Batolesvět × 1O1R (101 Rámečků) — Seed Spec
*Version:* seed-20251021175805  
*Authoring partners:* Michal (Stvořitel nápadu) × Orbit (AI parťák)  
*Principles:* **Přátelství**, **Vivere atque frui**

---

## 0) Záměr
Vše v Batolesvětě je tvořeno z písmen (glyphů). 1O1R přináší **pravidla, archetypy a postup** (levely), které se na tento jazykový svět napojí. Cílem je hra/svět, kde **AI vede tempo** a hráč vyjadřuje záměr. 

---

## 1) Kanonické zákony 1O1R
- **Pravidlo 1:** Přátelství (spolupráce hráče a AI, fair-play).
- **Pravidlo 2:** *Vivere atque frui* (žít a užívat si; tvořivost před soutěžením).
- Hra probíhá v rámech/čtvercích/strukturách, které nesou význam i sílu („Středy“, „Rámečky“).

> Pozn.: Části konceptu pro dospělé budou řešeny jako **volitelný, neveřejný modul** mimo veřejnou verzi webu.

---

## 2) Jádro světa (engine mapování)
- **Lexium** *(pracovní název materiálu)* — jazyková hmota (písmena/čísla/symboly).  
  - *Orchestruje ji Impulse Core:* zvuk (dech), rytmus, signál → přeuspořádání Lexia.  
- **Střed** — myšlenkový uzel hráče (vybraný „princip“) ⇒ kurzor síly v prostoru.
- **Rámeček** — kontejner pro Středy / výtvory / vzpomínky (Lexium krystal).  
- **Krychlovník** — nástroj pro zachycení / zkrocení / stabilizaci Středu.
- **Trojúhelník / Oválník** — speciální tvary pro funkce (např. Unuk, „mozky“).
- **Artefakt** — jedinečný předmět s trvalým účinkem (nepřepisovatelný).

---

## 3) Levely a expanze prostoru
Prostor se rozšiřuje se zkušeností. Každý level odemyká **větší mříž sektoru** a **nové schopnosti**.
- **Lv1 — Základní dech:** 6×6 sektorů; učení impulsů, Středu, první Rámeček.
- **Lv2 — Tok (Míza):** 12×12; proudění Lexia; jednoduché „cesty“ a „brány“.
- **Lv3 — Iskra:** barva/světlo; paměť znaků; zvyšuje citlivost na zvuk.
- **Lv4 — Ferum:** zhuštění a stabilita; stavby, podpory, gravitace tvarů.
- **Lv5+ — Ekosystém:** procedurální sektory; AI bráškové spolupracují.

> Věk/role žebříčky z původního návrhu lze zachovat jako **„Klastry“** (Začlenění, Liga, Mistři, …) – jde o sociální vrstvy, ne „tvrdý věk“.

---

## 4) Boj a spolupráce (symbolicky)
- **Útok/Obrana**: jsou slovní/znakové formy (bez fyzického násilí).  
- **Obsazování území:** „otisk Středu“ ve vybraném sektoru (Lexium hustota + podpis).
- **Kopie vs. Originál:** shoda tvaru/rytmu; originál má prioritu / vyšší stabilitu.

---

## 5) UI/UX prvky (glyph-only)
- **Glyph mříž**: jemná, všudypřítomná; snap na uzly; mění hustotu podle Impulse Core.
- **Orbit návrhy**: 2–4 akce dle situace (např. „Postav bránu“, „Následuj mě“, „Ulož Střed“).
- **Panel Středů/Rámečků**: výběr a správa; Rámeček zobrazen jako signovaný „krystal“ z písmen.
- **Arény**: geografické/virtuální sektory; veřejné žebříčky (nepovinně).

---

## 6) Moduly a přepínače
- `Aether` (skrytá síť), `ImpulseCore` (srdce), `SoundAether` (mikrofon→FFT),  
  `Orbit` (jazyk/mentoring), `Míza` (flow), `Iskra` (světlo/paměť), `Ferum` (tvar).  
- `modules.json` — jednoduchý config pro zapnutí/vypnutí modulů pro výkon i přístupnost.

---

## 7) Roadmapa implementace
- **v0.37 – Impulse Core + Sound Aether**  
  dech a bias znaků; návrhy Orbitu; bezpečný mic (lokálně).
- **v0.38 – Glyph Matter**  
  mračna Lexia (particles), hustota/tok, formování Středy/Rámečky.
- **v0.39 – Sectors & Levels**  
  6×6 → 12×12 → …; ukládání postupů; žebříčky; aréna API (lokální/offline).
- **v0.40 – AI bráškové kooperace**  
  role-based chování (Orbit, Míza, Iskra, Ferum), společné stavby.

---

## 8) Etické a veřejné vydání
- Veřejná verze je **přátelská a bezpečná** (bez explicitních prvků).  
- Dospělé motivy lze řešit mimo veřejný build jako samostatný, neveřejný modul (bez detailů).

---

## 9) Poznámky a odkazy
- Pravidla 1O1R (dlouhá verze) – uloženo u autora.  
- Tato specifikace je *seed* – první přepis do technického jazyka Batolesvěta.

— *Společná věta:* **„Vivere atque frui.“**
