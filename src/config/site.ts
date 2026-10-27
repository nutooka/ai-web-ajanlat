/** Cégadatok és márka – egy helyen cserélhető. */
export const siteConfig = {
  /** Munkanév – a végleges név itt cserélhető. */
  name: "Nutooka Projekttervező",
  shortName: "Projekttervező",
  tagline: "Tervezd meg a weboldalad 3 perc alatt – azonnali, tételes árajánlattal.",
  company: {
    legalName: "Nutooka Solutions SRL",
    // TODO: kitöltendő valós adatokkal
    address: "[Székhely címe]",
    registrationNumber: "[Cégjegyzékszám]",
    taxId: "[CUI]",
    email: "[kapcsolat@nutooka.ro]",
    phone: "[Telefonszám]",
  },
  privacy: {
    lastUpdated: "2026. október 27.",
    retentionMonths: 24,
  },
} as const;
