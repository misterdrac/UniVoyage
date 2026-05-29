# Objektno orijentirane metrike

## Analizirani dio projekta

Za analizu je odabran backend modul:

```text
backend/src/main/java/com/univoyage/trip
```

Ovaj dio projekta odabran je zato što predstavlja jednu od glavnih domena aplikacije. Modul `trip` sadrži logiku za:

- kreiranje i upravljanje putovanjima
- budžet putovanja
- itinerary putovanja
- smještaj
- vremensku prognozu
- zanimljiva mjesta
- ocjenjivanje putovanja
- valute
- heatmap podatke

Modul je dobar primjer za analizu jer sadrži više tipova klasa:

- controllere
- servise
- repozitorije
- DTO klase
- JPA entitete
- security/rate limiter klase
- pomoćne utility klase

## Izvor pragova za usporedbu

Za usporedbu su korištene uobičajene vrijednosti iz literature i članaka o pristupu code metrics, uključujući primjer iz članka:

- https://www.c-sharpcorner.com/article/measure-your-code-using-code-metrics/

Članak navodi metrike kao što su:

- Maintainability Index
- Cyclomatic Complexity
- Depth of Inheritance
- Class Coupling
- Lines of Code

Prema tom izvoru, ciklomatska kompleksnost od 1 do 10 smatra se niskorizičnom, od 11 do 20 umjereno rizičnom, od 21 do 50 rizičnom, a preko 50 vrlo rizičnom. Za class coupling vrijednosti do 9 smatraju se dobrima, vrijednosti od 10 do 30 još prihvatljivima, a veće vrijednosti problematičnima. Za dubinu nasljeđivanja vrijednosti od 1 do 2 smatraju se dobrima, od 3 do 4 još prihvatljivima, a više od 4 kritičnima.

Napomena: navedeni pragovi potječu iz .NET/Visual Studio konteksta, ali su korisni i kao orijentacijske vrijednosti za Java/Spring projekt.

## Metodologija

Metrike su izračunate statičkom analizom Java datoteka u modulu `trip`.

Analizirano je:

- broj Java datoteka
- broj klasa/interfejsa/enuma
- broj linija koda bez praznih linija i komentara
- broj metoda po klasi
- procijenjena ciklomatska kompleksnost po metodi
- WMC, odnosno Weighted Methods per Class
- CBO, odnosno Coupling Between Objects
- DIT, odnosno Depth of Inheritance Tree
- NOC, odnosno Number of Children

Metrike su procijenjene iz izvornog koda, bez specijaliziranog alata poput SonarQubea. Zato ih treba promatrati kao dovoljno dobru indikaciju stanja, a ne kao apsolutno precizno mjerenje.

## Objašnjenje metrika

### LOC - Lines of Code

LOC označava broj linija koda. U ovoj analizi nisu brojane prazne linije i komentari.

Velik broj linija u jednoj klasi može upućivati na:

- previše odgovornosti u jednoj klasi
- potrebu za podjelom na manje klase
- teže testiranje i održavanje

S druge strane, velik LOC nije uvijek problem ako je klasa uglavnom deklarativna ili ako sadrži jednostavno mapiranje.

### NOM - Number of Methods

NOM označava broj metoda u klasi.

Veći broj metoda može značiti da klasa ima više odgovornosti. Kod servisnih klasa to nije uvijek problem, ali ako metoda ima mnogo i nisu tematski povezane, to može biti znak za refaktoriranje.

### Cyclomatic Complexity

Ciklomatska kompleksnost mjeri broj mogućih putanja kroz kod. Povećava se s grananjima kao što su:

- `if`
- `else if`
- `for`
- `while`
- `case`
- `catch`
- logički operatori `&&` i `||`

Niska kompleksnost znači da je metoda lakša za razumijevanje i testiranje.

### WMC - Weighted Methods per Class

WMC predstavlja zbroj kompleksnosti svih metoda u klasi.

Ako klasa ima visok WMC, to znači da ukupno sadrži dosta logike i grananja. Takva klasa može biti kandidat za refaktoriranje ili izdvajanje dijela logike u posebne klase.

### CBO - Coupling Between Objects

CBO mjeri koliko je klasa povezana s drugim klasama. U ovoj analizi procijenjen je prema broju importiranih tipova.

Visok CBO može značiti da klasa ovisi o mnogo drugih dijelova sustava. To otežava testiranje i povećava rizik da promjena u jednoj klasi utječe na drugu.

### DIT - Depth of Inheritance Tree

DIT mjeri dubinu nasljeđivanja.

Veća dubina nasljeđivanja može otežati razumijevanje ponašanja klase jer se dio logike nalazi u nadklasama.

### NOC - Number of Children

