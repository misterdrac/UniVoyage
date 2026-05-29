# Softverski arhitektonski obrasci

## Tema

UniVoyage je full-stack aplikacija za planiranje putovanja. Projekt sadrži React frontend, Spring Boot backend, PostgreSQL bazu podataka, vanjske API integracije i administratorski CMS. Zbog toga se ne može opisati samo jednim obrascem. Najrealnije ga je promatrati kao kombinaciju više obrazaca koji zajedno daju jasnu strukturu, održivost i mogućnost daljnjeg širenja.

## Kratak opis projekta

UniVoyage je platforma za planiranje studentskih i budžetno osviještenih putovanja.

Glavne funkcionalnosti projekta su:

- izrada i upravljanje putovanjima
- pregled destinacija
- planiranje budžeta
- preporuke hotela
- prikaz vremenske prognoze
- prikaz zanimljivih mjesta i karte
- AI generiranje itinerara i prijedloga za pakiranje
- korisnički profil
- Google OAuth prijava
- administratorski panel za upravljanje sadržajem

Tehnološki gledano, projekt je podijeljen na:

- `frontend/` - React, TypeScript i Vite
- `backend/` - Java, Spring Boot, Spring Security i Spring Data JPA
- `database` - PostgreSQL s Flyway migracijama
- `external APIs` - OpenWeather, Geoapify, Amadeus, Google Gemini i OpenStreetMap

Već sama ova podjela pokazuje da projekt prirodno traži slojevitu i modularnu arhitekturu.

## Ciljevi arhitekture

Kod odabira arhitektonskih obrazaca za UniVoyage najvažnije je podržati sljedeće ciljeve:

- odvajanje korisničkog sučelja od poslovne logike
- jasna organizacija backend koda
- jednostavno testiranje servisa i kontrolera
- sigurna autentifikacija i autorizacija
- stabilna komunikacija s vanjskim servisima
- mogućnost dodavanja novih funkcionalnosti bez velikih izmjena postojećeg koda
- jednostavno održavanje aplikacije kroz dulje vrijeme
- dobra podjela odgovornosti među komponentama

Zbog toga je najprikladniji pristup kombinacija nekoliko obrazaca, pri čemu je glavni obrazac **Layered Architecture**, odnosno slojevita arhitektura.

## Glavni predloženi obrazac: Layered Architecture

### Opis obrasca

Layered Architecture, odnosno slojevita arhitektura, organizira aplikaciju u više slojeva. Svaki sloj ima svoju odgovornost i komunicira uglavnom sa slojem ispod ili iznad sebe.

Tipični slojevi u UniVoyage projektu su:

1. prezentacijski sloj
2. API/controller sloj
3. servisni sloj
4. repository sloj
5. podatkovni sloj
6. integracijski sloj za vanjske servise

Ovakav obrazac posebno je prikladan za poslovne web aplikacije jer daje jasnu strukturu i smanjuje miješanje odgovornosti.

### Primjena u UniVoyage projektu

U UniVoyage projektu slojevita arhitektura vidi se kroz sljedeću podjelu:

```text
React frontend
    |
REST API controllers
    |
Service layer
    |
Repository layer
    |
PostgreSQL database
```

Na backendu se to vidi kroz pakete kao što su:

- `controller` - prima HTTP zahtjeve i vraća HTTP odgovore
- `service` - sadrži poslovnu logiku
- `repository` - pristupa bazi podataka
- `model` - predstavlja entitete baze
- `dto` - predstavlja podatke koji se šalju između slojeva i prema frontendu

Primjeri iz projekta:

- `TripController` prima zahtjeve za putovanja
- `TripService` obrađuje poslovnu logiku putovanja
- `TripRepository` komunicira s bazom podataka
- `TripEntity` predstavlja zapis putovanja u bazi
- `TripResponse` predstavlja podatke koje frontend dobiva kao odgovor

### Zašto odgovara projektu

Ovaj obrazac najviše odgovara UniVoyage projektu jer projekt ima više jasno odvojenih domena:

- autentifikacija
- korisnici
- putovanja
- destinacije
- budžeti
- vremenska prognoza
- hoteli
- administracija
- AI integracija

Svaka domena može imati vlastite kontrolere, servise, repozitorije i DTO objekte. Time se smanjuje rizik da promjena u jednoj funkcionalnosti pokvari drugu.

Na primjer, promjena načina dohvata vremenske prognoze ne bi trebala zahtijevati promjene u logici prijave korisnika. Isto tako, promjena prikaza destinacija na frontendu ne bi trebala mijenjati bazu podataka ili poslovnu logiku putovanja.

### Prednosti za UniVoyage

