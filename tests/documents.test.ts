import { describe, expect, it } from "vitest";
import { emptyAcademic, emptyBiodata, emptyProfessional } from "@/lib/documents/defaults";
import { newExperience } from "@/lib/documents/factories";
import { prepareAcademic, prepareBiodata, prepareProfessional } from "@/lib/documents/prepare";
import { documentResolver } from "@/lib/documents/validation";
import { SAMPLE_VARIANTS } from "@/lib/sample-data";
import { biodataSchema, documentSchemas, DOCUMENT_TYPES, draftSchemas, professionalSchema } from "@/lib/schemas";
import { parseAnyDocument } from "@/lib/storage/migrate";

const resolve = (doc: Parameters<typeof documentResolver>[0]) =>
  documentResolver(doc, undefined, { fields: {}, shouldUseNativeValidation: false });

describe("empty sections are never shown", () => {
  it("hides every section of an empty professional CV", () => {
    const show = prepareProfessional(emptyProfessional()).show;
    expect(Object.values(show).every((v) => v === false)).toBe(true);
    expect(prepareAcademic(emptyAcademic()).show.publications).toBe(false);
  });

  it("drops blank entries and blank bullet lines", () => {
    const doc = emptyProfessional();
    doc.data.experience = [newExperience(), { ...newExperience(), position: "Engineer", bullets: ["", "Did things", "  "] }];
    const prepared = prepareProfessional(doc);
    expect(prepared.data.experience).toHaveLength(1);
    expect(prepared.data.experience[0].bullets).toEqual(["Did things"]);
    expect(prepared.show.experience).toBe(true);
  });

  it("respects section switches", () => {
    const doc = emptyProfessional();
    doc.data.summary = "Hello";
    doc.sections.summary = false;
    expect(prepareProfessional(doc).show.summary).toBe(false);
  });

  it("applies biodata modes", () => {
    const doc = emptyBiodata();
    doc.data.expectations = "Kind";
    doc.data.declaration.text = "I declare";
    doc.data.mode = "marriage";
    expect(prepareBiodata(doc).show.expectations).toBe(true);
    expect(prepareBiodata(doc).show.declaration).toBe(false);
    doc.data.mode = "job";
    expect(prepareBiodata(doc).show.expectations).toBe(false);
    expect(prepareBiodata(doc).show.declaration).toBe(true);
  });
});

describe("schemas", () => {
  it("accepts every sample in both strict and draft mode", () => {
    for (const type of DOCUMENT_TYPES) {
      for (const variant of SAMPLE_VARIANTS[type]) {
        const doc = variant.create();
        expect(draftSchemas[type].safeParse(doc).success, `${type} draft: ${variant.label}`).toBe(true);
        const strict = documentSchemas[type].safeParse(doc);
        expect(strict.success, `${type} strict: ${variant.label} ${strict.error?.message}`).toBe(true);
      }
    }
  });

  it("strict mode requires a name and valid email; draft mode doesn't", () => {
    const doc = emptyProfessional();
    doc.data.header.email = "not-an-email";
    const issues = professionalSchema.safeParse(doc).error?.issues.map((i) => i.path.join(".")) ?? [];
    expect(issues).toContain("data.header.fullName");
    expect(issues).toContain("data.header.email");
    expect(draftSchemas.professional.safeParse(doc).success).toBe(true);
  });

  it("rejects an end date before the start date", () => {
    const doc = emptyProfessional();
    doc.data.header.fullName = "A";
    doc.data.experience = [{ ...newExperience(), position: "X", organization: "Y", period: { start: "2023-05", end: "2022", current: false } }];
    const issues = professionalSchema.safeParse(doc).error?.issues ?? [];
    expect(issues.map((i) => i.message)).toContain("End date is before start date");
  });

  it("validates date of birth format", () => {
    const doc = emptyBiodata();
    doc.data.personal.fullName = "A";
    doc.data.personal.dateOfBirth = "14/08/1995";
    expect(biodataSchema.safeParse(doc).success).toBe(false);
  });
});

describe("resolver", () => {
  it("ignores errors inside sections that are switched off", async () => {
    const doc = emptyProfessional();
    doc.data.header.fullName = "Ayesha";
    doc.data.experience = [newExperience()]; // missing required position/company
    expect(Object.keys((await resolve(doc)).errors)).toContain("data");
    doc.sections.experience = false;
    expect((await resolve(doc)).errors).toEqual({});
  });
});

describe("import", () => {
  it("round-trips an exported document and rejects foreign JSON", () => {
    const doc = SAMPLE_VARIANTS.academic[0].create();
    const back = parseAnyDocument(JSON.parse(JSON.stringify(doc)));
    expect(back.ok && back.doc.type).toBe("academic");
    const bad = parseAnyDocument({ hello: "world" });
    expect(bad.ok).toBe(false);
  });
});

describe("fonts", async () => {
  const { existsSync } = await import("node:fs");
  const { BANGLA_FONTS, LATIN_FONTS } = await import("@/lib/pdf/fonts-meta");
  it("ships a file for every registered weight and italic", () => {
    for (const f of [...Object.values(LATIN_FONTS), ...Object.values(BANGLA_FONTS)]) {
      for (const w of f.weights) expect(existsSync(`public/fonts/${f.id}-${w}.ttf`), `${f.id}-${w}`).toBe(true);
      for (const w of f.italicWeights) expect(existsSync(`public/fonts/${f.id}-${w}-italic.ttf`), `${f.id}-${w}-italic`).toBe(true);
    }
  });
});

describe("migrations", () => {
  it("upgrades v1 documents (no heading font) to the current version", () => {
    const v2 = SAMPLE_VARIANTS.professional[0].create();
    const { headingFontId: _drop, ...settings } = v2.settings;
    void _drop;
    const v1 = { ...v2, schemaVersion: 1, settings };
    const result = parseAnyDocument(JSON.parse(JSON.stringify(v1)));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.doc.schemaVersion).toBe(2);
      expect(result.doc.settings.headingFontId).toBe("same");
    }
  });
});

describe("text clean-up", () => {
  it("collapses double spaces that would print stray hyphens", () => {
    const doc = emptyProfessional();
    doc.data.header.location = "Dhaka,   Bangladesh";
    doc.data.experience = [{ ...newExperience(), position: "Lead  Engineer", bullets: ["Did  a   thing"] }];
    const d = prepareProfessional(doc).data;
    expect(d.header.location).toBe("Dhaka, Bangladesh");
    expect(d.experience[0].position).toBe("Lead Engineer");
    expect(d.experience[0].bullets).toEqual(["Did a thing"]);
  });
});

describe("template registry", async () => {
  const { renderDocument } = await import("@/templates/registry");
  const { isValidElement } = await import("react");
  it("falls back to the default template for unknown ids, including Object.prototype keys", () => {
    for (const id of ["no-such-template", "constructor", "toString"]) {
      const doc = SAMPLE_VARIANTS.professional[0].create();
      doc.settings.templateId = id;
      expect(isValidElement(renderDocument(doc)), id).toBe(true);
    }
  });
});
