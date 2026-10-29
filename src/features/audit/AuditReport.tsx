"use client";

import CheckCircle from "@mui/icons-material/CheckCircle";
import ErrorOutline from "@mui/icons-material/ErrorOutlined";
import ExpandMore from "@mui/icons-material/ExpandMore";
import WarningAmber from "@mui/icons-material/WarningAmber";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { packageThemes, palette } from "@/theme/tokens";
import { CATEGORY_LABELS, slownessImpact, verdict, type AuditCategory, type AuditResult } from "./audit";
import { GROUP_LABELS, type Check, type CheckGroup, type CheckStatus } from "./checks";

const ORDER: AuditCategory[] = ["performance", "seo", "accessibility", "bestPractices"];
const GROUPS: CheckGroup[] = ["contact", "trust", "google", "measure"];
export const TONE_COLOR = { good: packageThemes.premium.solid, ok: packageThemes.standard.solid, bad: "#E5484D" } as const;
const STATUS_ICON: Record<CheckStatus, React.ReactNode> = {
  ok: <CheckCircle sx={{ fontSize: 20, color: packageThemes.premium.solid }} />,
  warn: <WarningAmber sx={{ fontSize: 20, color: packageThemes.standard.solid }} />,
  fail: <ErrorOutline sx={{ fontSize: 20, color: TONE_COLOR.bad }} />,
};

const card = { p: { xs: 2.5, md: 3 }, borderRadius: 4, background: palette.surface, border: 1, borderColor: "divider" } as const;
const h3 = { fontSize: { xs: "1.25rem", md: "1.5rem" }, mb: 1.5 } as const;

export function ScoreCards({ result }: { result: AuditResult }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
      {ORDER.map((key) => {
        const score = result.scores[key];
        const { label, tone } = verdict(score);
        return (
          <Box key={key} sx={{ p: 2, borderRadius: 3, background: palette.surface, border: 1, borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
              {CATEGORY_LABELS[key]}
            </Typography>
            <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 36, lineHeight: 1.1 }}>{score}</Typography>
            <Typography sx={{ fontWeight: 700, color: TONE_COLOR[tone] }}>{label}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

/** "Így látszik telefonon" + Google result + Facebook share card – what customers actually see. */
export function Previews({ result }: { result: AuditResult }) {
  const preview = result.inspection?.preview;
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "260px 1fr" }, gap: 3, alignItems: "start" }}>
      {result.screenshot && (
        <Box>
          <Typography variant="h3" sx={h3}>
            Így látszik telefonon
          </Typography>
          <Box sx={{ width: 220, mx: { xs: "auto", md: 0 }, p: 1, borderRadius: "28px", background: palette.ink, boxShadow: "0 18px 40px -24px rgba(14,15,18,.5)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- data: URI from the Google test */}
            <img src={result.screenshot} alt={`${preview?.host ?? "Az oldal"} telefonos nézete`} style={{ width: "100%", display: "block", borderRadius: 20 }} />
          </Box>
        </Box>
      )}
      {preview && (
        <Stack spacing={3}>
          <Box>
            <Typography variant="h3" sx={h3}>
              Így látnak a Google-ben
            </Typography>
            <Box sx={{ ...card, fontFamily: "Arial, sans-serif" }}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 0.75 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: "50%", background: palette.paper, display: "grid", placeItems: "center", overflow: "hidden" }}>
                  {preview.favicon ? (
                    // eslint-disable-next-line @next/next/no-img-element -- third-party favicon
                    <img src={preview.favicon} alt="" width={18} height={18} />
                  ) : (
                    <Box component="span" sx={{ fontSize: 12, color: palette.muted }}>?</Box>
                  )}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 14, lineHeight: 1.2 }}>{preview.host}</Typography>
                  <Typography sx={{ fontSize: 12, color: palette.muted }}>{result.url}</Typography>
                </Box>
              </Stack>
              <Typography sx={{ fontSize: 20, color: "#1a0dab", lineHeight: 1.3, fontFamily: "Arial, sans-serif" }}>
                {preview.title || <i style={{ color: TONE_COLOR.bad }}>Nincs oldalcím – a Google maga talál ki egyet</i>}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "#4d5156", mt: 0.5, fontFamily: "Arial, sans-serif", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {preview.description || <i style={{ color: TONE_COLOR.bad }}>Nincs leírás – a Google egy véletlen szövegrészletet mutat innen.</i>}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Typography variant="h3" sx={h3}>
              Így látszik, ha valaki megosztja Facebookon
            </Typography>
            <Box sx={{ maxWidth: 500, borderRadius: 2, overflow: "hidden", border: 1, borderColor: "divider", background: palette.surface }}>
              {preview.ogImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- third-party share image
                <img src={preview.ogImage} alt="" style={{ width: "100%", aspectRatio: "1.91 / 1", objectFit: "cover", display: "block", background: palette.paper }} />
              ) : (
                <Box sx={{ aspectRatio: "1.91 / 1", display: "grid", placeItems: "center", background: palette.paper, color: TONE_COLOR.bad, fontWeight: 650, px: 2, textAlign: "center" }}>
                  Nincs megosztási kép – szürke, üres kártya jelenik meg
                </Box>
              )}
              <Box sx={{ px: 1.5, py: 1.25, background: "#F0F2F5" }}>
                <Typography sx={{ fontSize: 12, color: "#65676B", textTransform: "uppercase" }}>{preview.host}</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{preview.ogTitle || "(nincs cím)"}</Typography>
                <Typography sx={{ fontSize: 14, color: "#65676B", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{preview.ogDescription}</Typography>
              </Box>
            </Box>
          </Box>
        </Stack>
      )}
    </Box>
  );
}

