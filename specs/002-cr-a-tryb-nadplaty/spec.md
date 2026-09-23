# Specyfikacja funkcji: Tryb rozliczenia nadpłaty

**Gałąź funkcji**: `002-cr-a-tryb-nadplaty`

**Utworzono**: 2026-09-23

**Status**: Wersja robocza

**Wejście**: Opis użytkownika: "Dodaj nową funkcję CR-A „Wybór skutku nadpłaty: skrócenie okresu albo obniżenie raty”. Każda nadpłata ma tryb `skrocOkres` albo `obnizRate`; brak trybu oznacza `skrocOkres`; `obnizRate` zachowuje liczbę rat i przelicza ratę od salda po nadpłacie; `skrocOkres` zachowuje ratę i kończy harmonogram wcześniej; suma kapitału rat i nadpłat równa się kwocie kredytu; nadpłata jest księgowana po racie miesiąca, a odsetki są liczone od salda sprzed nadpłaty."

## Clarifications

### Session 2026-09-23

- Q: Jak system powinien obsłużyć dwie nadpłaty przypisane do tego samego miesiąca? → A: Dopuszczać wiele nadpłat i stosować je kolejno według kolejności na wejściu.

## Scenariusze użytkownika i testowanie *(wymagane)*

### Historia użytkownika 1 - Obniżenie raty po nadpłacie (Priorytet: P1)

Doradca wybiera dla nadpłaty skutek „obniż ratę”, aby klient zachował pierwotny termin zakończenia kredytu i otrzymał niższą ratę od kolejnego okresu.

**Dlaczego ten priorytet**: To jeden z dwóch głównych skutków nadpłaty wymaganych przez produkt i bezpośrednio odpowiada potrzebie porównania wariantów przez doradcę.

**Test niezależny**: Dla kredytu 300 000 zł, 240 rat, oprocentowania 6,66% rocznie i nadpłaty 30 000 zł po pierwszej racie można niezależnie sprawdzić saldo po nadpłacie, nową ratę oraz zachowanie liczby rat.

**Scenariusze akceptacji**:

1. **Given** kredyt 300 000 zł na 240 rat z oprocentowaniem 6,66% i nadpłatą 30 000 zł po pierwszej racie, **When** użytkownik wybiera `obnizRate`, **Then** saldo po pierwszej racie i nadpłacie wynosi 269 399,93 zł, a rata od drugiego okresu wynosi 2 038,11 zł.
2. **Given** nadpłata w trybie `obnizRate`, **When** harmonogram zostanie wyliczony, **Then** liczba zaplanowanych rat pozostaje równa pierwotnej liczbie rat.
3. **Given** nadpłata w trybie `obnizRate`, **When** suma zostanie sprawdzona, **Then** części kapitałowe rat razem z nadpłatami spłacają dokładnie kwotę kredytu.

---

### Historia użytkownika 2 - Skrócenie okresu po nadpłacie (Priorytet: P1)

Doradca wybiera dla nadpłaty skutek „skróć okres”, aby klient zachował ratę i zakończył spłatę wcześniej.

**Dlaczego ten priorytet**: To drugi główny wariant umowny i domyślny sposób zachowania kompatybilności z dotychczasowym kalkulatorem.

**Test niezależny**: Ten sam przypadek kredytu i nadpłaty pozwala sprawdzić niezmienioną ratę, skrócenie harmonogramu do 196 rat oraz ostatnią ratę wyrównującą.

**Scenariusze akceptacji**:

1. **Given** kredyt 300 000 zł na 240 rat z nadpłatą 30 000 zł po pierwszej racie, **When** użytkownik wybiera `skrocOkres`, **Then** rata pozostaje równa racie sprzed nadpłaty, a harmonogram zawiera 196 rat łącznie.
2. **Given** harmonogram w trybie `skrocOkres`, **When** użytkownik sprawdzi ostatnią ratę, **Then** ostatnia rata wyrównująca wynosi 2 200,53 zł, a saldo końcowe wynosi zero.
3. **Given** nadpłata bez podanego trybu, **When** system wylicza harmonogram, **Then** stosuje `skrocOkres` jako tryb domyślny.

---

### Historia użytkownika 3 - Porównanie skutków nadpłaty (Priorytet: P2)

Doradca wybiera tryb nadpłaty dla każdego wpisu, a ekran wyświetla harmonogram wynikający z wybranego trybu. Doradca może wykonać dwa wyliczenia tego samego kredytu, aby porównać niższą ratę z wcześniejszym końcem spłaty.

**Dlaczego ten priorytet**: Porównanie wariantów jest celem biznesowym CR-A, ale zależy od poprawnej obsługi obu niezależnych trybów.

**Test niezależny**: Dwa wyliczenia tego samego kredytu, nadpłaty i okresu można porównać po wysokości raty, liczbie rat, saldzie końcowym i sumie kapitału.

**Scenariusze akceptacji**:

1. **Given** te same parametry kredytu i nadpłaty, **When** doradca wykona osobne wyliczenia z wybranym trybem, **Then** wariant `obnizRate` ma pierwotną liczbę rat, a `skrocOkres` ma krótszy harmonogram.
2. **Given** oba warianty, **When** doradca porówna spłatę kapitału, **Then** w obu przypadkach suma części kapitałowych rat i kwot nadpłat równa się kwocie kredytu.