NOC mjeri koliko klasa nasljeđuje neku klasu.

Visok NOC znači da promjena roditeljske klase može utjecati na mnogo djece. U ovom projektu ta metrika nije problematična jer se koristi malo nasljeđivanja.

## Sažetak rezultata

Analizirani modul:

```text
backend/src/main/java/com/univoyage/trip
```

Ukupni rezultati:

| Metrika | Vrijednost |
|---|---:|
| Broj Java datoteka | 34 |
| Broj analiziranih klasa/interfejsa/enuma | 34 |
| Ukupan LOC | 1564 |
| Prosječan LOC po klasi | 46.0 |
| Prosječan broj metoda po klasi | 2.0 |
| Prosječan WMC po klasi | 10.7 |
| Prosječan CBO po klasi | 6.5 |

Opći rezultat je dobar. Modul nema velik prosječan broj metoda po klasi, prosječna veličina klase je razumna, a prosječna povezanost je u prihvatljivom rasponu.

## Klase s najviše linija koda

| Klasa | LOC | Broj metoda | WMC | Max CC | CBO |
|---|---:|---:|---:|---:|---:|
| `PlaceCategoryMapper` | 231 | 8 | 190 | 44 | 1 |
| `GeoapifyService` | 212 | 7 | 43 | 9 | 12 |
| `WeatherService` | 149 | 7 | 38 | 8 | 15 |
| `TripController` | 143 | 12 | 19 | 4 | 25 |
| `TripService` | 125 | 13 | 16 | 2 | 23 |
| `TripTravellerRatingService` | 108 | 7 | 19 | 6 | 19 |
| `TripCurrencyService` | 71 | 1 | 10 | 10 | 12 |

### Zaključak za LOC

Većina klasa je male ili srednje veličine. Najveća klasa je `PlaceCategoryMapper`, ali ona uglavnom sadrži pravila mapiranja kategorija mjesta. To objašnjava velik broj linija.

`GeoapifyService` i `WeatherService` također su veće klase jer komuniciraju s vanjskim API-jima i sadrže ugniježđene DTO klase za odgovore tih API-ja.

Kod `TripController` i `TripService` broj linija je prihvatljiv jer se radi o centralnim klasama za modul putovanja.

## Klase s najvećom kompleksnošću

| Klasa | LOC | Broj metoda | WMC | Najveća CC metode | CBO |
|---|---:|---:|---:|---:|---:|
| `PlaceCategoryMapper` | 231 | 8 | 190 | 44 | 1 |
| `GeoapifyService` | 212 | 7 | 43 | 9 | 12 |
| `WeatherService` | 149 | 7 | 38 | 8 | 15 |
| `TripController` | 143 | 12 | 19 | 4 | 25 |
| `TripTravellerRatingService` | 108 | 7 | 19 | 6 | 19 |
| `TripService` | 125 | 13 | 16 | 2 | 23 |
| `TripCurrencyService` | 71 | 1 | 10 | 10 | 12 |

### Usporedba s uvriježenim vrijednostima

Prema uobičajenim pragovima za ciklomatsku kompleksnost:

| Raspon CC | Tumačenje |
|---|---|
| 1-10 | jednostavno, niskorizično |
| 11-20 | umjeren rizik |
| 21-50 | rizično, kompleksna logika |
| preko 50 | vrlo visok rizik |

Većina metoda u modulu nalazi se unutar prihvatljivog raspona. Posebno dobro izgledaju `TripService` i `TripController`, jer im je najveća kompleksnost pojedine metode relativno niska.

Najveće odstupanje je `PlaceCategoryMapper`, gdje najkompleksnija metoda ima procijenjenu CC vrijednost 44. To spada u rizični raspon. Međutim, treba napomenuti da se ovdje ne radi o poslovnoj transakcijskoj logici, nego o nizu pravila za prepoznavanje kategorije mjesta.

## Klase s najvećom povezanošću

| Klasa | CBO | Tumačenje |
|---|---:|---|
| `TripController` | 25 | prihvatljivo, ali visoko |
| `TripService` | 23 | prihvatljivo, ali visoko |
| `TripTravellerRatingService` | 19 | prihvatljivo |
| `WeatherService` | 15 | prihvatljivo |
| `PlacesController` | 12 | prihvatljivo |
| `GeoapifyService` | 12 | prihvatljivo |
| `TripCurrencyService` | 12 | prihvatljivo |

### Usporedba s uvriježenim vrijednostima

Prema pragovima iz code metrics pristupa:

| CBO raspon | Tumačenje |
|---|---|
| 0-9 | dobro |
| 10-30 | još prihvatljivo |
| preko 30 | problematično |

Nijedna analizirana klasa ne prelazi granicu od 30, što je pozitivan rezultat.