Prednosti slojevite arhitekture u ovom projektu su:

- jasna organizacija koda
- jednostavnije razumijevanje projekta
- lakše testiranje pojedinih slojeva
- mogućnost zamjene implementacija
- manja povezanost između dijelova sustava
- bolja podrška timskom radu
- dobra podloga za buduće širenje

Primjerice, ako se u budućnosti doda novi API za cijene avionskih karata, on se može dodati u integracijski sloj bez većih promjena u ostatku aplikacije.

## MVC obrazac

### Opis obrasca

MVC znači Model-View-Controller. To je obrazac koji razdvaja:

- Model - podatke i poslovne objekte
- View - prikaz korisniku
- Controller - obradu korisničkih zahtjeva

Kod modernih web aplikacija MVC se često primjenjuje na malo drukčiji način. Frontend preuzima ulogu prikaza, a backend controlleri služe kao REST API sloj.

### Primjena u UniVoyage projektu

U UniVoyage projektu MVC se može prepoznati ovako:

- Model: JPA entiteti poput `UserEntity`, `TripEntity`, `DestinationEntity`
- View: React stranice i komponente
- Controller: Spring Boot controlleri poput `AuthController`, `TripController`, `DestinationController`

Frontend nije klasični serverski prikaz, nego zasebna SPA aplikacija. Zato je bolje reći da projekt koristi modernu varijantu MVC ideje kroz odvajanje prikaza, kontrolera i modela.

### Zašto odgovara projektu

MVC odgovara projektu jer frontend i backend imaju jasne odgovornosti.

React aplikacija bavi se:

- prikazom stranica
- korisničkim interakcijama
- lokalnim stanjem
- pozivima prema API-ju

Spring Boot backend bavi se:

- validacijom zahtjeva
- autentifikacijom
- poslovnom logikom
- spremanjem podataka
- komunikacijom s vanjskim servisima

Ova podjela omogućuje da se frontend i backend razvijaju relativno neovisno.

## REST arhitekturalni stil

### Opis

REST je arhitekturalni stil za komunikaciju između klijenta i servera putem HTTP protokola. Resursi se predstavljaju kroz URL-ove, a operacije se izvode pomoću HTTP metoda kao što su `GET`, `POST`, `PUT`, `PATCH` i `DELETE`.

### Primjena u UniVoyage projektu

UniVoyage koristi REST API za komunikaciju React frontenda i Spring Boot backenda.

Primjeri REST resursa u projektu mogu biti:

- `/api/auth`
- `/api/trips`
- `/api/destinations`
- `/api/profile`
- `/api/admin/users`
- `/api/weather`
- `/api/hotels`

Frontend poziva ove endpointove kroz API servisne module, a backend vraća strukturirane JSON odgovore.

### Zašto odgovara projektu

REST je prikladan zato što:

- React frontend lako komunicira s REST API-jem
- API se može testirati neovisno o frontendu
- endpointi su razumljivi i dobro organizirani
- jednostavno je povezati mobilnu aplikaciju u budućnosti
- dobro se uklapa sa Spring Boot tehnologijom

Za UniVoyage REST predstavlja dobar komunikacijski obrazac jer aplikacija ima više nezavisnih resursa: korisnike, putovanja, destinacije, recenzije, budžete i administracijske podatke.

## Service Layer obrazac

### Opis

Service Layer obrazac odvaja poslovnu logiku od kontrolera. Controller ne bi trebao donositi poslovne odluke, nego samo primiti zahtjev, validirati osnovni ulaz i pozvati odgovarajući servis.

### Primjena u UniVoyage projektu

Primjeri servisnog sloja u projektu:

- `AuthService`
- `TripService`
- `DestinationService`
- `GeminiService`
- `WeatherService`
- `AdminUserService`
- `TripCurrencyService`

Servisi su mjesto gdje se nalaze pravila aplikacije. Na primjer:

- korisnik smije vidjeti samo svoja putovanja
- putovanje mora imati ispravne datume
- recenzija se mora vezati uz postojeće putovanje ili destinaciju
- admin može uređivati destinacije
- AI itinerary se generira na temelju zahtjeva korisnika

### Zašto odgovara projektu

UniVoyage ima dosta poslovne logike. Da se ta logika nalazi direktno u controllerima, controlleri bi brzo postali preveliki i teški za održavanje.

Service Layer omogućuje:

- bolju čitljivost
- ponovno korištenje poslovne logike
- lakše unit testiranje
- transakcijsko upravljanje pomoću `@Transactional`
- manju ovisnost o HTTP sloju

Zbog toga je Service Layer jedan od najvažnijih obrazaca u ovom projektu.

## Repository obrazac

### Opis

