import { Document, Image, Link, Page, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { normalizeSegments, type Segment } from "@/lib/format/citation";
import { fontStack, hasBangla, trackFor } from "@/lib/pdf/fonts";
import type { BanglaFontId, FontId, PaperSize } from "@/lib/schemas";

export { trackFor };

/** Cancels a style's letter spacing when the text is Bangla (see trackFor). */
export const untracked = (text: string): Style => (hasBangla(text) ? { letterSpacing: 0 } : {});

/* ------------------------------------------------------------------ */
/* Kit: the per-template style sheet that shared section renderers use  */
/* ------------------------------------------------------------------ */

export interface KitStyles {
  paragraph: Style;
  entry: Style;
  entryHead: Style;
  entryTitle: Style;
  entrySubtitle: Style;
  entryDate: Style;
  entryMeta: Style;
  bulletRow: Style;
  bullet: Style;
  bulletText: Style;
  label: Style;
  link: Style;
  section: Style;
}

export interface Kit {
  s: KitStyles;
  /** Section heading. `id` is the section key (e.g. "experience"), for templates that show icons. */
  Heading: (props: { title: string; id?: string }) => ReactNode;
  bulletChar: string;
  /**
   * "stacked": title/date on one row. "dateBelow": date on its own line under the subtitle (narrow
   * columns). "dateColumn": dates in a left gutter (moderncv style).
   */
  entryLayout: "stacked" | "dateBelow" | "dateColumn";
  dateColumnWidth: number;
  /** Alignment of dates inside the date column (default "left"; Europass right-aligns them against a rule). */
  dateColumnAlign?: "left" | "right";
  /**
   * Optional timeline rail for stacked/dateBelow entries: `style` (e.g. a left border + padding) is
   * applied to the entry head and to each continuation bullet, `marker` (absolutely positioned, e.g. a
   * dot on the line) is drawn at the entry title, and `gap` is the space kept below each entry.
   */
  rail?: { style: Style; marker?: ReactNode; gap: number };
}

/* ------------------------------------------------------------------ */
/* Document & page                                                     */
/* ------------------------------------------------------------------ */

export interface PageSettings {
  paperSize: PaperSize;
  fontId: FontId;
  headingFontId: FontId | "same";
  banglaFontId: BanglaFontId;
}

/** Font for names and section headings: the chosen heading font, or the body font when "same". */
export function headingFont(settings: PageSettings): Style {
  const id = settings.headingFontId === "same" ? settings.fontId : settings.headingFontId;
  return { fontFamily: fontStack(id, settings.banglaFontId) };
}

export function PdfDocument({
  title,
  author,
  settings,
  pageStyle,
  children,
  pageNumbers = true,
  numberColor = "#888888",
  numberBottom = 18,
  background,
}: {
  title: string;
  author: string;
  settings: PageSettings;
  pageStyle: Style;
  children: ReactNode;
  pageNumbers?: boolean;
  numberColor?: string;
  numberBottom?: number;
  /** Fixed decoration drawn behind every page (sidebars, frames). */
  background?: ReactNode;
}) {
  return (
    <Document title={title} author={author} creator="CV Generator" producer="CV Generator">
      <Page
        size={settings.paperSize}
        style={[{ fontFamily: fontStack(settings.fontId, settings.banglaFontId) }, pageStyle]}
        wrap
      >
        {background}
        {children}
        {pageNumbers && (
          <Text
            fixed
            style={{ position: "absolute", bottom: numberBottom, left: 0, right: 0, textAlign: "center", fontSize: 7.5, color: numberColor }}
            render={({ pageNumber, totalPages }) => (totalPages > 1 ? `${pageNumber} / ${totalPages}` : "")}
          />
        )}
      </Page>
    </Document>
  );
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

/**
 * Section heading + content, rendered as a *fragment* so entries stay direct children of the page.
 * (react-pdf mis-paginates when an unbreakable block is the first child of a nested breakable View:
 * it keeps the block on the current page and squashes it. A flat tree avoids that.)
 *
 * The heading is glued to the first item so it is never stranded at a page bottom: an <Entry>
 * receives it as `lead` (inside its unbreakable head); any other first child is wrapped with it.
 * `kit.s.section` styles the heading wrapper (use marginTop for spacing between sections).
 */
export function Section({ kit, title, id, children }: { kit: Kit; title: string; id?: string; children: ReactNode }) {
  // In the date-column layout, non-entry content (paragraphs, skill lines) aligns with entry text.
  const indent = kit.entryLayout === "dateColumn" ? kit.dateColumnWidth : 0;
  const isEntry = (node: ReactNode) => isValidElement<EntryProps>(node) && node.type === Entry;
  const aligned = (node: ReactNode, key: number) =>
    isEntry(node) || !indent ? node : <View key={key} style={{ paddingLeft: indent }}>{node}</View>;

  const [first, ...rest] = Children.toArray(children);
  const heading = <View style={kit.s.section}>{kit.Heading({ title, id })}</View>;
  const glued =
    isValidElement<EntryProps>(first) && first.type === Entry ? (
      cloneElement(first, { lead: heading })
    ) : (
      <View wrap={false}>
        {heading}
        {aligned(first, -1)}
      </View>
    );
  return (
    <>
      {glued}
      {rest.map((node, i) => aligned(node, i))}
    </>
  );
}

export function Bullets({ kit, items, rowStyle, lastRowStyle }: { kit: Kit; items: string[]; rowStyle?: Style; lastRowStyle?: Style }) {
  return (
    <>
      {items.map((item, i) => (
        <View
          key={i}
          // On a timeline rail, spacing must be padding (inside the border) or the line shows gaps.
          style={[
            kit.s.bulletRow,
            rowStyle ? { marginTop: 0, paddingTop: typeof kit.s.bulletRow.marginTop === "number" ? kit.s.bulletRow.marginTop : 2 } : {},
            rowStyle ?? {},
            i === items.length - 1 && lastRowStyle ? lastRowStyle : {},
          ]}
          wrap={false}
        >
          <Text style={kit.s.bullet}>{kit.bulletChar}</Text>
          <Text style={kit.s.bulletText}>{item}</Text>
        </View>
      ))}
    </>
  );
}

/** Styled runs (bold own name, italic journal) inside one flowing paragraph. */
export function Rich({ segments, style, textIndent }: { segments: Segment[]; style?: Style | Style[]; textIndent?: number }) {
  // react-pdf takes textIndent from the first run, and nested runs don't inherit it — so pass it to every run.
  return (
    <Text style={[...(Array.isArray(style) ? style : style ? [style] : []), textIndent ? { textIndent } : {}]}>
      {normalizeSegments(segments).map((seg, i) =>
        seg.bold || seg.italic ? (
          <Text key={i} style={{ fontWeight: seg.bold ? 700 : undefined, fontStyle: seg.italic ? "italic" : undefined, textIndent }}>
            {seg.text}
          </Text>
        ) : (
          seg.text
        ),
      )}
    </Text>
  );
}

export interface EntryProps {
  kit: Kit;
  title: string;
  subtitle?: string;
  date?: string;
  meta?: string;
  bullets?: string[];
  children?: ReactNode;
  /** Rendered above the entry inside its unbreakable head (used by <Section> for the heading). */
  lead?: ReactNode;
}

/**
 * One experience/education/project entry. The head (title, subtitle, meta, extra children) and the
 * first bullet form one unbreakable block, so a heading is never stranded at the bottom of a page;
 * the remaining bullets may continue on the next page, each kept whole.
 */
export function Entry({ kit, title, subtitle, date, meta, bullets = [], children, lead }: EntryProps) {
  const { s } = kit;
  const [first, ...rest] = bullets;
  const stackedLead = kit.entryLayout !== "dateColumn" ? lead : null;
  // Only one unbreakable level: when the date-column layout already wraps lead + entry, the head flows inside it.
  const nested = kit.entryLayout === "dateColumn" && lead != null;
  // Timeline rail (stacked layouts only). The rail style goes on the head block and on each
  // continuation bullet row — never on a wrapping View, which react-pdf would mis-paginate.
  const rail = kit.entryLayout !== "dateColumn" ? kit.rail : undefined;
  const gap = rail ? { paddingBottom: rail.gap } : undefined;
  const top = (
    <>
      {rail?.marker}
      {kit.entryLayout === "stacked" ? (
        <>
          <View style={s.entryHead}>
            <Text style={[s.entryTitle, { flex: 1 }, untracked(title)]}>{title}</Text>
            {date ? <Text style={s.entryDate}>{date}</Text> : null}
          </View>
          {subtitle ? <Text style={s.entrySubtitle}>{subtitle}</Text> : null}
        </>
      ) : (
        <>
          <Text style={[s.entryTitle, untracked(title)]}>{title}</Text>
          {subtitle ? <Text style={s.entrySubtitle}>{subtitle}</Text> : null}
          {kit.entryLayout === "dateBelow" && date ? <Text style={[s.entryDate, { textAlign: "left", marginLeft: 0 }]}>{date}</Text> : null}
        </>
      )}
      {meta ? <Text style={s.entryMeta}>{meta}</Text> : null}
      {children}
      {first !== undefined ? <Bullets kit={kit} items={[first]} /> : null}
    </>
  );
  const head = (
    <View wrap={nested ? undefined : false}>
      {stackedLead}
      {rail ? <View style={[rail.style, rest.length === 0 && gap ? gap : {}]}>{top}</View> : top}
    </View>
  );
  const body = (
    <>
      {head}
      <Bullets kit={kit} items={rest} rowStyle={rail?.style} lastRowStyle={gap} />
    </>
  );

  if (kit.entryLayout === "dateColumn") {
    // The date sits absolutely in the left gutter of an indented column. (A flex row here makes
    // react-pdf collapse the title lines when the entry lands near a page break.)
    const dateLabel = (
      <Text
        style={[
          s.entryDate,
          { position: "absolute", top: 0, left: -kit.dateColumnWidth, width: kit.dateColumnWidth - 8, textAlign: kit.dateColumnAlign ?? "left", marginLeft: 0 },
        ]}
      >
        {date ?? ""}
      </Text>
    );
    const indented = (
      <View style={[s.entry, { paddingLeft: kit.dateColumnWidth }]}>
        <View>
          {dateLabel}
          {body}
        </View>
      </View>
    );
    return lead ? (
      <View wrap={false}>
        {lead}
        {indented}
      </View>
    ) : (
      indented
    );
  }
  return <View style={[s.entry, rail ? { marginBottom: 0 } : {}]}>{body}</View>;
}

/** "Label: value" line used for skills and similar groups. */
export function LabeledLine({ kit, label, value }: { kit: Kit; label: string; value: string }) {
  // In narrow columns the label gets its own line; mixing a bold run and a long value there makes
  // react-pdf's line breaker produce ragged, awkward breaks.
  if (kit.entryLayout === "dateBelow") {
    return (
      <View style={{ marginBottom: 4 }} wrap={false}>
        <Text style={[kit.s.paragraph, kit.s.label]}>{label}</Text>
        <Text style={kit.s.paragraph}>{value}</Text>
      </View>
    );
  }
  return (
    <Text style={[kit.s.paragraph, { marginBottom: 2 }]}>
      <Text style={kit.s.label}>{label}: </Text>
      {value}
    </Text>
  );
}

export function PdfLink({ href, children, style }: { href: string; children: ReactNode; style?: Style }) {
  return (
    <Link src={href} style={[{ textDecoration: "none" }, style ?? {}]}>
      {children}
    </Link>
  );
}

export function Photo({ src, width, aspect, style }: { src: string; width: number; aspect: "square" | "passport"; style?: Style }) {
  const height = aspect === "square" ? width : Math.round((width * 45) / 35);
  // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf <Image> has no alt attribute
  return <Image src={src} style={[{ width, height, objectFit: "cover" }, style ?? {}]} />;
}

/** Mixes a hex colour with white; `amount` 0 → original, 1 → white. Used for tints of the accent. */
export function tint(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Mixes a hex colour with black; `amount` 0 → original, 1 → black. Used for dark variants of the accent. */
export function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c * (1 - amount));
  return `#${((1 << 24) | (mix((n >> 16) & 255) << 16) | (mix((n >> 8) & 255) << 8) | mix(n & 255)).toString(16).slice(1)}`;
}

/** Validated accent colour, falling back to a neutral navy if the stored value is malformed. */
export const accentOf = (hex: string) => (/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#1f4e79");

/**
 * Font size that lets a single-line item (email, URL) fit `width` points, estimated from an average
 * glyph width of ~0.53em. Used for narrow columns such as sidebars.
 */
export function fitFontSize(text: string, width: number, size: number, min = 6.5): number {
  const estimate = text.length * size * 0.53;
  return estimate <= width ? size : Math.max(min, Math.floor((width / (text.length * 0.53)) * 10) / 10);
}

/**
 * Font size at which every word of `text` fits `width` points on one line. Names wrap only at spaces,
 * so one long word (a double-barrelled surname) would otherwise run off the page or under the next
 * column. Estimated from the character count: capitals ≈ 0.72em wide, mixed case ≈ 0.6em.
 */
export function fitWords(text: string, width: number, size: number, { upper = false, tracking = 0, min = 8 } = {}): number {
  const longest = Math.max(1, ...text.trim().split(/\s+/).map((w) => w.length));
  const fitting = ((width * 0.95) / longest - tracking) / (upper ? 0.72 : 0.6);
  return Math.max(min, Math.min(size, Math.floor(fitting * 10) / 10));
}
