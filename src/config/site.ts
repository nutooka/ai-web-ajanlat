/** Cégadatok és márka – egy helyen cserélhető. */
export const siteConfig = {
  /** Munkanév – a végleges név itt cserélhető. */
  name: "Nutooka Projekttervező",
  shortName: "Projekttervező",
  tagline: "Tervezd meg a weboldalad 4 perc alatt – azonnali, tételes árajánlattal.",
  company: {
    legalName: "NUTOOKA SOLUTIONS S.R.L.",
    address:
      "Strada II Rákóczi Ferenc, Nr. 84, Spațiul-birou Nr. 2S, Municipiul Odorheiu Secuiesc, Județ Harghita, România, Cod poștal 535600",
    /** EUID (European Unique Identifier) – a cégjegyzékszámot is tartalmazza. */
    registrationNumber: "ROONRC.J2023000539198",
    taxId: "49185840",
    // Opcionális: ha kitöltöd, megjelenik az adatkezelési tájékoztatóban.
    email: "info@nutooka.tech",
    phone: "",
  },
  privacy: {
    lastUpdated: "2026. október 27.",
    retentionMonths: 24,
  },
} as const;