Repository obrazac odvaja poslovnu logiku od pristupa bazi podataka. Umjesto da servis direktno piše SQL upite, koristi repozitorije koji predstavljaju kolekcije entiteta.

### Primjena u UniVoyage projektu

Spring Data JPA prirodno podržava Repository obrazac.

Primjeri repozitorija u projektu:

- `UserRepository`
- `TripRepository`
- `DestinationRepository`
- `TripBudgetRepository`
- `RefreshTokenRepository`
- `CountryRepository`
- `HobbyRepository`
- `LanguageRepository`

Repository sloj komunicira s PostgreSQL bazom i skriva detalje dohvata podataka od ostatka aplikacije.

### Zašto odgovara projektu

UniVoyage ima više tablica i povezanih entiteta. Repository obrazac omogućuje da se pristup podacima organizira po domenama.

Prednosti su:

- manje ponavljanja SQL koda
- lakše korištenje paginacije i sortiranja
- sigurniji upiti
- jednostavnije testiranje servisa
- jasna granica između poslovne logike i baze

Na primjer, servis za putovanja ne mora znati kako se točno izvršava SQL upit za dohvat putovanja korisnika. Dovoljno je da pozove metodu repozitorija.

## DTO obrazac

### Opis

DTO, odnosno Data Transfer Object, koristi se za prijenos podataka između slojeva aplikacije ili između backenda i frontenda.

DTO ne mora imati istu strukturu kao entity objekt. Često sadrži samo podatke koji su potrebni korisniku ili klijentskoj aplikaciji.

### Primjena u UniVoyage projektu

U projektu postoje mnogi DTO objekti, primjerice:

- `LoginRequestDto`
- `RegisterRequestDto`
- `AuthResponse`
- `CreateTripRequest`
- `TripResponse`
- `DestinationResponse`
- `BudgetEstimateRequest`
- `AdminUserResponse`

DTO objekti koriste se kako backend ne bi direktno izlagao JPA entitete frontendu.

### Zašto odgovara projektu

DTO obrazac jako je važan za UniVoyage jer projekt radi s osjetljivim korisničkim podacima.

Bez DTO-a bi postojala opasnost da se frontendu pošalju polja koja ne smije vidjeti, primjerice:

- hash lozinke
- interni identifikatori
- sigurnosni tokeni
- administracijska polja
- podaci koji nisu potrebni za prikaz

DTO također omogućuje da se API struktura odvoji od strukture baze podataka. To znači da se baza može mijenjati bez nužnog mijenjanja frontenda.

## Adapter obrazac

### Opis

Adapter obrazac koristi se kada aplikacija treba komunicirati s vanjskim sustavom koji ima vlastiti format, pravila i API.

Adapter služi kao prevoditelj između interne logike aplikacije i vanjskog servisa.

### Primjena u UniVoyage projektu

UniVoyage koristi više vanjskih servisa:

- OpenWeather za vremensku prognozu
- Geoapify za mjesta interesa
- Amadeus za hotele
- Google Gemini za AI generiranje sadržaja
- Exchange Rate API za valute

Svaki od tih servisa ima vlastiti format zahtjeva i odgovora. Zato je dobro imati posebne servise ili klijente koji skrivaju detalje vanjskog API-ja.

Primjeri takvih komponenti su:

- `GeminiService`
- `ExchangeRateApiClient`
- `ExchangeRateHostClient`
- API moduli na frontendu za weather, hotels i places

### Zašto odgovara projektu

Adapter obrazac prikladan je jer UniVoyage ne smije biti previše vezan uz konkretne vanjske API-je.

Ako se, primjerice, OpenWeather zamijeni drugim servisom, cilj je da se promijeni samo adapter za vremensku prognozu, a ne cijela aplikacija.

Prednosti:

- manje ovisnosti o vanjskom API-ju
- lakša zamjena servisa
- centralizirana obrada grešaka
- lakše testiranje pomoću mock implementacija
- jasniji kod u servisima koji koriste vanjske podatke

## Facade obrazac

### Opis

Facade obrazac daje jednostavnije sučelje prema složenijem podsustavu. Umjesto da controller ili frontend mora pozivati više različitih komponenti, facade može objediniti više koraka u jednu operaciju.

### Primjena u UniVoyage projektu

UniVoyage ima funkcionalnosti koje prirodno uključuju više izvora podataka.

Primjer je detalj putovanja koji može uključivati:

- osnovne podatke o putovanju
- destinaciju
- budžet
- smještaj
- vremensku prognozu
- mjesta interesa
- itinerary
- recenzije

Umjesto da frontend ručno sastavlja previše nepovezanih poziva, backend može imati servis koji objedini najvažnije podatke i vrati ih u stabilnom obliku.