`TripController` i `TripService` imaju povišenu povezanost, ali to je očekivano jer su centralne klase modula. One komuniciraju s više DTO-a, servisa, sigurnosnih komponenti i response wrappera.

Ipak, ako se modul nastavi širiti, ove klase treba pratiti jer bi mogle postati previše povezane.

## Nasljeđivanje

Rezultati za DIT i NOC pokazuju da modul gotovo uopće ne koristi duboko nasljeđivanje.

Repository interfejsi nasljeđuju Spring Data JPA repozitorije, ali u vlastitom projektnom kodu nema složenih hijerarhija nasljeđivanja.

| Metrika | Rezultat |
|---|---|
| DIT u većini klasa | 0 |
| DIT kod repository interfejsa | 1 |
| NOC | 0 u vlastitim klasama |

### Zaključak za nasljeđivanje

Ovo je dobro za održavanje. Projekt se više oslanja na kompoziciju i dependency injection nego na duboko nasljeđivanje.

Takav pristup prikladan je za Spring Boot aplikaciju jer smanjuje kompleksnost i olakšava testiranje.

## Detaljniji pregled odabranih klasa

### PlaceCategoryMapper

`PlaceCategoryMapper` ima najveću kompleksnost u analiziranom modulu.

Metrike:

| Metrika | Vrijednost |
|---|---:|
| LOC | 231 |
| Broj metoda | 8 |
| WMC | 190 |
| Najveća CC metode | 44 |
| CBO | 1 |

Pozitivno:

- klasa ima vrlo nizak CBO
- gotovo ne ovisi o drugim klasama
- jasno je ograničena na jednu odgovornost: mapiranje kategorija mjesta

Negativno:

- ima puno `if` uvjeta
- pravila su zapisana direktno u kodu
- dodavanje novih kategorija može dodatno povećati kompleksnost
- najveća metoda prelazi preporučenu granicu za jednostavno testiranje

### GeoapifyService

Metrike:

| Metrika | Vrijednost |
|---|---:|
| LOC | 212 |
| Broj metoda | 7 |
| WMC | 43 |
| Najveća CC metode | 9 |
| CBO | 12 |

Pozitivno:

- maksimalna kompleksnost metode je 9, što je unutar dobrog raspona
- servis ima jasnu odgovornost: komunikacija s Geoapify API-jem
- logika je podijeljena na više manjih metoda

Rizici:

- klasa sadrži i API komunikaciju i mapiranje odgovora
- ima više ugniježđenih DTO klasa
- ako se Geoapify integracija proširi, klasa može dodatno narasti

Prijedlog poboljšanja:

- izdvojiti DTO klase u poseban paket ako se budu ponovno koristile
- izdvojiti mapiranje u poseban mapper ako logika naraste
- razmotriti centralizirani HTTP client za vanjske API-je

### WeatherService

Metrike:

| Metrika | Vrijednost |
|---|---:|
| LOC | 149 |
| Broj metoda | 7 |
| WMC | 38 |
| Najveća CC metode | 8 |
| CBO | 15 |

Pozitivno:

- kompleksnost pojedinih metoda je prihvatljiva
- klasa ima jasnu odgovornost
- mapiranje vremenskog tipa je čitljivo

Rizici:

- servis direktno gradi URL-ove
- direktno koristi `RestTemplate`
- koristi vanjski API format unutar iste klase

Prijedlog poboljšanja:

- izdvojiti OpenWeather client/adapter
- definirati zasebne response DTO klase
- centralizirati obradu grešaka vanjskih API-ja

### TripController

Metrike:

| Metrika | Vrijednost |
|---|---:|
| LOC | 143 |
| Broj metoda | 12 |
| WMC | 19 |
| Najveća CC metode | 4 |
| CBO | 25 |

Pozitivno:

- metode su uglavnom kratke
- controller uglavnom delegira poslovnu logiku servisima
- najveća ciklomatska kompleksnost je niska

Rizici:

- controller ima dosta endpointa
- povezanost je povišena zbog više DTO-a, servisa i rate limitera
- ako se dodaju novi endpointi, klasa može postati prevelika

Prijedlog poboljšanja:

- ako se broj endpointa poveća, razdvojiti controller po poddomenama
- npr. `TripBudgetController`, `TripAccommodationController`, `TripRatingController`
- zadržati postojeće pravilo da controller ne sadrži poslovnu logiku

### TripService

Metrike:

| Metrika | Vrijednost |
|---|---:|
| LOC | 125 |
| Broj metoda | 13 |
| WMC | 16 |
| Najveća CC metode | 2 |
| CBO | 23 |

Pozitivno:

