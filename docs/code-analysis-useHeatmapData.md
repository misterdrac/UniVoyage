# Analiza koda: `useHeatmapData.ts`

**Datoteka**: [`frontend/src/hooks/useHeatmapData.ts`](../frontend/src/hooks/useHeatmapData.ts) | **115 linija** | React Custom Hook  
**Svrha**: Geokodiranje lokacija topline mape sa cachiranjem i API rate limitingom

---

## Što koda radi

Hook dohvaća podatke sa backenda, **geokodira** svaku lokaciju (Nominatim), **cachira** rezultate u localStorage, i **sortira** točke po intenzitetu.

---

## Dobar dizajn

| Praksa | Status |
|--------|--------|
| **Cachiranje** - Nominatim cache sa localStorage | Smanjuje redundantne zahtjeve |
| **Rate limiting** - `await delay(1000)` | Poštuje API politiku (1 req/sec) |
| **Memory leak zaštita** - `abortRef.current` pattern | Sprječava state updates nakon unmountanja |
| **Error handling** - Try/catch sa null-cheком | Robustan |
| **Type safety** - TypeScript interfaces | Jasno |

---

## Problemi

| Problem | Ozbiljnost | Objašnjenje |
|---------|-----------|------------|
| **Serijsko geokodiranje** | KRITIČNO | 50 lokacija = 50+ sekundi! `for` loop čeka 1s između svakog zahtjeva |
| **localStorage overhead** | SREDNJE | `JSON.stringify()` cijelog cachea pri svakom spremi; nema limite veličine |
| **Brute-force approach** | SREDNJE | Geokodira sve lokacije čak i one koje nisu vidljive na mapi |
| **Nema cache invalidacije** | SREDNJE | Cache je vječan - ako se naziv lokacije promijeni, stare koordinate ostaju |
| **Nema UX povratne info** | SREDNJE | Korisnik čeka 50+ sekundi bez progresa - nema "5/50 lokacija" indikatora |

---

## Performanse - teorija vs realnost

| Scenario | Vrijeme | Primjedba |
|----------|---------|----------|
| 5 lokacija (sve u cacheu) | ~500ms | Optimalno |
| 5 lokacija (nove) | ~6s | 1s x 5 zahtjeva |
| 50 lokacija (sve nove) | ~51s | [PROBLEMATIČNO] |
| 50 lokacija (u cacheu) | ~1-2s | Normalno |


---

## Best practices koji su primijenjeni

OK Error boundary (try/catch) | OK Memory leak zaštita | OK Type safety (TypeScript) | OK API rate limiting

## Mogućih poboljšanja

1. **Batching umjesto serijskog** → 50 lokacija: ~10s umjesto ~50s
2. **IndexedDB umjesto localStorage** → veća kapacitivnost
3. **Cache TTL** → invalidacija nakon X dana
4. **Lazy loading** → samo vidljive lokacije
5. **Streaming** → prikaži rezultate tijekom geokodiranja

---

**Zaključak**: Za male skupove (<10 lokacija) idealno. Za 50+ trebalo bi poboljšanje.

---

*Analiza: [`useHeatmapData.ts`](../frontend/src/hooks/useHeatmapData.ts) | 25.05.2026*