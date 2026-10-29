import type { ResolvedProjectType } from "@/features/questionnaire/types";

/**
 * One landing page per service, each aimed at its own search ("webshop készítés", "landing page készítés"…).
 * `{from}` is replaced with the live starting price from the pricing engine.
 */
export interface ServiceContent {
  type: ResolvedProjectType;
  slug: string;
  /** Short name for links and breadcrumbs. */
  name: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  forWhom: string[];
  priceFactors: string[];
  faq: { q: string; a: string }[];
}

export const services: ServiceContent[] = [
  {
    type: "company",
    slug: "weboldal-keszites",
    name: "Weboldal készítés",
    metaTitle: "Weboldal készítés Székelyudvarhely – céges oldal {from}-tól",
    metaDescription:
      "Céges, bemutatkozó weboldal készítés Székelyudvarhelyről, Erdély-szerte. Mobilbarát, gyors, könnyen szerkeszthető – {from}-tól. Az árat 3 perc alatt, tételesen kiszámolod.",
    h1: "Céges weboldal készítés Székelyudvarhelyen és Erdélyben",
    intro:
      "Bemutatkozó weboldal kis- és középvállalkozásoknak: gyors, mobilbarát és könnyen szerkeszthető. Az árat 3 perc alatt, tételesen kiszámolod – regisztráció nélkül.",
    forWhom: [
      "Helyi szolgáltatóknak, akiket telefonon vagy e-mailben keresnek meg",
      "Cégeknek, akiknek elavult vagy egyáltalán nincs weboldaluk",
      "Vállalkozóknak, akik maguk szeretnék frissíteni a szövegeket és képeket",
    ],
    priceFactors: [
      "Az oldalak száma (5, 10, 20 vagy több)",
      "Funkciók: blog, időpontfoglalás, galéria, hírlevél",
      "Design: sablonalapú, testreszabott vagy teljesen egyedi",
      "A nyelvek száma és a szövegírás",
    ],
    faq: [
      {
        q: "Mennyibe kerül egy céges weboldal?",
        a: "Egy egyszerű, sablonalapú bemutatkozó oldal {from}-tól készül. A pontos ár az oldalak számától, a funkcióktól és a designtól függ – a kérdőív tételesen kiszámolja.",
      },
      { q: "Mennyi idő alatt készül el?", a: "Egy átlagos, 5–10 oldalas céges weboldal 2–4 hét alatt élesedik." },
      { q: "Tudom majd én is szerkeszteni?", a: "Igen. Tartalomkezelőt kapsz, és megmutatjuk, hogyan frissítsd a szövegeket és a képeket." },
    ],
  },
  {
    type: "webshop",
    slug: "webshop-keszites",
    name: "Webshop készítés",
    metaTitle: "Webshop készítés Erdélyben – Shopify webáruház {from}-tól",
    metaDescription:
      "Shopify webshop készítés román futár-, kártyás fizetés- és számlázó-integrációval (Fan Courier, Sameday, SmartBill). {from}-tól, tételes árajánlattal 3 perc alatt.",
    h1: "Webshop készítés Shopify-jal, Székelyudvarhelyről Erdély-szerte",
    intro:
      "Shopify-alapú webáruház román futár-, fizetés- és számlázó-integrációval. Az árat a termékszám, a szállítás és a fizetési módok alapján, tételesen kapod meg.",
    forWhom: [
      "Kézműveseknek és kisboltoknak, akik online is árulnának",
      "Vállalkozásoknak, akik régi webshopot költöztetnének",
      "Akik Fan Courier, Sameday vagy easybox szállítást szeretnének",
    ],
    priceFactors: [
      "A termékek száma és a termékváltozatok",
      "Futár, csomagautomata és szállítási díjak",
      "Fizetés: bankkártya, utánvét, átutalás",
      "Számlázó-integráció (SmartBill, Oblio) és többnyelvűség",
    ],
    faq: [
      {
        q: "Mennyibe kerül egy webshop?",
        a: "Egy egyszerű Shopify-webshop {from}-tól készül. A futárintegráció, a termékfeltöltés vagy a számlázó összekötése felárral jár – a kérdőív mindet tételesen kiszámolja.",
      },
      {
        q: "Miért Shopify?",
        a: "Megbízható és biztonságos, a fizetést, a készletet és a rendeléseket egy helyen kezeli. A havidíja a Shopify felé fizetendő.",
      },
      {
        q: "Át tudjátok költöztetni a régi webshopomat?",
        a: "Igen: a termékeket, a vásárlókat, a rendeléseket és az átirányításokat is, hogy a Google-helyezés megmaradjon.",
      },
    ],
  },
  {
    type: "webapp",
    slug: "webalkalmazas-fejlesztes",
    name: "Webalkalmazás fejlesztés",
    metaTitle: "Egyedi webalkalmazás fejlesztés – portál, belső rendszer {from}-tól",
    metaDescription:
      "Egyedi webalkalmazás fejlesztés: ügyfélportál, foglalási vagy belső rendszer adminfelülettel és bejelentkezéssel. {from}-tól, tételes árajánlattal 3 perc alatt.",
    h1: "Egyedi webalkalmazás fejlesztés kis- és középvállalkozásoknak",
    intro:
      "Ügyfélportál, foglalási vagy belső rendszer, adminfelülettel és bejelentkezéssel. A kérdőív alapján előre látod, mi mennyibe kerül.",
    forWhom: [
      "Cégeknek, akik Excelből vagy papírról váltanának",
      "Szolgáltatóknak, akiknek ügyfélportál kell",
      "Csapatoknak, akiknek saját belső eszköz kell",
    ],
    priceFactors: [
      "Felhasználói szerepkörök és bejelentkezés",
      "Adminfelület, adatbázis, riportok",
      "Integrációk: számlázó, CRM, naptár, fizetés",
      "A felhasználók száma és a biztonsági igények",
    ],
    faq: [
      {
        q: "Mennyibe kerül egy webalkalmazás?",
        a: "Egy egyszerű webalkalmazás {from}-tól indul. Az ár a funkcióktól, az integrációktól és a felhasználói szerepköröktől függ.",
      },
      {
        q: "Mi a különbség egy weboldal és egy webalkalmazás között?",
        a: "A weboldal bemutat, a webalkalmazás dolgozik: bejelentkezés, adatok kezelése, folyamatok.",
      },
      { q: "Később bővíthető?", a: "Igen, modern, bővíthető alapra építünk, így új funkciók bármikor jöhetnek." },
    ],
  },
  {
    type: "landing",
    slug: "landing-page-keszites",
    name: "Landing page készítés",
    metaTitle: "Landing page készítés – konverzióra tervezve {from}-tól",
    metaDescription:
      "Landing page készítés hirdetésekhez, rendezvényekhez és termékbevezetéshez: gyors, mérhető, egy céllal. {from}-tól, tételes árajánlattal 3 perc alatt.",
    h1: "Landing page készítés kampányokhoz és termékbevezetéshez",
    intro: "Egyetlen gyors oldal egy céllal: jelentkezés, vásárlás vagy feliratkozás. Mérőkódokkal, hirdetésekhez előkészítve.",
    forWhom: ["Facebook- és Google-hirdetésekhez", "Rendezvényekhez, tanfolyamokhoz, akciókhoz", "Új termék vagy szolgáltatás bevezetéséhez"],
    priceFactors: ["A szekciók száma", "Szövegírás és vizuális elemek", "Űrlapok, hírlevél, időpontfoglalás", "Mérés és hirdetési követőkódok"],
    faq: [
      { q: "Mennyibe kerül egy landing page?", a: "Egy egyszerű landing page {from}-tól készül; a szövegírás, az animációk és az integrációk felárral járnak." },
      { q: "Mennyi idő alatt készül el?", a: "Általában 1–2 hét alatt." },
      { q: "Mérhető lesz a hirdetések eredménye?", a: "Igen, Google Analytics és Meta-pixel beállítással." },
    ],
  },
  {
    type: "redesign",
    slug: "weboldal-felujitas",
    name: "Weboldal felújítás",
    metaTitle: "Weboldal felújítás, modernizálás {from}-tól",
    metaDescription:
      "Elavult, lassú vagy mobilon rosszul működő weboldal felújítása a Google-helyezés megőrzésével. {from}-tól, tételes árajánlattal 3 perc alatt.",
    h1: "Weboldal felújítás: gyorsabb, modernebb, mobilbarát oldal",
    intro: "Elavult, lassú vagy nehezen szerkeszthető oldal helyett modern, gyors weboldal – a Google-helyezés megőrzésével.",
    forWhom: [
      "Akiknek az oldala mobilon rosszul néz ki",
      "Akik lassú WordPress- vagy oldalépítős oldalt használnak",
      "Akiket kevés megkeresés ér az oldalról",
    ],
    priceFactors: [
      "Az oldalak száma és a tartalom átvitele",
      "Mit tartasz meg a régiből (logó, színek, szöveg)",
      "Új funkciók",
      "SEO-megőrzés és átirányítások",
    ],
    faq: [
      { q: "Elveszítem a Google-helyezésemet?", a: "Nem: átirányítási tervvel és a fontos oldalak megőrzésével vigyázunk rá." },
      { q: "Megmaradnak a régi szövegeim?", a: "Igen, a tartalmat átvisszük, és kérésre csiszoljuk is." },
      { q: "Mennyibe kerül a felújítás?", a: "{from}-tól; a pontos ár a régi oldal méretétől és az új funkcióktól függ." },
    ],
  },
];

export const serviceByType = (type: ResolvedProjectType) => services.find((service) => service.type === type)!;