/** Our checklist: problems first with a reason, passed items folded into one line per group. */
export function Checklist({ checks }: { checks: Check[] }) {
  const problems = checks.filter((check) => check.status !== "ok").length;
  return (
    <Box>
      <Typography variant="h3" sx={h3}>
        Amit a Google sebességmérése nem néz: {checks.length - problems} rendben, {problems} javítandó
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        {GROUPS.map((group) => {
          const items = checks.filter((check) => check.group === group);
          if (items.length === 0) return null;
          return <GroupCard key={group} title={GROUP_LABELS[group]} items={items} />;
        })}
      </Box>
    </Box>
  );
}

function GroupCard({ title, items }: { title: string; items: Check[] }) {
  const [showOk, setShowOk] = useState(false);
  const bad = items.filter((item) => item.status !== "ok").sort((a, b) => (a.status === "fail" ? -1 : 1) - (b.status === "fail" ? -1 : 1));
  const ok = items.filter((item) => item.status === "ok");
  return (
    <Box sx={card}>
      <Typography sx={{ fontWeight: 700, mb: 1.5 }}>{title}</Typography>
      <Stack spacing={1.5}>
        {bad.map((item) => (
          <Stack key={item.id} direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
            <Box sx={{ mt: "1px" }}>{STATUS_ICON[item.status]}</Box>
            <Box>
              <Typography sx={{ fontWeight: 650 }}>{item.title}</Typography>
              {item.detail && (
                <Typography variant="body2" color="text.secondary">
                  {item.detail}
                </Typography>
              )}
            </Box>
          </Stack>
        ))}
        {bad.length === 0 && (
          <Stack direction="row" spacing={1.25}>
            {STATUS_ICON.ok}
            <Typography sx={{ fontWeight: 650 }}>Minden rendben</Typography>
          </Stack>
        )}
        {ok.length > 0 && (
          <Box>
            <ButtonBase onClick={() => setShowOk((value) => !value)} aria-expanded={showOk} sx={{ minHeight: 36, gap: 0.5, color: palette.muted, fontSize: 14, fontWeight: 600 }}>
              {ok.length} rendben
              <ExpandMore sx={{ fontSize: 18, transform: showOk ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
            </ButtonBase>
            {showOk && (
              <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                {ok.map((item) => (
                  <Stack key={item.id} direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                    {STATUS_ICON.ok}
                    <Typography variant="body2">{item.title}</Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export function ImpactBox({ result }: { result: AuditResult }) {
  const impact = slownessImpact(result.lcpMs);
  if (!impact) return null;
  return (
    <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 4, background: impact.tone === "bad" ? "#FFF1EC" : "#EAF8F1", border: 1, borderColor: "divider" }}>
      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{impact.tone === "bad" ? "Mibe kerül a lassúság?" : "Sebesség: rendben"}</Typography>
      <Typography>{impact.text}</Typography>
      {impact.tone === "bad" && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Forrás: Google / SOASTA, mobil oldalbetöltési kutatás (2017).
        </Typography>
      )}
    </Box>
  );
}

/** Two sites side by side: who wins in each category. */
export function Comparison({ own, rival }: { own: AuditResult; rival: AuditResult }) {
  const ownHost = new URL(own.url).hostname;
  const rivalHost = new URL(rival.url).hostname;
  const problems = (result: AuditResult) => result.inspection?.checks.filter((check) => check.status !== "ok").length;
  const rows: { label: string; a: number | string; b: number | string; better: "a" | "b" | null }[] = [
    ...ORDER.map((key) => ({ label: CATEGORY_LABELS[key], a: own.scores[key], b: rival.scores[key], better: own.scores[key] === rival.scores[key] ? null : own.scores[key] > rival.scores[key] ? ("a" as const) : ("b" as const) })),
    {
      label: "Fő tartalom telefonon",
      a: own.metrics.lcp,
      b: rival.metrics.lcp,
      better: own.lcpMs === undefined || rival.lcpMs === undefined || own.lcpMs === rival.lcpMs ? null : own.lcpMs < rival.lcpMs ? "a" : "b",
    },
  ];
  const ownProblems = problems(own);
  const rivalProblems = problems(rival);
  if (ownProblems !== undefined && rivalProblems !== undefined) {
    rows.push({ label: "Javítandó a listán", a: ownProblems, b: rivalProblems, better: ownProblems === rivalProblems ? null : ownProblems < rivalProblems ? "a" : "b" });
  }
  const wins = rows.filter((row) => row.better === "b").length;
  return (
    <Box sx={card}>
      <Typography variant="h3" sx={h3}>
        Te vs. versenytárs
      </Typography>
      <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", "& td, & th": { py: 1, pr: 1, borderBottom: `1px solid ${palette.line}`, textAlign: "left" }, "& th": { fontSize: 13, color: palette.muted } }}>
        <thead>
          <tr>
            <th />
            <th>{ownHost}</th>
            <th>{rivalHost}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td style={{ fontWeight: row.better === "a" ? 800 : 400, color: row.better === "a" ? TONE_COLOR.good : undefined }}>{row.a}</td>
              <td style={{ fontWeight: row.better === "b" ? 800 : 400, color: row.better === "b" ? TONE_COLOR.good : undefined }}>{row.b}</td>
            </tr>
          ))}
        </tbody>
      </Box>
      <Typography sx={{ mt: 2, fontWeight: 650 }}>
        {wins === 0 ? `Minden szempontban legalább olyan jó vagy, mint a(z) ${rivalHost}.` : `A(z) ${rivalHost} ${wins} szempontban előtted jár – ezeken érdemes javítani.`}
      </Typography>
    </Box>
  );
}