### Przypadki brzegowe

- Brak trybu przy nadpłacie oznacza `skrocOkres` i nie może zmienić dotychczasowego zachowania klienta.
- Nadpłata jest księgowana po naliczeniu i spłacie raty za wskazany miesiąc; odsetki tej raty liczone są od salda sprzed nadpłaty.
- Nadpłata równa lub większa od salda po racie nie może wygenerować ujemnego salda; harmonogram kończy się po wyzerowaniu salda.
- Nadpłata w pierwszym miesiącu i w ostatnim planowanym miesiącu nie może pozostawić niezamkniętego salda.
- Kilka nadpłat dla tego samego miesiąca jest dopuszczalne; system stosuje je kolejno po tej samej racie, zgodnie z kolejnością wejścia. Jeżeli tryby są różne, każda nadpłata natychmiast stosuje swój skutek do salda i kolejnych rat.
- Zmiana stopy wskaźnika w trakcie harmonogramu nie może zmienić kolejności: odsetki przed nadpłatą, nadpłata po racie.
- Kwoty niecałkowite w groszach oraz niepoprawne numery miesięcy są odrzucane.

## Wymagania *(wymagane)*

### Wymagania funkcjonalne

- **FR-001**: System MUST obsługiwać tryb nadpłaty `skrocOkres`.
- **FR-002**: System MUST obsługiwać tryb nadpłaty `obnizRate`.
- **FR-003**: System MUST traktować brak trybu jako `skrocOkres`.
- **FR-004**: System MUST zachować pierwotną liczbę rat w trybie `obnizRate`.
- **FR-005**: System MUST przeliczyć ratę od salda po nadpłacie dla pozostałych rat w trybie `obnizRate`.
- **FR-006**: System MUST zachować ratę w trybie `skrocOkres` i skrócić liczbę rat do czasu spłaty salda.
- **FR-007**: System MUST obliczać odsetki raty od salda sprzed zaksięgowania nadpłaty.
- **FR-008**: System MUST księgować nadpłatę po racie za wskazany miesiąc.
- **FR-009**: System MUST wyrównać ostatnią ratę tak, aby saldo końcowe wynosiło zero.
- **FR-010**: System MUST zapewnić, że suma części kapitałowych rat i kwot nadpłat równa się kwocie kredytu w obu trybach.
- **FR-011**: System MUST zachować istniejącą konwencję kwot w groszach i zaokrąglania.
- **FR-012**: System MUST przyjąć nadpłatę 30 000 zł po pierwszej racie dla przypadku kontrolnego CR-A i uzyskać saldo 269 399,93 zł.
- **FR-013**: System MUST uzyskać dla przypadku kontrolnego CR-A ratę 2 038,11 zł od drugiej raty w trybie `obnizRate`.
- **FR-014**: System MUST uzyskać dla przypadku kontrolnego CR-A 196 rat łącznie i ostatnią ratę 2 200,53 zł w trybie `skrocOkres`.
- **FR-015**: System MUST umożliwić doradcy wybranie skutku nadpłaty niezależnie dla każdej nadpłaty.

### Kluczowe encje

- **Nadpłata**: kwota częściowej wcześniejszej spłaty, miesiąc zaksięgowania i opcjonalny tryb skutku; nadpłaty z tym samym miesiącem zachowują kolejność wejścia.
- **Tryb nadpłaty**: `obnizRate` albo `skrocOkres`, przy czym brak wartości oznacza `skrocOkres`.
- **Rata**: okresowa spłata kapitału i odsetek, na którą wpływa saldo sprzed nadpłaty.
- **Harmonogram**: uporządkowana lista rat z saldem po racie i nadpłacie oraz podsumowaniem odsetek.

## Kryteria sukcesu *(wymagane)*

### Mierzalne wyniki

- **SC-001**: Dla przypadku kontrolnego CR-A system zwraca ratę 2 038,11 zł od drugiego okresu w trybie `obnizRate`.
- **SC-002**: Dla przypadku kontrolnego CR-A system zwraca 196 rat łącznie i ostatnią ratę 2 200,53 zł w trybie `skrocOkres`.
- **SC-003**: Dla obu trybów saldo końcowe wynosi 0 groszy, a kapitał spłacony ratami i nadpłatami równa się kwocie początkowej.
- **SC-004**: Istniejące wywołania bez trybu nadpłaty zachowują wynik trybu `skrocOkres`.
- **SC-005**: Doradca może wybrać tryb nadpłaty i otrzymać wynik bez ręcznego przeliczania parametrów.
- **SC-006**: Wszystkie dotychczasowe testy regresyjne aplikacji pozostają zielone.

## Założenia

- Wskaźnik WIBOR 3M 4,55% dla przypadku CR-A jest dostarczony przez istniejącą serię danych lub test używa jawnej serii stałej.
- Kwoty wewnętrzne są całkowitymi groszami, a kwota w opisie biznesowym jest prezentowana w złotych.
- Nadpłata jest stosowana po racie wskazanego miesiąca, a nie przed nią.
- Tryb `skrocOkres` pozostaje domyślny dla kompatybilności wstecznej.
- Zakres CR-A nie obejmuje zmian warunków umowy, opłat za wcześniejszą spłatę ani dziennych stawek POLSTR.
- Porównanie wariantów może być wykonane przez dwa osobne wyliczenia tego samego kredytu.
