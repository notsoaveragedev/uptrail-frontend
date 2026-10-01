import { palettes } from "@/theme/palette";
import type { OverallStatus } from "@/types/statusPage";
import { OVERALL_STATUS_SHORT_LABELS } from "./statusTheme";

export type BadgeEmbedFormat = "markdown" | "html" | "url";

const HEIGHT = 20;
const PADDING = 6;
const LABEL_BACKGROUND = "#555555";
const FONT = "Verdana,Geneva,DejaVu Sans,sans-serif";

const BADGE_COLORS: Record<OverallStatus, string> = {
  operational: palettes.light.up,
  degraded: palettes.light.degraded,
  partial_outage: palettes.light.accent,
  major_outage: palettes.light.down,
  maintenance: palettes.light.maintenance,
};

function charWidth(char: string) {
  if ("ijlt.,:;!|' ".includes(char)) return 3.6;
  if ("frI()[]".includes(char)) return 4.6;
  if ("mwMW".includes(char)) return 10;
  if (char >= "A" && char <= "Z") return 7.6;
  return 6.6;
}

function textWidth(text: string) {
  return Math.round([...text].reduce((sum, char) => sum + charWidth(char), 0));
}

function escapeXml(text: string) {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function segmentText(text: string, centerX: number) {
  const safe = escapeXml(text);
  return (
    `<text x="${centerX}" y="15" fill="#010101" fill-opacity=".3">${safe}</text>` +
    `<text x="${centerX}" y="14" fill="#fff">${safe}</text>`
  );
}

export function statusBadgeSvg(label: string, status: OverallStatus) {
  const message = OVERALL_STATUS_SHORT_LABELS[status];
  const labelWidth = textWidth(label) + PADDING * 2;
  const messageWidth = textWidth(message) + PADDING * 2;
  const width = labelWidth + messageWidth;
  const title = escapeXml(`${label}: ${message}`);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${HEIGHT}" role="img" aria-label="${title}">`,
    `<title>${title}</title>`,
    `<linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>`,
    `<clipPath id="r"><rect width="${width}" height="${HEIGHT}" rx="3" fill="#fff"/></clipPath>`,
    `<g clip-path="url(#r)">`,
    `<rect width="${labelWidth}" height="${HEIGHT}" fill="${LABEL_BACKGROUND}"/>`,
    `<rect x="${labelWidth}" width="${messageWidth}" height="${HEIGHT}" fill="${BADGE_COLORS[status]}"/>`,
    `<rect width="${width}" height="${HEIGHT}" fill="url(#s)"/>`,
    `</g>`,
    `<g text-anchor="middle" font-family="${FONT}" font-size="11">`,
    segmentText(label, labelWidth / 2),
    segmentText(message, labelWidth + messageWidth / 2),
    `</g>`,
    `</svg>`,
  ].join("");
}

export function statusBadgeDataUri(label: string, status: OverallStatus) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(statusBadgeSvg(label, status))}`;
}

export function statusBadgeUrl(slug: string, origin: string) {
  return `${origin}/badge/${slug}.svg`;
}

export function statusBadgeEmbeds(slug: string, title: string, origin: string): Record<BadgeEmbedFormat, string> {
  const url = statusBadgeUrl(slug, origin);
  const pageUrl = `${origin}/status/${slug}`;
  const alt = `${title} status`;
  return {
    markdown: `[![${alt}](${url})](${pageUrl})`,
    html: `<a href="${pageUrl}"><img src="${url}" alt="${escapeXml(alt)}" height="20"></a>`,
    url,
  };
}
