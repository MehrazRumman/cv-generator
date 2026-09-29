import { describe, expect, it } from "vitest";
import { authorListToString, formatCitation, initials, isSelf, parseAuthorList, segmentsToText, selfAuthors } from "@/lib/format/citation";
import {
  ageInYears,
  formatDateRange,
  formatNumericIsoDate,
  formatNumericPartialDate,
  formatPartialDate,
} from "@/lib/format/dates";
import { buildFileName } from "@/lib/format/filename";
import { newPublication } from "@/lib/documents/factories";

describe("dates", () => {
  it("formats partial dates", () => {
    expect(formatPartialDate("2022-01")).toBe("Jan 2022");
    expect(formatPartialDate("2022")).toBe("2022");
    expect(formatPartialDate("")).toBe("");
  });
  it("formats ranges consistently", () => {
    expect(formatDateRange({ start: "2022-01", end: "", current: true })).toBe("Jan 2022 – Present");
    expect(formatDateRange({ start: "2018", end: "2022", current: false })).toBe("2018 – 2022");
    expect(formatDateRange({ start: "", end: "2012", current: false })).toBe("2012");
    expect(formatDateRange({ start: "2020-05", end: "2020-05", current: false })).toBe("May 2020");
  });
  it("formats Europass-style numeric dates", () => {
    expect(formatNumericPartialDate("2022-03")).toBe("03/2022");
    expect(formatNumericPartialDate("2022")).toBe("2022");
    expect(formatNumericPartialDate("2022-13")).toBe("2022");
    expect(formatDateRange({ start: "2021-09", end: "", current: true }, "Current", formatNumericPartialDate)).toBe("09/2021 – Current");
    expect(formatDateRange({ start: "2015", end: "2019-06", current: false }, "Current", formatNumericPartialDate)).toBe("2015 – 06/2019");
    expect(formatNumericIsoDate("1996-03-05")).toBe("05/03/1996");
    expect(formatNumericIsoDate("05.03.1996")).toBe("05.03.1996");
  });
  it("calculates age from date of birth", () => {
    const today = new Date(2026, 8, 28);
    expect(ageInYears("1995-08-14", today)).toBe(31);
    expect(ageInYears("1995-10-01", today)).toBe(30);
    expect(ageInYears("", today)).toBeNull();
    expect(ageInYears("2030-01-01", today)).toBeNull();
  });
});

describe("file names", () => {
  const now = new Date(2026, 8, 28);
  it("uses Name_DocType_YYYY-MM-DD", () => {
    expect(buildFileName("Ayesha Rahman", "professional", "pdf", now)).toBe("Ayesha_Rahman_CV_2026-09-28.pdf");
    expect(buildFileName("Farhana Islam", "academic", "pdf", now)).toBe("Farhana_Islam_Academic_CV_2026-09-28.pdf");
    expect(buildFileName("Nusrat Jahan", "europass", "json", now)).toBe("Nusrat_Jahan_Europass_CV_2026-09-28.json");
    expect(buildFileName("আনিসুর রহমান", "political", "pdf", now)).toBe("আনিসুর_রহমান_Political_CV_2026-09-28.pdf");
  });
  it("keeps Bangla names and strips unsafe characters", () => {
    expect(buildFileName("তানভীর আহমেদ", "biodata", "pdf", now)).toBe("তানভীর_আহমেদ_Biodata_2026-09-28.pdf");
    expect(buildFileName('a/b:c*"d', "professional", "json", now)).toBe("abcd_CV_2026-09-28.json");
    expect(buildFileName("  ", "professional", "pdf", now)).toBe("Untitled_CV_2026-09-28.pdf");
  });
});

describe("authors", () => {
  it("makes initials from full, initialled and hyphenated given names without crashing mid-typing", () => {
    expect(initials("Mehraz Abdul")).toBe("M. A.");
    expect(initials("M.A.")).toBe("M. A.");
    expect(initials("Jean-Paul")).toBe("J.-P.");
    expect(initials("M.-A.")).toBe("M.-A.");
    expect(initials("Jean-")).toBe("J.");
    expect(initials("-Marie")).toBe("M.");
    expect(initials("  ")).toBe("");
  });
  it("parses both name orders and round-trips", () => {
    const authors = parseAuthorList("Islam, Farhana; Graeme Hirst;  ; Smith, J. A.");
    expect(authors).toEqual([
      { family: "Islam", given: "Farhana" },
      { family: "Hirst", given: "Graeme" },
      { family: "Smith", given: "J. A." },
    ]);
    expect(authorListToString(authors)).toBe("Islam, Farhana; Hirst, Graeme; Smith, J. A.");
  });
  it("builds initials", () => {
    expect(initials("Farhana Nahid")).toBe("F. N.");
    expect(initials("J.A.")).toBe("J. A.");
    expect(initials("Jean-Paul")).toBe("J.-P.");
  });
  it("matches the owner by family name and first initial", () => {
    const me = selfAuthors("Farhana Islam", ["Islam, F. N."]);
    expect(isSelf({ family: "Islam", given: "F." }, me)).toBe(true);
    expect(isSelf({ family: "islam", given: "Farhana N." }, me)).toBe(true);
    expect(isSelf({ family: "Islam", given: "Kazi" }, me)).toBe(false);
    expect(isSelf({ family: "Rahman", given: "Farhana" }, me)).toBe(false);
  });
});

