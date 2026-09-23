# Feature Specification: Harmonogram POLSTR

**Feature Branch**: `001-harmonogram-polstr`

**Created**: 2026-09-23

**Status**: Draft

**Input**: User description: "Od września 2026 pierwsze banki w Polsce oferują kredyty hipoteczne ze zmiennym oprocentowaniem opartym na POLSTR 1M zamiast WIBOR. Zgodnie z mapą drogową KNF w latach 2026–2027 POLSTR ma być stosowany coraz szerzej, a w 2028 istniejące umowy na WIBOR przejdą jednorazową konwersję. Potrzebujemy kalkulatora harmonogramu spłat, który obsłuży oba wskaźniki, raty równe i malejące oraz nadpłaty. Dane przykładowe wskaźników w załączeniu.

Załącznik: dane/polstr-1m.json, dane/wibor-3m.json."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Kalkulacja rat równych przy stałej stopie (Priority: P1)

Doradca bankowy lub klient wprowadza kwotę kredytu, liczbę rat, datę pierwszej raty, marżę, wskaźnik i typ rat; system wylicza harmonogram i zwraca ratę oraz sumę odsetek. Główną wartością jest szybka, wiarygodna odpowiedź z liczbą kontrolną dla standardowego kredytu.

**Why this priority**: To jest podstawowa ścieżka użytkownika i kryterium akceptacji projektu. Bez poprawnego wyliczenia rat równych MVP nie dostarcza wartości biznesowej.

**Independent Test**: Można przetestować samodzielnie na kwocie 400 000 zł, 300 rat, POLSTR 1M 3,55 % + marża 2,11 pp = 5,66 % rocznie, przy założeniu stałej stopy. Oczekiwany wynik to rata równa 2 494,72 zł z tolerancją ±0,05 zł, ostatnia rata wyrównująca 2 492,53 zł.

**Acceptance Scenarios**:

1. **Given** kwota kredytu 400 000 zł, 300 rat równych i stała stopa 5,66 % rocznie, **When** użytkownik uruchamia kalkulację, **Then** system zwraca pierwszą ratę 2 494,72 zł i ostatnią ratę wyrównującą 2 492,53 zł.
2. **Given** to samo wejście i konwencja obliczeń z zaokrągleniem do grosza, **When** system sumuje części kapitałowe, **Then** suma jest równa całej kwocie kredytu po wyrównaniu końcowym.

---

### User Story 2 - Obsługa rat malejących i zmiennych wskaźników z nadpłatami (Priority: P2)

Użytkownik może wybrać typ rat malejących, wskaźnik POLSTR 1M lub WIBOR 3M oraz podać listę nadpłat w trybie obniż raty albo skrócenia okresu. System ma uwzględnić zmianę wskaźnika w trakcie spłaty i odnieść nadpłaty do harmonogramu.

**Why this priority**: To rozszerza funkcjonalność z podstawowej spłaty do scenariuszy praktyczne, które są typowe dla kredytu hipotecznego i wymagają czytelnego modelu danych.

**Independent Test**: Można zweryfikować osobno na wejściu z jednym wskaźnikiem i jednym nadpłaceniem, porównując zmiany w saldzie i wysokości rat po przekroczeniu kolejnego wpisu wskaźnika.

**Acceptance Scenarios**:

1. **Given** kredyt z typem rat malejących i stałym wskaznikiem, **When** użytkownik wykonuje kalkulację, **Then** część kapitałowa jest stała, a odsetki maleją z każdym okresem.
2. **Given** w serii wskaźnika pojawia się kolejny wpis w trakcie okresu kredytowania, **When** użytkownik uruchamia obliczenie, **Then** system stosuje nową wartość stopy od kolejnego okresu i odnotowuje odpowiednie zmiany w tabeli rat.
3. **Given** wprowadzone są nadpłaty w trybie obniż raty, **When** użytkownik wylicza harmonogram, **Then** rata zostaje obniżona przy zachowaniu zgodności z regułą wyrównania ostatniej raty.
4. **Given** wprowadzone są nadpłaty w trybie skrócenia okresu, **When** użytkownik wylicza harmonogram, **Then** liczba rat lub termin końcowy są dostosowywane zgodnie z parametrem przedłużania/skrótów i bez naruszenia salda końcowego.

