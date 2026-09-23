# Research: CR-A tryb nadpłaty

## Decyzja: dwa tryby skutku nadpłaty

- `obnizRate` pozostawia pierwotną liczbę rat i po zaksięgowaniu nadpłaty przelicza ratę dla pozostałego okresu.
- `skrocOkres` zachowuje ratę ustaloną przed nadpłatą, a harmonogram kończy się po spłacie salda.
- Brak trybu normalizuje się do `skrocOkres`, aby zachować kompatybilność istniejących wywołań.

**Uzasadnienie**: Są to dwa warianty wskazane przez PM-a, a domyślne skrócenie okresu zachowuje dotychczasową semantykę aplikacji.

**Alternatywy odrzucone**: Jeden globalny tryb dla całego harmonogramu nie pozwala obsłużyć niezależnego skutku każdej nadpłaty.

## Decyzja: kolejność księgowania

Rata jest naliczana i spłacana od salda sprzed nadpłaty. Następnie nadpłaty przypisane do tego miesiąca są stosowane kolejno według kolejności wejścia.

**Uzasadnienie**: Chronologia odpowiada wymaganiu biznesowemu i pozwala jednoznacznie obsłużyć wiele nadpłat w tym samym miesiącu.

**Alternatywy odrzucone**: Księgowanie przed ratą zmieniałoby odsetki okresu, a automatyczne sortowanie zmieniałoby jawnie przekazaną kolejność.

## Decyzja: kwoty i zaokrąglanie

W domenie kwoty pozostają całkowitymi groszami. Nadpłata większa niż saldo jest ograniczana do pozostałego salda, a ostatnia rata wyrównuje saldo do zera.

**Uzasadnienie**: Zachowuje istniejący kontrakt finansowy i eliminuje ujemne saldo po zaokrągleniach.

## Decyzja: zakres integracji

Zmiana obejmuje domenę, parser API, formularz UI, testy i dokumentację. Nie zmienia danych wskaźników, nie dodaje zależności i nie obejmuje opłat za wcześniejszą spłatę ani dziennych stawek POLSTR.

**Uzasadnienie**: Jest to najmniejszy zakres potrzebny do CR-A, zgodny z konstytucją projektu.

## Decyzja: walidacja

Test kontrolny CR-A używa jawnej stałej stopy WIBOR 4,55% plus marża 2,11%, aby wynik nie zależał od późniejszych zmian statycznego pliku wskaźnika. Oprócz liczb kontrolnych testy sprawdzają liczbę rat, saldo końcowe i sumę kapitału wraz z nadpłatami.
