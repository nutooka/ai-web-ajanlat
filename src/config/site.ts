/** Az éles cím (sitemap, canonical, strukturált adatok). */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nutooka.tech").replace(/\/$/, "");

/** Cégadatok és márka – egy helyen cserélhető. */
export const siteConfig = {
  /** Munkanév – a végleges név itt cserélhető. */
  name: "Nutooka Projekttervező",
  shortName: "Projekttervező",
  tagline: "Tervezd meg a weboldalad 3 perc alatt – azonnali, tételes árajánlattal.",
  company: {
    legalName: "NUTOOKA SOLUTIONS S.R.L.",
    address:
      "Strada II Rákóczi Ferenc, Nr. 84, Spațiul-birou Nr. 2S, Municipiul Odorheiu Secuiesc, Județ Harghita, România, Cod poștal 535600",
    /** EUID (European Unique Identifier) – a cégjegyzékszámot is tartalmazza. */
    registrationNumber: "ROONRC.J2023000539198",
    taxId: "49185840",
    /**
     * ÁFA: a cég jelenleg NEM ÁFA-kötelezett (ANAF, 2026. október) – az ajánlott ár a végső ár.
     * Az oldal nem ír ÁFA-t (a tulajdonos döntése: csak egy ár látszik). Ha ÁFA-kötelezett lesz, ezt újra kell gondolni.
     */
    vat: { registered: false, rate: 21 },
    /** Strukturált cím a keresőknek (schema.org PostalAddress). */
    postalAddress: {
      streetAddress: "Strada II Rákóczi Ferenc Nr. 84, Spațiul-birou Nr. 2S",
      addressLocality: "Odorheiu Secuiesc",
      addressRegion: "Harghita",
      postalCode: "535600",
      addressCountry: "RO",
    },
    /** Kiszolgált területek – a helyi kereséshez. */
    areaServed: ["Székelyudvarhely", "Hargita megye", "Erdély", "Románia", "Magyarország"],
    // Opcionális: ha kitöltöd, megjelenik az adatkezelési tájékoztatóban.
    email: "info@nutooka.tech",
    phone: "",
  },
  /**
   * Üzenetküldős kapcsolat az ajánlat oldalán. Üresen hagyva a gomb nem jelenik meg.
   * messenger: a Facebook-oldal felhasználóneve (m.me/<ez>), whatsapp: telefonszám nemzetközi formában, szóközök nélkül (pl. 40712345678).
   */
  chat: { messenger: "", whatsapp: "40753968097" },
  /** Ennyi napig érvényes az ajánlatban rögzített (kedvezményes) ár az egyeztetés kérése után. */
  offerValidityDays: 30,
  privacy: {
    lastUpdated: "2026. október 27.",
    retentionMonths: 24,
  },
} as const;