- poslovna logika je relativno jednostavna po metodi
- metode imaju nisku kompleksnost
- servis je dobar primjer Service Layer obrasca

Rizici:

- CBO je povišen jer servis komunicira s više repozitorija, DTO-a i entiteta
- može narasti ako se doda još funkcionalnosti putovanja

Prijedlog poboljšanja:

- pratiti rast klase kroz vrijeme
- po potrebi izdvojiti posebne servise za budžet, itinerary i accommodation
- zadržati transakcijsku logiku u servisnom sloju

## Ukupna ocjena kvalitete analiziranog koda

Analizirani dio koda općenito je dobro strukturiran.

Najbolji pokazatelji su:

- nema dubokog nasljeđivanja
- controlleri uglavnom delegiraju posao servisima
- servisi su odvojeni po odgovornostima
- DTO klase su male
- repository klase su jednostavne
- prosječan LOC po klasi je razuman
- prosječan CBO je u dobrom rasponu

Najveći rizici su:

- `PlaceCategoryMapper` ima previsoku ciklomatsku kompleksnost
- integracijski servisi za vanjske API-je mogu dodatno narasti
- `TripController` i `TripService` su centralne klase pa ih treba pratiti pri daljnjem razvoju

## Predložena poboljšanja

Kod nije mijenjan, ali bi se mogla napraviti sljedeća poboljšanja:

1. Smanjiti kompleksnost `PlaceCategoryMapper` klase.

   Najbolje bi bilo prebaciti kategorijska pravila u strukturirani oblik, primjerice mapu ili listu pravila. Time bi se smanjio broj `if` uvjeta i olakšalo dodavanje novih kategorija.

2. Razdvojiti veće integracijske servise ako nastave rasti.

   `GeoapifyService` i `WeatherService` trenutno su prihvatljivi, ali u budućnosti bi se mogli podijeliti na:

   - API client
   - response mapper
   - domain service

3. Pratiti rast `TripController` klase.

   Ako controller dobije još endpointa, moglo bi ga se podijeliti na manje controllere po funkcionalnosti.

4. Dodati ciljane unit testove za kompleksnije mapiranje.

   Najviše bi koristili testovi za:

   - `PlaceCategoryMapper`
   - `WeatherService.mapWeatherType`
   - `GeoapifyService` mapiranje rezultata
   - rate limiter logiku za rating

5. Uvesti automatizirani alat za metrike.

   Za daljnji razvoj korisno bi bilo koristiti:

   - SonarQube
   - SonarLint
   - Checkstyle
   - PMD
   - SpotBugs

   Ti alati dali bi preciznije metrike i mogli bi se uključiti u CI/CD pipeline.

## Usporedba s preporučenim vrijednostima

| Metrika | Preporučena vrijednost | Rezultat u modulu | Ocjena |
|---|---:|---:|---|
| Prosječan LOC po klasi | što manje, po mogućnosti ispod 100 za većinu klasa | 46.0 | dobro |
| Najveća CC većine metoda | 1-10 | većina metoda je u tom rasponu | dobro |
| Najveća izmjerena CC | iznad 20 je rizično | 44 u `PlaceCategoryMapper` | treba poboljšati |
| Prosječan CBO | 0-9 dobro, 10-30 prihvatljivo | 6.5 | dobro |
| Najveći CBO | preko 30 problematično | 25 u `TripController` | prihvatljivo |
| DIT | 1-2 dobro, preko 4 kritično | 0-1 | vrlo dobro |
| NOC | ovisi o dizajnu, visoko treba pratiti | 0 | dobro |

## Zaključak

Analiza objektno orijentiranih metrika za `trip` modul pokazuje da je kod većinom dobro organiziran i održiv. Projekt koristi jasnu slojevitu strukturu: controlleri primaju zahtjeve, servisi sadrže poslovnu logiku, repozitoriji pristupaju bazi, a DTO klase odvajaju API model od entiteta.

Najbolji rezultat je to što nema dubokog nasljeđivanja i što većina klasa ima razumnu veličinu. To znači da je kod lakše razumjeti, testirati i mijenjati.

Najslabija točka je `PlaceCategoryMapper`, koji ima visoku ciklomatsku kompleksnost zbog velikog broja pravila za mapiranje kategorija. Ta klasa je glavni kandidat za buduće poboljšanje. Ipak, rizik je ograničen jer klasa ima nisku povezanost s ostatkom sustava i jasno definiranu odgovornost.

Zaključno, analizirani dio projekta je u dobrom stanju, ali bi se daljnja kvaliteta mogla poboljšati smanjenjem kompleksnosti mapiranja kategorija, boljim odvajanjem integracijskih adaptera i uvođenjem automatiziranog alata za mjerenje metrika u razvojni proces.