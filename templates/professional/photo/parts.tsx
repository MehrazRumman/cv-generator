import { Circle, Image, Link, Path, Rect, Svg, Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ReactNode } from "react";
import { formatDateRange, formatPartialDate } from "@/lib/format/dates";
import { hasText, joinParts } from "@/lib/format/text";
import type { PreparedProfessional } from "@/lib/documents/prepare";
import type { ProfessionalSection } from "@/lib/schemas";
import { contactItems, LEVEL_LABEL, SECTION_TITLES, type ContactItem } from "../blocks";

/* ------------------------------------------------------------------ */
/* Icons (stroke icons on a 24×24 grid, drawn as vector paths)         */
/* ------------------------------------------------------------------ */

type Shape = { d: string } | { cx: number; cy: number; r: number } | { x: number; y: number; w: number; h: number; rx?: number };

const ICONS = {
  phone: [
    { d: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" },
  ],
  mail: [{ x: 2, y: 4, w: 20, h: 16, rx: 2 }, { d: "M22 6l-10 7L2 6" }],
  pin: [{ d: "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" }, { cx: 12, cy: 10, r: 3 }],
  globe: [{ cx: 12, cy: 12, r: 10 }, { d: "M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" }],
  linkedin: [{ d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" }, { x: 2, y: 9, w: 4, h: 12 }, { cx: 4, cy: 4, r: 2 }],
  code: [{ d: "M16 18l6-6-6-6M8 6l-6 6 6 6" }],
  user: [{ d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }, { cx: 12, cy: 7, r: 4 }],
  briefcase: [{ x: 2, y: 7, w: 20, h: 14, rx: 2 }, { d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" }],
  cap: [{ d: "M22 10L12 5 2 10l10 5 10-5z" }, { d: "M6 12v5c3 3 9 3 12 0v-5" }],
  star: [{ d: "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2-6.2 3.2L7 14.1 2 9.3l6.9-1L12 2z" }],
  award: [{ cx: 12, cy: 8, r: 7 }, { d: "M8.2 13.9L7 23l5-3 5 3-1.2-9.1" }],
  folder: [{ d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" }],
  users: [{ d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }, { cx: 9, cy: 7, r: 4 }, { d: "M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" }],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof ICONS;

export const SECTION_ICON: Record<Exclude<ProfessionalSection, "photo">, IconName> = {
  summary: "user",
  experience: "briefcase",
  education: "cap",
  skills: "star",
  projects: "folder",
  certifications: "award",
  languages: "globe",
  references: "users",
};

const CONTACT_ICON: Record<string, IconName> = { phone: "phone", email: "mail", location: "pin", linkedin: "linkedin", github: "code", portfolio: "globe" };

export function Icon({ name, size = 10, color, strokeWidth = 2 }: { name: IconName; size?: number; color: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {ICONS[name].map((shape: Shape, i) =>
        "d" in shape ? (
          <Path key={i} d={shape.d} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ) : "r" in shape ? (
          <Circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} stroke={color} strokeWidth={strokeWidth} fill="none" />
        ) : (
          <Rect key={i} x={shape.x} y={shape.y} width={shape.w} height={shape.h} rx={shape.rx ?? 0} stroke={color} strokeWidth={strokeWidth} fill="none" />
        ),
      )}
    </Svg>
  );
}

/** Icon inside a filled circle (used on timelines and pill headings). */
export function IconBadge({ name, size = 16, bg, color }: { name: IconName; size?: number; bg: string; color: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Icon name={name} size={size * 0.56} color={color} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Name & photo                                                        */
/* ------------------------------------------------------------------ */

/** "Ayesha Rahman" → { first: "Ayesha", last: "Rahman" }; a single word goes in `first`. */
export function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return { first: parts[0] ?? "", last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

/**
 * Font size at which `text` fits `lines` lines of `width` points — for names and titles inside
 * fixed-height bands, where overflowing text would spill out of the band. Estimated from the
 * character count (bold capitals ≈ 0.72em wide, mixed case ≈ 0.58em) plus letter-spacing.
 */
export function fitText(
  text: string,
  width: number,
  base: number,
  { lines = 2, min = 12, upper = false, tracking = 0 }: { lines?: number; min?: number; upper?: boolean; tracking?: number } = {},
): number {
  const len = Math.max(text.trim().length, 1);
  const charWidth = upper ? 0.72 : 0.58;
  const fitting = ((width * lines * 0.92) / len - tracking) / charWidth;
  return Math.max(min, Math.min(base, Math.floor(fitting * 10) / 10));
}

export function initialsOf(fullName: string): string {
  const { first, last } = splitName(fullName);
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "CV";
}

/**
 * Round photo with an optional ring. Without a photo (or with the photo switched off) it shows the
 * person's initials, so photo-led designs still look complete.
 */
export function Avatar({
  doc,
  size,
  ring = 0,
  ringColor = "#ffffff",
  gap = 0,
  fallbackBg,
  fallbackColor = "#ffffff",
  square = false,
  style,
}: {
  doc: PreparedProfessional;
  size: number;
  ring?: number;
  ringColor?: string;
  gap?: number;
  fallbackBg: string;
  fallbackColor?: string;
  square?: boolean;
  style?: Style;
}) {
  const photo = doc.show.photo ? doc.data.photo : null;
  const inner = size - 2 * (ring + gap);
  const radius = square ? 6 : size / 2;
  const innerRadius = square ? 4 : inner / 2;
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: radius, borderWidth: ring, borderColor: ringColor, padding: gap, alignItems: "center", justifyContent: "center" },
        style ?? {},
      ]}
    >
      {photo ? (
        // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf <Image> has no alt attribute
        <Image src={photo.dataUrl} style={{ width: inner, height: inner, borderRadius: innerRadius, objectFit: "cover" }} />
      ) : (
        <View style={{ width: inner, height: inner, borderRadius: innerRadius, backgroundColor: fallbackBg, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: inner * 0.36, fontWeight: 700, color: fallbackColor, letterSpacing: 1 }}>{initialsOf(doc.data.header.fullName)}</Text>
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Side-column sections                                                */
/* ------------------------------------------------------------------ */

export interface SideStyle {
  /** Heading for a side section; `icon` is set for templates that show one. */
  heading: (title: string, icon: IconName) => ReactNode;
  text: Style;
  strong: Style;
  muted: Style;
  iconColor: string;
  /** Colour of level bars / dots for languages. */
  barColor?: string;
  barTrack?: string;
  gap?: number;
}

const LEVEL_PERCENT = { native: 1, fluent: 0.9, professional: 0.75, intermediate: 0.55, basic: 0.35 } as const;

function Block({ st, title, icon, children }: { st: SideStyle; title: string; icon: IconName; children: ReactNode }) {
  return (
    <View style={{ marginBottom: st.gap ?? 14 }} wrap={false}>
      {st.heading(title, icon)}
      {children}
    </View>
  );
}

export function ContactRows({ items, st, labelWidth }: { items: ContactItem[]; st: SideStyle; labelWidth: number }) {
  return (
    <>
      {items.map((c) => {
        const fontSize = typeof st.text.fontSize === "number" ? st.text.fontSize : 8.5;
        const size = Math.min(fontSize, (labelWidth / Math.max(c.text.length, 1)) * 1.9);
        // The link lives inside the Text (inline); a <Link> as a flex child mis-measures its height.
        return (
          <View key={c.key} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
            <View style={{ width: 14 }}>
              <Icon name={CONTACT_ICON[c.key] ?? "globe"} size={8.5} color={st.iconColor} />
            </View>
            <Text style={[st.text, { fontSize: Math.max(6.5, size), flex: 1 }]}>
              {c.href ? (
                <Link src={c.href} style={{ textDecoration: "none", color: st.text.color }}>
                  {c.text}
                </Link>
              ) : (
                c.text
              )}
            </Text>
          </View>
        );
      })}
    </>
  );
}

export function SideContact({ doc, st, width, title = "Contact" }: { doc: PreparedProfessional; st: SideStyle; width: number; title?: string }) {
  const items = contactItems(doc);
  if (!items.length) return null;
  return (
    <Block st={st} title={title} icon="phone">
      <ContactRows items={items} st={st} labelWidth={width - 14} />
    </Block>
  );
}

export function SideSummary({ doc, st, title = "About Me" }: { doc: PreparedProfessional; st: SideStyle; title?: string }) {
  if (!doc.show.summary) return null;
  return (
    <Block st={st} title={title} icon="user">
      <Text style={[st.text, { lineHeight: 1.45 }]}>{doc.data.summary.trim()}</Text>
    </Block>
  );
}

export function SideEducation({ doc, st }: { doc: PreparedProfessional; st: SideStyle }) {
  if (!doc.show.education) return null;
  return (
    <Block st={st} title={SECTION_TITLES.education} icon="cap">
      {doc.data.education.map((e) => (
        <View key={e.id} style={{ marginBottom: 6 }}>
          {formatDateRange(e.period, "Expected") ? <Text style={[st.muted, { marginBottom: 1 }]}>{formatDateRange(e.period, "Expected")}</Text> : null}
          <Text style={st.strong}>{joinParts([e.degree, e.fieldOfStudy], " in ")}</Text>
          <Text style={st.text}>{e.institution}</Text>
          {hasText(e.result) ? <Text style={st.muted}>{e.result}</Text> : null}
        </View>
      ))}
    </Block>
  );
}

export function SideSkills({ doc, st, grouped = true }: { doc: PreparedProfessional; st: SideStyle; grouped?: boolean }) {
  if (!doc.show.skills) return null;
  return (
    <Block st={st} title={SECTION_TITLES.skills} icon="star">
      {doc.data.skills.map((g) => (
        <View key={g.id} style={{ marginBottom: 4 }}>
          {grouped && doc.data.skills.length > 1 ? <Text style={[st.strong, { marginBottom: 1 }]}>{g.category}</Text> : null}
          {g.items.map((item, i) => (
            <Text key={i} style={[st.text, { marginBottom: 1 }]}>
              • {item}
            </Text>
          ))}
        </View>
      ))}
    </Block>
  );
}

export function SideLanguages({ doc, st, bars = false }: { doc: PreparedProfessional; st: SideStyle; bars?: boolean }) {
  if (!doc.show.languages) return null;
  return (
    <Block st={st} title={SECTION_TITLES.languages} icon="globe">
      {doc.data.languages.map((l) =>
        bars ? (
          <View key={l.id} style={{ marginBottom: 5 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={st.text}>{l.name}</Text>
              <Text style={st.muted}>{LEVEL_LABEL[l.level]}</Text>
            </View>
            <View style={{ height: 3, borderRadius: 1.5, backgroundColor: st.barTrack ?? "#d4d4d4", marginTop: 2 }}>
              <View style={{ width: `${LEVEL_PERCENT[l.level] * 100}%`, height: 3, borderRadius: 1.5, backgroundColor: st.barColor ?? st.iconColor }} />
            </View>
          </View>
        ) : (
          <Text key={l.id} style={[st.text, { marginBottom: 1.5 }]}>
            • {l.name} <Text style={st.muted}>({LEVEL_LABEL[l.level]})</Text>
          </Text>
        ),
      )}
    </Block>
  );
}

export function SideCertifications({ doc, st }: { doc: PreparedProfessional; st: SideStyle }) {
  if (!doc.show.certifications) return null;
  return (
    <Block st={st} title={SECTION_TITLES.certifications} icon="award">
      {doc.data.certifications.map((c) => (
        <View key={c.id} style={{ marginBottom: 4 }}>
          <Text style={st.strong}>{c.name}</Text>
          <Text style={st.muted}>{joinParts([c.issuer, formatPartialDate(c.date)], ", ")}</Text>
        </View>
      ))}
    </Block>
  );
}

export function SideReferences({ doc, st }: { doc: PreparedProfessional; st: SideStyle }) {
  if (!doc.show.references) return null;
  const r = doc.data.references;
  return (
    <Block st={st} title={SECTION_TITLES.references} icon="users">
      {r.mode === "on-request" ? (
        <Text style={st.text}>Available on request.</Text>
      ) : (
        r.items.map((ref) => (
          <View key={ref.id} style={{ marginBottom: 5 }}>
            <Text style={st.strong}>{ref.name}</Text>
            {hasText(ref.designation) || hasText(ref.organization) ? <Text style={st.text}>{joinParts([ref.designation, ref.organization], ", ")}</Text> : null}
            {hasText(ref.phone) ? <Text style={st.muted}>{ref.phone}</Text> : null}
            {hasText(ref.email) ? <Text style={st.muted}>{ref.email}</Text> : null}
          </View>
        ))
      )}
    </Block>
  );
}