---

### User Story 3 - Ekran internetowy i podłączenie do API (Priority: P3)

Użytkownik wypełnia formularz na stronie, klika „Policz”, a aplikacja pobiera dane z endpointu GET /api/harmonogram z parametrami w query string, wyświetla ratę pierwszą i ostatnią, sumę odsetek oraz tabelę rat, a następnie umożliwia eksport CSV po stronie przeglądarki. To jest oddzielna ostatnia historia użytkownika.

**Why this priority**: Ekran dostarcza wartość biznesową i użytkową wizualnie. Jest to ostatni element MVP, wydzielony od obliczeń domenowych oraz API.

**Independent Test**: Można sprawdzić przez uruchomienie strony, wpisanie danych z przykładowego kredytu i potwierdzenie, że dane z API są wyświetlane i eksport CSV generuje poprawny plik.

**Acceptance Scenarios**:

1. **Given** użytkownik wypełnił formularz z parametrami kredytu, **When** klika „Policz”, **Then** komponent pobiera dane z GET /api/harmonogram i wyświetla wynik w formie tabeli rat.
2. **Given** wynik został wyliczony, **When** użytkownik klika „Eksport CSV”, **Then** przeglądarka pobiera plik CSV z danymi harmonogramu.
3. **Given** gotowy komponent React z Tailwind, **When** jest wklejony jako app/page.tsx z dyrektywą 'use client' w pierwszej linii, **Then** zawartość jest renderowana bez dodatków UI i pozostaje zgodna z stylem projektu.

---

### Edge Cases

- Co dzieje się, gdy data pierwszej raty jest poza zakresem dostępnych danych wskaźnika lub nie jest zgodna z formatem YYYY-MM-DD?
- Jak system reaguje na brak wpisów dla wskazanego wskaźnika w danym okresie?
- Co dzieje się przy kredycie o dużej liczbie rat lub przy nadpłacie przekraczającej saldo?
- Jak system zachowuje się, gdy użytkownik wybierze typ rat równych i nadpłatę w trybie skrócenia okresu?
- Jak realizowane jest wyrównanie ostatniej raty, gdy zaokrąglenia na poziomie poszczególnych rat powodują niedopłatę lub nadpłatę?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST umożliwiać wprowadzenie kwoty kredytu, liczby rat, daty pierwszej raty, marży banku, typu rat oraz wskaźnika POLSTR 1M lub WIBOR 3M.
- **FR-002**: System MUST przyjmować listę nadpłat z pola miesiąca, kwoty i trybu: obniż ratę albo skróć okres.
- **FR-003**: System MUST wyliczać harmonogram spłaty w domenie `src/domena/` bez pośredniego I/O i bez renderowania w React.
- **FR-004**: System MUST udostępniać endpoint GET /api/harmonogram z parametrami w query string i zwracać JSON z tabelą rat oraz sumą odsetek.
- **FR-005**: System MUST stosować oprocentowanie okresu jako wartość wskaźnika + marża, zgodnie z regułą biznesową.
- **FR-006**: System MUST uwzględniać zmiany wskaźnika w trakcie spłaty: POLSTR 1M zmienia się co miesiąc, WIBOR 3M co kwartał.
- **FR-007**: System MUST stosować ostatnią znaną wartość wskaźnika po ostatnim wpisie serii, jeśli brak jest dalszych danych.
- **FR-008**: System MUST zaokrąglać do grosza i wyrównywać ostatnią ratę tak, aby suma części kapitałowych równała się kwocie kredytu.
- **FR-009**: System MUST wyliczać odsetki proste w okresie, bez kapitalizacji w ramach miesiąca.
- **FR-010**: System MUST wspierać raty równe i malejące.
- **FR-011**: System MUST obsługiwać nadpłaty w trybie obniż raty oraz skrócenia okresu.
- **FR-012**: System MUST zwracać tabelę rat z numerem, datą, częścią kapitałową, odsetkami, ratą i saldem po spłacie.
- **FR-013**: System MUST umożliwiać eksport wyników do CSV po stronie przeglądarki.
- **FR-014**: System MUST wyświetlać w interfejsie ratę pierwszą i ostatnią oraz sumę odsetek za cały okres.
- **FR-015**: System MUST zapewniać, że kwoty są przechowywane w groszach jako liczby całkowite albo w jednym miejscu zaokrąglania.
- **FR-016**: System MUST odzwierciedlać liczbę kontrolną z BRIEF.md jako kryterium akceptacji: 400 000 zł, 300 rat równych, POLSTR 1M 3,55 % + marża 2,11 pp = 5,66 % rocznie, rata 2 494,72 zł ±0,05 zł.
- **FR-017**: System MUST mieć ekran internetowy jako osobną, ostatnią historię użytkownika, z gotowym komponentem React w jednym pliku `app/page.tsx` z dyrektywą `'use client'` na pierwszej linii.
- **FR-018**: System MUST pobierać dane z `fetch('/api/harmonogram?...')` z parametrami formularza w query string, a nie z własnej logiki obliczeniowej w komponencie.
- **FR-019**: System MUST dostarczać wymagany zestaw MVP zgodnie z sekcją Wydanie, czyli wersja produkcyjna wdrażana na Vercel z GitHuba i adres podglądu dla każdego PR.

