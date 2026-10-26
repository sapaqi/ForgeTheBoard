# ForgeTheBoard

Responsywna strona projektu ForgeTheBoard, po polsku. Czysty HTML, CSS i JavaScript, bez frameworka i bez obowiązkowego procesu budowania. Wszystkie obrazy, fonty oraz biblioteki są lokalne.

## Uruchomienie

Potrzebny jest Node.js 22 lub nowszy:

```sh
node server.mjs
```

Otwórz http://127.0.0.1:4173/. Instalacja zależności nie jest potrzebna do uruchomienia strony. Używaj serwera HTTP — moduły Three.js nie są przeznaczone do otwierania przez `file://`.

## GitHub

Rozpakuj archiwum i dodaj **zawartość folderu projektu** do głównego katalogu repozytorium. Zachowaj pliki `.gitignore`, `.gitattributes` oraz `.nojekyll`.

Strona jest statyczna i może być udostępniana również pod ścieżką repozytorium, np. `/forgetheboard/`. Serwer `server.mjs` służy do lokalnego podglądu; hosting statyczny obsługuje bezpośrednio `index.html` i katalog `assets/`. Nie wymaga backendu ani sekretów.

## Animacje i dostępność

- Motion 14.6.0: jednorazowe wejścia większych bloków, 720–800 ms, odstępy 120 ms.
- Przesunięcia: 52 px na komputerze i 24 px na telefonie.
- Three.js 0.186.1: autorski shader maluje mapę od szkicu do pełnego koloru przez 4 s (3,2 s na telefonie), bez początkowej pauzy.
- Poprawiona obsługa ekranów 4K; tekstura jest niezależna od rozmiaru obrazu w CSS, a bufor GPU ma limit około 2,07 mln pikseli.
- `prefers-reduced-motion` wyłącza animacje. Podgląd: `?motion=reduce`.
- Bez JavaScriptu treść pozostaje widoczna. Test: `assets/qa/no-javascript.html`.
- Używane są wyłącznie darmowe API Motion: `animate`, `inView`, `stagger`.

## Kontrola i aktualizacja zależności

```sh
node --run check
node scripts/check-package.mjs
```

Biblioteki wykonawcze są już zapisane w `assets/vendor/`. Jeśli je aktualizujesz, zainstaluj zależności za pomocą pnpm, a potem odtwórz pliki vendor:

```sh
pnpm install --frozen-lockfile
node scripts/sync-animation-vendor.mjs
```

`pnpm-lock.yaml` utrwala wersje. Licencje bibliotek i fontów oraz pochodzenie grafik opisano w [ASSETS.md](ASSETS.md).

## Struktura

- `index.html`, `styles.css`, `app.js` — strona, wygląd i interakcje.
- `assets/js/` — animacje Motion oraz shader Three.js.
- `assets/vendor/` — biblioteki i ich licencje MIT.
- `assets/fonts/`, `assets/illustrations/` — lokalne fonty i ilustracje.
- `compare.html` — pomocnicze porównanie wariantów hero.
- `server.mjs` — lokalny serwer HTTP.

ForgeTheBoard jest projektem w budowie. Przycisk „Wejdź do kuźni” pokazuje informację o tym etapie. Docelowy adres rejestracji można podłączyć przez `REGISTRATION_URL` w `app.js`.
