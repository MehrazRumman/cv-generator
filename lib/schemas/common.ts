import { z } from "zod";
import type { Rules } from "./rules";

/* ------------------------------------------------------------------ */
/* Enums & constants shared by every document type                     */
/* ------------------------------------------------------------------ */

export const DOCUMENT_TYPES = ["professional", "biodata", "academic"] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const PAPER_SIZES = ["A4", "LETTER"] as const;
export type PaperSize = (typeof PAPER_SIZES)[number];

/** Latin fonts offered in the font selector. */
export const FONT_IDS = ["inter", "roboto", "lato", "open-sans", "merriweather", "source-serif", "eb-garamond"] as const;
export type FontId = (typeof FONT_IDS)[number];

/**
 * Bangla fonts used as the fallback for any Bengali characters in the document.
 * (Noto Sans Bengali is not offered: react-pdf's shaper mangles its conjuncts — see README.)
 */
export const BANGLA_FONT_IDS = ["hind-siliguri", "noto-serif-bengali"] as const;
export type BanglaFontId = (typeof BANGLA_FONT_IDS)[number];

export const PHOTO_ASPECTS = ["square", "passport"] as const; // passport = 35×45 mm
export const LANGUAGE_LEVELS = ["native", "fluent", "professional", "intermediate", "basic"] as const;

/** Bump when the stored shape changes; lib/storage runs migrations on load/import. */
export const SCHEMA_VERSION = 1;

/* ------------------------------------------------------------------ */
/* Reusable building blocks                                            */
/* ------------------------------------------------------------------ */

export function buildCommon(r: Rules) {
  /** Stable id for every repeatable entry (React keys + drag-and-drop). */
  const id = z.string().min(1);

  /** Free-text list, e.g. achievement bullets or hobbies. Edited one-per-line / as tags. */
  const textList = z.array(z.string());

  /**
   * "Jan 2022 – Present" style range. `start`/`end` are "" | "YYYY" | "YYYY-MM".
   * `current: true` renders the end as "Present" and ignores `end`.
   */
  const dateRange = z
    .object({
      start: r.partialDate(),
      end: r.partialDate(),
      current: z.boolean(),
    })
    .superRefine((v, ctx) => {
      if (!r.strict || v.current || !v.start || !v.end) return;
      // Pad so "2022" vs "2022-05" compares sensibly: start → Jan, end → Dec.
      const s = v.start.length === 4 ? `${v.start}-01` : v.start;
      const e = v.end.length === 4 ? `${v.end}-12` : v.end;
      if (e < s) ctx.addIssue({ code: "custom", path: ["end"], message: "End date is before start date" });
    });

  /** Cropped image stored as a data URL (JPEG, ~600px) so it survives in localStorage/JSON. */
  const photo = z
    .object({
      dataUrl: z.string().startsWith("data:image/"),
      aspect: z.enum(PHOTO_ASPECTS),
    })
    .nullable();

  /** Shared by Professional (as-is), Biodata (+ board) and Academic (+ thesis, supervisor). */
  const educationBase = z.object({
    id,
    degree: r.required("Degree / exam is required"),
    fieldOfStudy: z.string(),
    institution: r.required("Institution is required"),
    location: z.string(),
    period: dateRange, // Biodata shows only the end year as "Passing year".
    result: z.string(), // "CGPA 3.85/4.00", "GPA 5.00", "First Class"
  });

  /** Shared by Professional experience and Biodata occupation. */
  const experienceEntry = z.object({
    id,
    position: r.required("Position is required"),
    organization: r.required("Company / organization is required"),
    location: z.string(),
    period: dateRange,
    bullets: textList,
  });

  /** Grouped skills: Professional uses Technical/Soft/Tools, Academic uses Lab/Software/Programming. */
  const skillGroup = z.object({
    id,
    category: r.required("Group name is required"),
    items: textList,
  });

  const language = z.object({
    id,
    name: r.required("Language is required"),
    level: z.enum(LANGUAGE_LEVELS),
  });

  /** Professional "References" and Academic "Referees". */
  const referee = z.object({
    id,
    name: r.required("Name is required"),
    designation: z.string(),
    organization: z.string(),
    email: r.email(),
    phone: z.string(),
    relationship: z.string(),
  });

  return { id, textList, dateRange, photo, educationBase, experienceEntry, skillGroup, language, referee };
}

/* ------------------------------------------------------------------ */
/* Presentation settings (never part of the content)                   */
/* ------------------------------------------------------------------ */

export const baseSettingsSchema = z.object({
  /** Looked up in templates/registry; unknown ids fall back to the type's default template. */
  templateId: z.string(),
  paperSize: z.enum(PAPER_SIZES),
  fontId: z.enum(FONT_IDS),
  banglaFontId: z.enum(BANGLA_FONT_IDS),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #1f4e79"),
});

/* ------------------------------------------------------------------ */
/* Document envelope                                                   */
/* ------------------------------------------------------------------ */

/**
 * Wraps a type's content with presentation settings and section toggles:
 *
 *   { schemaVersion, type, settings, sections: { summary: true, ... }, data, updatedAt }
 *
 * `sections` is the user's on/off switch; a section is rendered only if it is ON *and* has data.
 */
export function buildDocument<
  T extends DocumentType,
  D extends z.ZodType,
  K extends string,
  X extends z.ZodRawShape,
>(type: T, data: D, sectionKeys: readonly [K, ...K[]], extraSettings: X) {
  return z.object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    type: z.literal(type),
    settings: baseSettingsSchema.extend(extraSettings),
    sections: z.record(z.enum(sectionKeys), z.boolean()),
    data,
    updatedAt: z.string(),
  });
}