### Key Entities *(include if feature involves data)*

- **Kredyt**: kwota główna, liczba rat, data pierwszej raty, marża, wskaźnik, typ rat, lista nadpłat.
- **Wskaźnik**: seria danych z katalogu `dane/`, gdzie każdy wpis ma datę rozpoczęcia obowiązywania i wartość w ułamku rocznym.
- **Okres odsetkowy**: jednostka obliczeniowa dla raty, zgodna z częstotliwością wskaźnika i datą rozliczenia.
- **Rata**: numer raty, data, część kapitałowa, odsetki, łączna rata, saldo po spłacie.
- **Nadpłata**: miesiąc, kwota oraz tryb działania: obniż ratę albo skróć okres.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Użytkownik może policzyć harmonogram kredytu w mniej niż 2 minuty od wypełnienia formularza.
- **SC-002**: Dla przypadku kontrolnego z BRIEF system zwraca ratę równą 2 494,72 zł z tolerancją ±0,05 zł.
- **SC-003**: Endpoint /api/harmonogram zwraca poprawny JSON z pełną tabelą rat i sumą odsetek dla co najmniej jednego scenariusza testowego.
- **SC-004**: Ekran www wyświetla formularz, wynik, tabelę rat i eksport CSV bez błędów w przeglądarce.
- **SC-005**: Produkcyjny build przechodzi lokalnie w `npm run build` i w GitHub Actions dla branchy PR oraz main.
- **SC-006**: Każda zmiana logiki obliczeniowej ma test jednostkowy w `tests/` i jest zgodna z regułami TDD.

## Assumptions

- Użytkownicy pracują w środowisku webowym z przeglądarką i nie wymagają obsługi mobilnej w MVP.
- Wartości wskaźników są dostarczane jako dane wejściowe z istniejących plików JSON w katalogu `dane/`.
- API i ekran mają być odseparowane od logiki finansowej, która pozostaje w domenie.
- Wersja MVP nie obejmuje składania dziennych stawek POLSTR wstecz za okres odsetkowy ani innych funkcji z listy gwiazdek.
- Produkcja opiera się na Vercel i GitHub, zgodnie z wymaganiami projektu.