### Zašto odgovara projektu

Facade obrazac dobar je za UniVoyage jer pojednostavljuje složene funkcionalnosti.

Najbolje ga je koristiti tamo gdje jedan korisnički ekran treba podatke iz više izvora. Time se smanjuje složenost frontenda i poboljšava konzistentnost odgovora.

Ne treba ga koristiti za svaku funkcionalnost, nego samo za one koje stvarno objedinjuju više dijelova sustava.

## Modular Monolith kao preporučeni stil razvoja

### Opis

Modular Monolith arhitekturni je stil u kojem je aplikacija jedna isporučiva cjelina, ali je interno podijeljena u jasne module.

To znači da aplikacija nije mikroservisna, ali ipak ima dobro odvojene domene.

### Primjena u UniVoyage projektu

Backend UniVoyage projekta trenutno je najbolje promatrati kao modularni monolit.

Paketi su organizirani po domenama:

- `auth`
- `user`
- `trip`
- `destination`
- `admin`
- `quiz`
- `ai`
- `currency`
- `hotel`
- `reference`

Svaki modul ima vlastite kontrolere, servise, repozitorije, DTO objekte i modele.

### Zašto je bolji od mikroservisa za ovaj projekt

Mikroservisna arhitektura za ovaj bi projekt trenutno bila pretjerana.

Razlozi:

- projekt još nije toliko velik da zahtijeva odvojene servise
- mikroservisi bi dodali složenost deployanja
- trebalo bi rješavati komunikaciju između servisa
- testiranje bi bilo složenije
- lokalni razvoj bio bi teži
- timski i akademski projekt ima više koristi od jasnog monolita

Modularni monolit daje dobar balans: kod je organiziran, ali se aplikacija i dalje jednostavno pokreće, testira i deploya.

Ako projekt u budućnosti naraste, pojedini moduli mogu se izdvojiti u zasebne servise. Na primjer:

- AI modul
- modul za pretraživanje hotela
- notification modul
- analytics modul

Za trenutnu fazu projekta modularni monolit najpragmatičniji je izbor.

## Obrasci koji nisu najbolji izbor

### Microservices

Mikroservisi nisu najbolji izbor u trenutnoj fazi.

Iako UniVoyage ima više domena, one još nisu toliko velike ni neovisne da bi zahtijevale zasebne isporučive servise. Mikroservisi bi povećali složenost infrastrukture, autentifikacije, komunikacije, logiranja i testiranja.

Za akademski i razvojni kontekst projekta bolji je modularni monolit.

### Hexagonal Architecture

Hexagonal Architecture, odnosno Ports and Adapters, mogla bi biti dobra za dijelove projekta koji komuniciraju s vanjskim servisima.

Ipak, za cijeli projekt trenutno bi mogla biti previše formalna i zahtijevati više apstrakcija nego što je potrebno.

Može se djelomično primijeniti na:

- AI integracije
- vremensku prognozu
- hotele
- valute

Za ostatak projekta dovoljan je Layered Architecture pristup.

## Zaključak

Najbolji arhitektonski izbor za UniVoyage je:

```text
Modular Monolith
    + Layered Architecture
    + REST API
    + MVC podjela odgovornosti
    + Service Layer
    + Repository Pattern
    + DTO Pattern
    + Adapter Pattern za vanjske API-je
    + Facade Pattern za složene korisničke tokove
```

Najvažniji obrazac je **Layered Architecture**, jer daje osnovnu strukturu cijelog backenda i dobro se uklapa u Spring Boot.

Najvažniji stil organizacije projekta je **Modular Monolith**, jer omogućuje jasnu podjelu po domenama bez nepotrebne složenosti mikroservisa.

UniVoyage je dovoljno kompleksan projekt da mu odgovara kombinacija više arhitektonskih obrazaca. Jedan obrazac ne bi bio dovoljan da kvalitetno opiše cijelu aplikaciju.

Slojevita arhitektura pomaže u odvajanju kontrolera, servisa, repozitorija i baze podataka. MVC i REST pomažu u odvajanju frontenda i backenda. Service Layer i Repository obrazac čine backend organiziranim i testabilnim. DTO obrazac štiti podatke i daje stabilan API ugovor. Adapter obrazac omogućuje lak rad s vanjskim servisima, dok Facade obrazac može pojednostaviti složene korisničke tokove.

Zbog toga je za UniVoyage najprikladniji pristup modularni monolit izgrađen na slojevitoj arhitekturi. Takav pristup dovoljno je jednostavan za razvoj i deploy, ali dovoljno strukturiran da projekt može rasti i u budućnosti.
