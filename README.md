# Batolesvět – DECH demo (minimal web build)

Toto je minimální start projektu bez frameworků – běží čistě v prohlížeči jako ES moduly.

## Spuštění lokálně
1. Otevři složku v terminálu a spusť jednoduchý http server, např. Python:
   ```bash
   cd batolesvet
   python3 -m http.server 8000
   ```
2. Otevři `http://localhost:8000` v prohlížeči (na iPhone přes stejné Wi‑Fi zadej IP:8000).

## Nasazení na GitHub Pages
1. Vytvoř repo a nahraj celý obsah složky `batolesvet/` do kořene.
2. V GitHub → Settings → Pages nastav Branch: `main` a `/ (root)`.
3. Po chvilce poběží na GitHub Pages URL.

## Ovládání
- Klik/ťuknutí do plátna = vyšle impuls. „Pejsek“ se vydá k bodu.
- Klávesa `D` přepíná režim „Dech“ (vizualizace „vzduchu“).

## Struktura
- `src/` – jádro DECH: WebGL2 vykreslování, ECS, signální bus, jednoduchý DSL runtime.
- `worlds/start.sig` – ultra jednoduchá definice světa (zatím demo).


## Skrytý „Aether“ (AI-only kanál)
- Vrstvu glyph-field necháváme *neviditelnou* (pro hráče).
- AI komunikuje přes Aether (šifrovaný backchannel v rámci SignalBus).
- Watchdog dělá snímky stavu a při anomálii vrací poslední zdravý stav.


## Materiálizace z mikrosignálů („Iskra“)
- Každý impuls = 1 Iskra (počítadlo v HUD).
- Každých 6 Isker → vznikne malá „cihla“ v místě posledního impulsu.
- Cihly jsou viditelné objekty (zárodek „materiálu“).

## Rychlé zprovoznění na GitHub Pages (krok za krokem)
1. Vytvoř na GitHubu nové repo, název např. `batolesvet`.
2. Nahraj **všechny soubory** z této složky do kořene repa (včetně `.nojekyll`).
3. V repo → **Settings → Pages** nastav:
   - Source: `Deploy from a branch`
   - Branch: `main` a **`/ (root)`**
4. Po pár minutách poběží na adrese GitHub Pages. Odkaz najdeš přímo v sekci Pages.

### Alternativa přes git (pokud máš PC/notebook)
```bash
git init
git add .
git commit -m "DECH demo v2: Aether + Iskra materiál"
git branch -M main
git remote add origin https://github.com/<tvoje_jmeno>/batolesvet.git
git push -u origin main
```