describe("citations", () => {
  const me = selfAuthors("Farhana Islam", []);
  const article = {
    ...newPublication("journal"),
    authors: [
      { family: "Islam", given: "Farhana" },
      { family: "Hirst", given: "Graeme" },
    ],
    year: "2023",
    title: "Cross-lingual transfer",
    venue: "Computational Linguistics",
    volume: "49",
    issue: "2",
    pages: "311–349",
    doi: "10.1162/coli_a_00471",
  };

  it("formats APA 7 journal articles and bolds the owner", () => {
    const segs = formatCitation(article, "apa", me);
    expect(segmentsToText(segs)).toBe(
      "Islam, F., & Hirst, G. (2023). Cross-lingual transfer. Computational Linguistics, 49(2), 311–349. https://doi.org/10.1162/coli_a_00471",
    );
    expect(segs.find((s) => s.text === "Islam, F.")?.bold).toBe(true);
    expect(segs.find((s) => s.text === "Computational Linguistics")?.italic).toBe(true);
  });

  it("formats IEEE journal articles", () => {
    expect(segmentsToText(formatCitation(article, "ieee", me))).toBe(
      "F. Islam and G. Hirst, “Cross-lingual transfer,” Computational Linguistics, vol. 49, no. 2, pp. 311–349, 2023, doi: 10.1162/coli_a_00471.",
    );
  });

  it("uses 'in press' instead of a year", () => {
    const text = segmentsToText(formatCitation({ ...article, status: "in-press", year: "", doi: "" }, "apa", me));
    expect(text).toContain("(in press)");
  });

  it("joins three authors APA-style", () => {
    const three = { ...article, authors: [...article.authors, { family: "Chowdhury", given: "Sadia" }] };
    expect(segmentsToText(formatCitation(three, "apa", me))).toMatch(/^Islam, F\., Hirst, G\., & Chowdhury, S\. \(2023\)/);
  });
});

describe("long-word breaking", async () => {
  const { splitLongWord } = await import("@/lib/pdf/fonts");
  it("leaves normal and Bangla words whole", () => {
    expect(splitLongWord("engineering")).toEqual(["engineering"]);
    expect(splitLongWord("বিশ্ববিদ্যালয়বিশ্ববিদ্যালয়বিশ্ববিদ্যালয়")).toHaveLength(1);
  });
  it("splits long emails and URLs at natural points without losing characters", () => {
    const email = "averyveryverylongemailaddress.firstname.lastname@subdomain.example.com";
    const parts = splitLongWord(email);
    expect(parts.join("")).toBe(email);
    expect(parts.length).toBeGreaterThan(3);
    expect(Math.max(...parts.map((p) => p.length))).toBeLessThanOrEqual(20);
    expect(parts).toContain("lastname@");
  });
});

describe("segment normalisation", async () => {
  const { normalizeSegments } = await import("@/lib/format/citation");
  it("merges same-style runs and moves leading punctuation onto the previous run", () => {
    expect(
      normalizeSegments([
        { text: "Islam, F.", bold: true },
        { text: ", & Hirst, G. (2023). " },
        { text: "Journal", italic: true },
        { text: ", " },
        { text: "311–349" },
        { text: ". https://doi.org/x" },
      ]),
    ).toEqual([
      { text: "Islam, F.,", bold: true },
      { text: " & Hirst, G. (2023). " },
      { text: "Journal,", italic: true },
      { text: " 311–349. https://doi.org/x" },
    ]);
  });
});

describe("header text fitting", async () => {
  const { trackFor } = await import("@/lib/pdf/fonts");
  const { fitWords } = await import("@/templates/shared/kit");
  it("drops letter-spacing for Bangla only", () => {
    expect(trackFor("Ayesha Rahman", 2)).toBe(2);
    expect(trackFor("আয়েশা রহমান", 2)).toBe(0);
  });
  it("keeps ordinary names at full size and shrinks one that can't fit a line", () => {
    expect(fitWords("Ayesha Rahman", 174, 21)).toBe(21);
    const size = fitWords("Maximiliana Wolfeschlegelsteinhausen-Bergerdorff", 174, 21);
    expect(size).toBeLessThan(21);
    expect("Wolfeschlegelsteinhausen-Bergerdorff".length * size * 0.6).toBeLessThanOrEqual(174);
  });
});

describe("biodata dates", async () => {
  const { formatBiodataPartial } = await import("@/templates/biodata/labels");
  it("localises months and falls back to the year for impossible months", () => {
    expect(formatBiodataPartial("2021-02", "en")).toBe("Feb 2021");
    expect(formatBiodataPartial("2021-02", "bn")).toBe("ফেব্রুয়ারি ২০২১");
    expect(formatBiodataPartial("2024-13", "en")).toBe("2024");
    expect(formatBiodataPartial("2024-00", "bn")).toBe("২০২৪");
  });
});
