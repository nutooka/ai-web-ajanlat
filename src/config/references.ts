/** Korábbi munkák a főoldalon. Új referencia: kép a public/references mappába, és egy új sor ide. */
export interface Reference {
  name: string;
  url: string;
  image: string;
  kind: string;
  summary: string;
  tags: string[];
}

export const references: Reference[] = [
  {
    name: "SortYourS",
    url: "https://sortyours.com/",
    image: "/references/sortyours.jpg",
    kind: "Termékoldal iPhone-apphoz",
    summary: "Bemutató és várólista-oldal egy teendő-, cél- és szokáskövető apphoz: sötét, letisztult design, animált telefonos előnézet, e-mailes feliratkozás.",
    tags: ["Landing page", "Várólista", "Reszponzív"],
  },
];
