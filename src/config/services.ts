import type { ResolvedProjectType } from "@/features/questionnaire/types";

/**
 * One landing page per service, each aimed at its own search ("webshop készítés", "landing page készítés"…).
 * `{from}` is replaced with the live starting price, `{weeks}` with the delivery range, both from the pricing engine.
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
  /** How the project runs, step by step. */
  process: { title: string; text: string }[];
  /** Practical advice before ordering: what to watch out for. */
  guide: { title: string; paragraphs: string[] };
  /** A typical (illustrative) project of this kind. */
  example: { title: string; text: string; items: string[] };
  faq: { q: string; a: string }[];
  /** In-text links to related pages, with one sentence on why to read them. */
  related: { href: string; label: string; text: string }[];
}

export const services: ServiceContent[] = [
  {
    type: "company",
    slug: "weboldal-keszites",
    name: "Weboldal készítés",
    metaTitle: "Weboldal készítés Székelyudvarhely, {from}-tól",
    metaDescription:
      "Céges weboldal készítés Székelyudvarhelyről, Erdély-szerte: mobilbarát, gyors, szerkeszthető. {from}-tól, az árat pár perc alatt kiszámolod.",
    h1: "Céges weboldal készítés Székelyudvarhelyen és Erdélyben",
    intro:
      "Bemutatkozó weboldal kis- és középvállalkozásoknak: gyors, mobilbarát és könnyen szerkeszthető. Az árat pár perc alatt, tételesen kiszámolod – regisztráció nélkül.",
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
    process: [
      {
        title: "Árajánlat és egyeztetés",
        text: "Kitöltöd a kérdőívet, és azonnal látod a tételes árat. Utána egy 30 perces hívásban átbeszéljük, mit csinál a céged, kik az ügyfeleid, és mit kell tudniuk rólad, mielőtt felhívnak.",
      },
      {
        title: "Oldaltérkép és tartalom",
        text: "Együtt megtervezzük, milyen oldalak legyenek (például Rólunk, Szolgáltatások, Árak, Kapcsolat), és mi kerüljön rájuk. Ha nincs kész szöveged, a kérdéseim alapján megírjuk együtt.",
      },
      {
        title: "Design és fejlesztés",
        text: "Először a főoldal tervét látod. Ha tetszik, elkészül a teljes oldal, telefonon és gépen is kipróbálva. Közben egy teszt-címen bármikor megnézheted, hol tart a munka.",
      },
      {
        title: "Élesítés és betanítás",
        text: "Beállítom a domaint, a Google-alapokat és az e-mail-űrlapot, majd megmutatom, hogyan írhatod át a szövegeket és cserélheted a képeket. Az átadás után 30 napig ingyen javítok minden hibát.",
      },
    ],
    guide: {
      title: "Mire figyelj, ha céges weboldalt csináltatsz?",
      paragraphs: [
        "Az első és legfontosabb kérdés nem a design, hanem az, hogy mit tegyen a látogató az oldalon. Egy fodrásznál ez az időpontfoglalás, egy asztalosnál az ajánlatkérés, egy könyvelőnél a telefonhívás. Ha ez világos, minden oldal és minden gomb ebbe az irányba terel, és az oldal megkereséseket hoz, nem csak szép.",
        "A második a szerkeszthetőség. Ha minden apró változtatásért a fejlesztőt kell hívnod, az oldal hamar elavul. Kérdezd meg előre, mit tudsz majd te magad átírni: szövegeket, képeket, árakat, nyitvatartást. Nálam ezek mind a te kezedben vannak.",
        "A harmadik a tulajdonjog. Sok olcsó ajánlat úgy olcsó, hogy a domain és az oldal a fejlesztőé marad, és költözéskor mindent elölről kell kezdeni. Mindig a te nevedre regisztráld a domaint, és kérd, hogy a kód is a tiéd legyen. Végül: a Google a gyors, telefonon is jól használható oldalakat sorolja előrébb, ezért ezt ne extrának, hanem alapnak tekintsd.",
      ],
    },
    example: {
      title: "Mintaprojekt: fogászati rendelő bemutatkozó oldala",
      text: "Szemléltető példa, nem valós ügyfél. 6 oldal, online időpontkérés, galéria a rendelőről és térkép. A páciensek főleg telefonon nézik az oldalt, ezért a hívás gomb mindig kéznél van. Hogy ez pontosan mennyi, a kérdőív pár perc alatt, tételesen kiszámolja.",
      items: ["Főoldal, Rólunk, Szolgáltatások, Árak, Galéria, Kapcsolat", "Időpontkérő űrlap e-mail-értesítéssel", "Google Térkép és nyitvatartás", "Egy kattintásos hívás telefonon"],
    },
    faq: [
      {
        q: "Mennyibe kerül egy céges weboldal?",
        a: "Egy egyszerű, sablonalapú bemutatkozó oldal {from}-tól készül. A pontos ár az oldalak számától, a funkcióktól és a designtól függ – a kérdőív tételesen kiszámolja.",
      },
      { q: "Mennyi idő alatt készül el?", a: "Egy átlagos, 5–10 oldalas céges weboldal 2–4 hét alatt élesedik." },
      { q: "Tudom majd én is szerkeszteni?", a: "Igen. Saját szerkesztőfelületet kapsz, és megmutatom, hogyan frissítsd a szövegeket és a képeket." },
      {
        q: "Éttermet, panziót vagy szálláshelyet üzemeltetek. Mi kell az oldalra?",
        a: "Étlap vagy árlista, galéria, térkép, nyitvatartás és egy gyors foglalási vagy ajánlatkérő űrlap. Szálláshelynél külön figyelek arra, hogy a vendég a Booking helyett közvetlenül nálad foglaljon.",
      },
      {
        q: "Orvosi rendelőnek, ügyvédi irodának vagy könyvelőnek is készítesz oldalt?",
        a: "Igen. Ezeknél a bizalom a legfontosabb: bemutatkozás fotóval, szakterületek, egyértelmű árak vagy árképzés, és GDPR-kompatibilis űrlap, mert érzékeny adatok is érkezhetnek rajta.",
      },
      {
        q: "Kié lesz a domain és az oldal?",
        a: "A tiéd. A domaint a te nevedre regisztrálom, a kódot és a tartalmat átadom, így bármikor továbbviheted máshová.",
      },
      {
        q: "Mennyi a havi költség az elkészülés után?",
        a: "A domain és a tárhely évente néhány száz lej. Karbantartást nem kötelező kérni; ha szeretnéd, hogy frissítsem és figyeljem az oldalt, azt külön, havidíjért vállalom.",
      },
    ],
    related: [
      { href: "/mennyibe-kerul-egy-weboldal", label: "Mennyibe kerül egy weboldal?", text: "Valódi árak minden projekttípusra, csomagonként, és tippek, hol lehet spórolni." },
      { href: "/atvilagitas", label: "Ingyenes weboldal-átvilágítás", text: "Van már oldalad? 30 másodperc alatt megtudod, mennyire gyors és hogyan látja a Google." },
      { href: "/landing-page-keszites", label: "Landing page készítés", text: "Ha egyetlen ajánlatot hirdetnél, egy egyoldalas landing page olcsóbb és gyorsabb." },
    ],
  },
  {
    type: "webshop",
    slug: "webshop-keszites",
    name: "Webshop készítés",
    metaTitle: "Shopify webshop készítés Erdélyben {from}-tól",
    metaDescription:
      "Shopify webshop készítés Fan Courier, Sameday és SmartBill integrációval. {from}-tól, tételes árajánlattal pár perc alatt.",
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
    process: [
      {
        title: "Árajánlat és egyeztetés",
        text: "A kérdőív megkérdezi, mit árulsz, hány terméked van, hogyan szállítasz és hogyan fizetnek a vevők. Ebből tételes árat kapsz, amit egy 30 perces hívásban együtt pontosítunk.",
      },
      {
        title: "Bolt beállítása",
        text: "Létrehozom a Shopify-boltot a te nevedre, beállítom a kategóriákat, a szállítási zónákat és díjakat, a fizetési módokat és a rendelési értesítőket, magyar és román nyelven is, ha kell.",
      },
      {
        title: "Design, termékek, integrációk",
        text: "Testreszabom a téma megjelenését a márkádhoz, feltöltöm a termékeket, és összekötöm a boltot a futárszolgálattal és a számlázóval, hogy a rendelésből automatikusan címke és számla legyen.",
      },
      {
        title: "Próbavásárlás és élesítés",
        text: "Teszt-rendelésekkel végigpróbálom a teljes vásárlást, a kártyás fizetéstől a számláig. Élesítés után megmutatom, hogyan kezeld a rendeléseket, a készletet és az új termékeket.",
      },
    ],
    guide: {
      title: "Mire figyelj, ha webshopot indítasz Romániában?",
      paragraphs: [
        "A webshop sikere ritkán a dizájnon múlik. Sokkal fontosabb, hogy a vevő gyorsan megtalálja a terméket, lássa a szállítási díjat még a pénztár előtt, és tudjon úgy fizetni, ahogy szeretne. Erdélyben az utánvét még mindig gyakori, ezért a kártyás fizetés mellett érdemes ezt is felkínálni.",
        "Gondold végig a szállítást is: a csomagautomaták (easybox, Fan Courier FANbox) olcsóbbak és népszerűek, a házhoz szállítás kényelmesebb. A futárintegrációval a címkét nem kell kézzel kitölteni, ami napi néhány rendelésnél is sok időt spórol.",
        "A termékfotók és a leírások legalább annyit számítanak, mint maga a bolt. Ha kevés időd van, kezdj kevesebb termékkel, de jó képekkel, és bővíts később. Végül számolj a havi költségekkel is: Shopify-előfizetés, fizetési jutalék, számlázóprogram és futárdíj. Ezeket a kérdőív a fenntartási költségeknél külön mutatja, hogy ne érjen meglepetés.",
      ],
    },
    example: {
      title: "Mintaprojekt: kézműves szappanok és kozmetikumok webshopja",
      text: "Szemléltető példa, nem valós ügyfél. Kb. 40 termék illat- és méretváltozatokkal, kártyás fizetés és utánvét, Sameday easybox és házhoz szállítás, SmartBill-számla minden rendeléshez. Hogy ez pontosan mennyi, a kérdőív pár perc alatt, tételesen kiszámolja.",
      items: ["40 termék változatokkal (illat, méret)", "Bankkártya és utánvét", "easybox és futáros házhoz szállítás", "Automatikus SmartBill-számla", "Kedvezménykódok és akciós árak"],
    },
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
        q: "Át tudod költöztetni a régi webshopomat?",
        a: "Igen: a termékeket, a vásárlókat, a rendeléseket és az átirányításokat is, hogy a Google-helyezés megmaradjon.",
      },
      {
        q: "Élelmiszert, bort vagy helyi termékeket árulok. Mire figyeljek?",
        a: "Romlandó árunál a szállítási zónákat és a futár típusát kell okosan beállítani, bornál pedig a korhatár-ellenőrzést. Az összetevőket és allergéneket termékenként, jól láthatóan tüntetem fel.",
      },
      {
        q: "Ruhát vagy cipőt árulok sok méretben. Ez drágább?",
        a: "A termékváltozatok (méret, szín) beállítása plusz munka, de a Shopify jól kezeli őket. Készletet változatonként vezethetsz, így nem adsz el olyan méretet, ami már nincs raktáron.",
      },
      {
        q: "Mi kell a román szabályok szerint egy webshopra?",
        a: "Cégadatok, ÁSZF, adatkezelési tájékoztató, elállási tájékoztató, az ANPC és a SOL (online vitarendezés) logója és linkje. Ezeket a bolt beállításakor a helyükre teszem.",
      },
      {
        q: "Mennyi a Shopify havidíja?",
        a: "A Shopify a saját árlistája szerint, havonta számláz közvetlenül neked, és a kártyás fizetések után tranzakciós díjat von le. A pontos összeget a kérdőív végén, a fenntartási költségeknél látod.",
      },
    ],
    related: [
      { href: "/mennyibe-kerul-egy-weboldal", label: "Mennyibe kerül egy weboldal?", text: "Webshop, céges oldal és webalkalmazás árai egymás mellett, a havi költségekkel együtt." },
      { href: "/weboldal-felujitas", label: "Weboldal felújítás", text: "Ha a mostani boltod lassú vagy elavult, nézd meg, mivel jár a költözés és a felújítás." },
      { href: "/landing-page-keszites", label: "Landing page készítés", text: "Egy-két termékhez néha elég egy gyors termékoldal is, webshop nélkül." },
    ],
  },
  {
    type: "webapp",
    slug: "webalkalmazas-fejlesztes",
    name: "Webalkalmazás fejlesztés",
    metaTitle: "Egyedi webalkalmazás fejlesztés {from}-tól",
    metaDescription:
      "Egyedi webalkalmazás fejlesztés: ügyfélportál, foglalási vagy belső rendszer. {from}-tól, tételes árajánlattal pár perc alatt.",
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
    process: [
      {
        title: "Igényfelmérés",
        text: "A kérdőív után egy hosszabb beszélgetésben együtt végigmegyünk, ki mit csinál ma a folyamatban, hol vész el idő, és mi az, ami nélkül a rendszer nem ér semmit. Ebből lesz a rövid, írásos specifikáció.",
      },
      {
        title: "Képernyőtervek",
        text: "Mielőtt egy sor kód születne, megtervezem a fő képernyőket, és kattintható tervben kipróbálhatod őket. Így még olcsón lehet változtatni, és a kollégáid is elmondhatják a véleményüket.",
      },
      {
        title: "Fejlesztés lépésenként",
        text: "Menet közben rendszeresen kapsz egy működő, kipróbálható változatot egy teszt-címen. A legfontosabb funkció készül el először, így hamar látszik, jó irányba halad-e a munka.",
      },
      {
        title: "Átadás, betanítás, támogatás",
        text: "Átköltöztetem a meglévő adatokat (például Excelből), betanítom a kollégáidat, és átadom a kódot meg a dokumentációt. Az indulás utáni hetekben szorosan figyelem a rendszert.",
      },
    ],
    guide: {
      title: "Mire figyelj, ha egyedi webalkalmazást fejlesztetnél?",
      paragraphs: [
        "A legdrágább hiba az, ha túl sokat akarsz egyszerre. Egy webalkalmazás akkor sikeres, ha az első változata a legfontosabb munkafolyamatot oldja meg jól, és a kollégák tényleg használják. A többi funkció ráér a második körben, amikor már látszik, mire van valóban szükség.",
        "Ugyanilyen fontos, hogy a mindennapi felhasználók is beleszólhassanak. Aki naponta harmincszor rögzít egy munkalapot, pontosan tudja, melyik kattintás felesleges. Ezért mutatom meg a képernyőterveket fejlesztés előtt, és ezért adok ki menet közben kipróbálható változatokat.",
        "Végül gondolj a hosszú távra: ki fogja üzemeltetni, hogyan készül mentés, és mi történik, ha bővíteni kell. Modern, széles körben használt technológiával dolgozom, és a kódot dokumentációval együtt átadom, így nem leszel egyetlen fejlesztőhöz kötve.",
        "Az árat is érdemes reálisan nézni. Egy egyedi rendszer elsőre többe kerül, mint egy havidíjas program, de nincs felhasználónkénti díj, és pontosan azt tudja, amire szükséged van. Ha tíz kolléga használja öt évig, a különbség gyakran a fejlesztés javára dől el. A kérdőív a fejlesztés mellett a havi üzemeltetési költséget is megmutatja, így a kettőt össze tudod vetni, mielőtt döntenél. Ha kiderül, hogy egy kész program jobban megéri, azt is őszintén megmondom.",
      ],
    },
    example: {
      title: "Mintaprojekt: munkalap- és ügyfélkezelő egy szerviznek",
      text: "Szemléltető példa, nem valós ügyfél. Egy autó- vagy gépszerviz Excelben és papíron vezeti a munkalapokat. A webalkalmazásban a szerelő telefonon rögzíti a munkát, az iroda látja az állapotot, az ügyfél pedig SMS-t vagy e-mailt kap, ha elkészült a javítás.",
      items: ["Bejelentkezés szerepkörökkel (iroda, szerelő, admin)", "Munkalapok, ügyfelek, járművek nyilvántartása", "Értesítés az ügyfélnek elkészüléskor", "Havi kimutatás exportálással", "Adatimport a régi Excel-táblából"],
    },
    faq: [
      {
        q: "Mennyibe kerül egy webalkalmazás?",
        a: "Egy egyszerű webalkalmazás {from}-tól indul. Az ár a funkcióktól, az integrációktól és a felhasználói szerepköröktől függ.",
      },
      {
        q: "Mi a különbség egy weboldal és egy webalkalmazás között?",
        a: "A weboldal bemutat, a webalkalmazás dolgozik: bejelentkezés, adatok kezelése, folyamatok.",
      },
      { q: "Később bővíthető?", a: "Igen, modern, bővíthető alapra építek, így új funkciók bármikor jöhetnek." },
      {
        q: "Miért nem jó egy kész, előfizetéses program?",
        a: "Sokszor jó, és ha van ilyen, megmondom. Egyedi rendszer akkor éri meg, ha a kész programok a folyamatod felét nem tudják, vagy ha a felhasználónkénti havidíj hosszú távon többe kerül, mint a fejlesztés.",
      },
      {
        q: "Telefonon is használható lesz?",
        a: "Igen, minden képernyő telefonra is készül. Ha kell, a böngészőből a kezdőképernyőre telepíthető alkalmazásként is működik, alkalmazásbolt nélkül.",
      },
      {
        q: "Hol vannak az adataink, és ki fér hozzájuk?",
        a: "Biztonságos tárhelyen, titkosított kapcsolaton. Mindenki csak azt látja, amihez a szerepköre jogot ad, és rendszeres mentés készül.",
      },
      {
        q: "Össze tudod kötni a számlázóval vagy a könyvelőprogrammal?",
        a: "Ha a programnak van nyilvános kapcsolódási felülete (API), igen, például a SmartBill vagy az Oblio esetében. A kérdőív integrációnként árazza be.",
      },
      {
        q: "Mennyi ideig tart a fejlesztés?",
        a: "A legegyszerűbb változat {weeks} alatt elkészül, egy sok funkciós ügyfélportál viszont több hónap is lehet. A kérdőív a kiválasztott funkciók alapján csomagonként megmutatja a várható átfutást.",
      },
    ],
    related: [
      { href: "/mennyibe-kerul-egy-weboldal", label: "Mennyibe kerül egy weboldal?", text: "A webalkalmazások árai a weboldalak és webshopok mellett, csomagonként." },
      { href: "/weboldal-keszites", label: "Weboldal készítés", text: "Ha elég egy bemutatkozó oldal űrlappal, az jóval olcsóbb, mint egy egyedi rendszer." },
      { href: "/webshop-keszites", label: "Webshop készítés", text: "Termékeket árulnál? A Shopify sok mindent tud, amit egyedi fejlesztésben drága lenne megírni." },
    ],
  },
  {
    type: "landing",
    slug: "landing-page-keszites",
    name: "Landing page készítés",
    metaTitle: "Landing page készítés {from}-tól",
    metaDescription:
      "Landing page készítés hirdetésekhez, rendezvényekhez, termékbevezetéshez: gyors, mérhető, egy céllal. {from}-tól, árajánlattal pár perc alatt.",
    h1: "Landing page készítés kampányokhoz és termékbevezetéshez",
    intro: "Egyetlen gyors oldal egy céllal: jelentkezés, vásárlás vagy feliratkozás. Mérőkódokkal, hirdetésekhez előkészítve.",
    forWhom: ["Facebook- és Google-hirdetésekhez", "Rendezvényekhez, tanfolyamokhoz, akciókhoz", "Új termék vagy szolgáltatás bevezetéséhez"],
    priceFactors: ["A szekciók száma", "Szövegírás és vizuális elemek", "Űrlapok, hírlevél, időpontfoglalás", "Mérés és hirdetési követőkódok"],
    process: [
      {
        title: "Cél és célközönség",
        text: "Egy landing page-nek egyetlen dolga van: rávenni a látogatót egy lépésre. Először ezt tisztázzuk együtt: kinek szól, honnan érkezik (hirdetés, e-mail, plakát), és mi a siker, például jelentkezés vagy vásárlás.",
      },
      {
        title: "Üzenet és szerkezet",
        text: "Megírom a főcímet, az előnyöket, a gyakori kifogásokra adott válaszokat és a cselekvésre ösztönző gombot. A szerkezet úgy épül fel, hogy a látogató görgetés közben se felejtse el, miért jött.",
      },
      {
        title: "Design és fejlesztés",
        text: "Az oldal telefonra készül elsőként, mert a hirdetésekről érkezők nagy része onnan jön. Gyorsan kell betöltenie, mert minden plusz másodperc elveszít néhány érdeklődőt.",
      },
      {
        title: "Mérés és élesítés",
        text: "Beállítom a Google Analyticset és a Meta-pixelt, hogy lásd, melyik hirdetés hoz jelentkezőt. Élesítés után az első adatok alapján javaslatot teszek a finomításra.",
      },
    ],
    guide: {
      title: "Mire figyelj, ha landing page-et csináltatsz hirdetéshez?",
      paragraphs: [
        "A landing page akkor jó, ha a hirdetés és az oldal ugyanazt ígéri. Ha a hirdetésben -20% kedvezmény szerepel, a látogatónak az oldal tetején is azonnal ezt kell látnia. Ha keresgélnie kell, visszalép, és a hirdetésre költött pénz elveszik.",
        "Kevés, de jól választott szöveg kell. Egy erős főcím, három-négy konkrét előny, egy rövid bizonyíték (vélemény, szám, fotó), a gyakori kérdések és egy egyértelmű gomb. A hosszú bekezdéseket telefonon senki nem olvassa el, a felsorolásokat és a rövid mondatokat igen.",
        "A sebesség itt különösen számít: a hirdetésre kattintók türelmetlenek, és ha három másodpercnél tovább tölt az oldal, sokan be sem várják. Ezért nem építek nehéz oldalépítős sablonra, hanem könnyű, gyors kódra.",
        "Végül: mérés nélkül nem tudod, megéri-e. Állítsd be előre, mi számít eredménynek (jelentkezés, vásárlás, feliratkozás), és nézd meg az első hét adatait. Gyakran egyetlen főcím- vagy gombszöveg-csere is sokat javít.",
        "Gondolj arra is, mi történik a jelentkezés után. Egy automatikus visszaigazoló e-mail, egy naptárba mentés vagy egy köszönőoldal további lépéssel (például egy kedvezményes ajánlattal) sokat dob az élményen. Ezeket a kérdőív külön tételként kínálja, így te döntöd el, mi éri meg a kampányodhoz. És ha a kampány lejár, az oldal könnyen átírható a következő akcióra, nem kell mindent elölről kezdeni.",
      ],
    },
    example: {
      title: "Mintaprojekt: jelentkezési oldal egy hétvégi workshophoz",
      text: "Szemléltető példa, nem valós ügyfél. Egy tréner Facebook-hirdetéssel toborozza a résztvevőket. Az oldal elmondja, kinek szól a workshop, mit visz haza a résztvevő, mennyibe kerül és mikor lesz, a végén pedig egy rövid jelentkezési űrlap áll.",
      items: ["Főcím, előnyök, program, ár, GYIK", "Jelentkezési űrlap e-mail-értesítéssel", "Visszaszámláló a jelentkezési határidőig", "Meta-pixel és Google Analytics"],
    },
    faq: [
      { q: "Mennyibe kerül egy landing page?", a: "Egy egyszerű landing page {from}-tól készül; a szövegírás, az animációk és az integrációk felárral járnak." },
      { q: "Mennyi idő alatt készül el?", a: "Általában {weeks} alatt, a csomagtól függően." },
      { q: "Mérhető lesz a hirdetések eredménye?", a: "Igen, Google Analytics és Meta-pixel beállítással." },
      {
        q: "Miért nem elég a weboldalam egyik aloldala?",
        a: "Mert egy általános weboldalon a látogató elkalandozik: menü, más szolgáltatások, blog. A landing page-en nincs más út, csak a jelentkezés, ezért a hirdetésre költött pénz jobban megtérül.",
      },
      {
        q: "Rendezvényhez vagy tanfolyamhoz is jó?",
        a: "Igen, ez az egyik leggyakoribb felhasználás. Jelentkezési űrlappal, létszámkorláttal vagy online fizetéssel is működhet.",
      },
      {
        q: "Később át tudom írni a szöveget vagy az árat?",
        a: "Igen. Az egyszerű módosításokat te is meg tudod csinálni, a nagyobb átalakításokat pedig külön árajánlat alapján vállalom.",
      },
      {
        q: "Kell hozzá saját domain?",
        a: "Nem kötelező. Ha van céges weboldalad, a landing page futhat egy aloldalán vagy egy aldomainen (például akcio.cegnev.ro). Ha még nincs semmid, regisztrálok egy új domaint a te nevedre.",
      },
      {
        q: "Mennyi idő alatt térül meg?",
        a: "Ez a hirdetési kerettől és az ajánlattól függ. A mérés miatt viszont már az első hét után látod, hány lejbe kerül egy jelentkező, és ebből kiszámolható, megéri-e folytatni.",
      },
    ],
    related: [
      { href: "/weboldal-keszites", label: "Weboldal készítés", text: "Ha több szolgáltatást mutatnál be, egy teljes céges oldal hosszú távon többet hoz." },
      { href: "/webshop-keszites", label: "Webshop készítés", text: "Sok termékhez és rendszeres eladáshoz egy webshop a jobb választás." },
      { href: "/mennyibe-kerul-egy-weboldal", label: "Mennyibe kerül egy weboldal?", text: "A landing page ára összevetve a többi projekttípussal." },
    ],
  },
  {
    type: "redesign",
    slug: "weboldal-felujitas",
    name: "Weboldal felújítás",
    metaTitle: "Weboldal felújítás, modernizálás {from}-tól",
    metaDescription:
      "Elavult, lassú vagy mobilon rosszul működő weboldal felújítása a Google-helyezés megőrzésével. {from}-tól, tételes árajánlattal pár perc alatt.",
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
      "A Google-helyezés megőrzése és az átirányítások",
    ],
    process: [
      {
        title: "Átvilágítás",
        text: "Megnézem, mi működik és mi nem a mostani oldaladon: sebesség, mobilos megjelenés, Google-helyezések, melyik oldalt nézik a legtöbben. Ezt az ingyenes átvilágítással te magad is elindíthatod.",
      },
      {
        title: "Mi marad, mi változik",
        text: "Együtt eldöntjük, mit viszek át (szövegek, képek, logó, jól teljesítő oldalak), és mit írok újra. A Google-ben jól szereplő oldalak címe vagy megmarad, vagy átirányítást kap.",
      },
      {
        title: "Új design és fejlesztés",
        text: "Az új oldal a régi mellett, egy teszt-címen készül, így a mostani oldalad addig zavartalanul működik. Csak akkor cserélem le a régit, amikor minden kész és ellenőrzött.",
      },
      {
        title: "Átállás és utókövetés",
        text: "Az átálláskor beállítom az átirányításokat, beküldöm az új oldaltérképet a Google-nek, és néhány hétig figyelem a helyezéseket, hogy semmi ne vesszen el.",
      },
    ],
    guide: {
      title: "Mire figyelj, ha felújítanád a weboldalad?",
      paragraphs: [
        "A felújítás legnagyobb kockázata nem a design, hanem a Google-helyezés elvesztése. Ha a régi oldal címei megváltoznak, és nincs átirányítás, a keresőből érkező látogatók hibaoldalra futnak, a helyezések pedig hetek alatt eltűnhetnek. Ezért minden felújítás egy átirányítási tervvel kezdődik.",
        "Ne dobd ki azt, ami működik. Nézd meg, melyik oldalt olvassák a legtöbben, melyik szövegre jönnek megkeresések, és ezeket vidd át, csak frissebb formában. A legtöbb régi oldalon a tartalom értékesebb, mint gondolnád, csak a megjelenés és a technika avult el.",
        "Végül gondold át, mi hiányzott eddig: talán egy egyszerűbb ajánlatkérő űrlap, egy árlista, vagy az, hogy magad is át tudd írni a szövegeket. A felújítás jó alkalom arra, hogy ezeket is megoldd, és ne csak egy szebb, de ugyanúgy nehézkes oldalt kapj.",
        "Az időzítésre is érdemes figyelni. Ha a vállalkozásodnak van szezonja (például nyári szállás, karácsonyi ajándék, tavaszi kertészet), a felújítást a csendesebb hónapokra tervezd, hogy az új oldal már a forgalmas időszak előtt élesedjen, és a Google-nek is legyen ideje feldolgozni. Egy átlagos felújítás néhány hét alatt elkészül, az átirányítások és a helyezések figyelése pedig az élesítés után még pár hétig tart.",
      ],
    },
    example: {
      title: "Mintaprojekt: egy 10 éves WordPress-oldal felújítása",
      text: "Szemléltető példa, nem valós ügyfél. Egy építőipari cég régi oldala telefonon szétesik, lassan tölt be, és a bővítményei évek óta nem frissültek. A tartalom nagy része jó, csak a megjelenés és a technika avult el. A felújítás után ugyanaz a tartalom gyorsan, mobilon is jól jelenik meg.",
      items: ["8 oldal tartalmának átvitele és csiszolása", "Új, mobilra tervezett design", "Átirányítások a régi címekről", "Gyorsabb betöltés, kevesebb bővítmény", "Új ajánlatkérő űrlap"],
    },
    faq: [
      { q: "Elveszítem a Google-helyezésemet?", a: "Nem: átirányítási tervvel és a fontos oldalak megőrzésével vigyázok rá." },
      { q: "Megmaradnak a régi szövegeim?", a: "Igen, a tartalmat átviszem, és kérésre csiszolom is." },
      { q: "Mennyibe kerül a felújítás?", a: "{from}-tól; a pontos ár a régi oldal méretétől és az új funkcióktól függ." },
      {
        q: "Honnan tudom, hogy felújítás kell, vagy elég javítgatni?",
        a: "Ha csak a szövegek avultak el, elég javítani. Ha az oldal telefonon rosszul jelenik meg, lassú, vagy a bővítmények nem frissíthetők, akkor a felújítás olcsóbb, mint a folyamatos foltozás. Az ingyenes átvilágítás segít eldönteni.",
      },
      {
        q: "Wixen vagy más oldalépítőn van az oldalam. Át lehet hozni?",
        a: "Igen. A szövegeket és a képeket átviszem, a domaint pedig átirányítom az új oldalra. Az oldalépítő havidíja ezután megszűnhet.",
      },
      {
        q: "Működik a régi oldal, amíg az új készül?",
        a: "Igen, végig. Az új oldal külön helyen készül, és csak akkor cserélem le a régit, amikor minden kész és ellenőrzött.",
      },
      {
        q: "Kell új domain a felújításhoz?",
        a: "Nem. A meglévő domain marad, csak az új oldalra mutat. Így a névjegykártyákon, a hirdetésekben és a Google-ben szereplő cím is változatlan marad.",
      },
    ],
    related: [
      { href: "/atvilagitas", label: "Ingyenes weboldal-átvilágítás", text: "Nézd meg 30 másodperc alatt, mennyire gyors és Google-barát a mostani oldalad." },
      { href: "/weboldal-keszites", label: "Weboldal készítés", text: "Ha mindent újrakezdenél, nézd meg, mi kerül egy teljesen új céges oldalba." },
      { href: "/mennyibe-kerul-egy-weboldal", label: "Mennyibe kerül egy weboldal?", text: "A felújítás ára összevetve egy új oldaléval, csomagonként." },
    ],
  },
];

export const serviceByType = (type: ResolvedProjectType) => services.find((service) => service.type === type)!;
