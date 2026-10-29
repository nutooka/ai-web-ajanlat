"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import MailOutline from "@mui/icons-material/MailOutlined";
import Search from "@mui/icons-material/Search";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { startPlanner } from "@/components/home/startPlanner";
import { trackStep } from "@/features/funnel/track";
import { packageThemes, palette } from "@/theme/tokens";
import { CATEGORY_LABELS, verdict, type AuditCategory, type AuditResult } from "./audit";

const ORDER: AuditCategory[] = ["performance", "seo", "accessibility", "bestPractices"];
const TONE_COLOR = { good: packageThemes.premium.solid, ok: packageThemes.standard.solid, bad: "#E5484D" } as const;
const WAIT_STEPS = ["Megnyitjuk az oldalt telefonos nézetben…", "Mérjük a betöltési sebességet…", "Ellenőrizzük a Google-megjelenést…", "Összeállítjuk az eredményt…"];

type State = { kind: "idle" } | { kind: "running"; url: string } | { kind: "done"; result: AuditResult } | { kind: "error"; message: string };

/** Free website check: address → Google mobile test → Hungarian verdict → full report by e-mail → renovation offer. */
export function AuditTool() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [waitStep, setWaitStep] = useState(0);

  useEffect(() => {
    if (state.kind !== "running") return;
    const timer = window.setInterval(() => setWaitStep((step) => Math.min(step + 1, WAIT_STEPS.length - 1)), 7000);
    return () => window.clearInterval(timer);
  }, [state.kind]);

  const run = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    setWaitStep(0);
    setState({ kind: "running", url: input.trim() });
    trackStep("audit_run");
    try {
      const response = await fetch("/api/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: input }) });
      const body = (await response.json().catch(() => null)) as { ok: true; result: AuditResult } | { ok: false; error: string } | null;
      if (body?.ok) setState({ kind: "done", result: body.result });
      else setState({ kind: "error", message: body?.error ?? "A mérés nem sikerült. Próbáld újra." });
    } catch {
      setState({ kind: "error", message: "Nem sikerült kapcsolódni. Ellenőrizd az internetet, és próbáld újra." });
    }
  };

  return (
    <Box>
      <Box component="form" onSubmit={run} sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5, maxWidth: 640 }}>
        <TextField
          label="A weboldalad címe"
          placeholder="pl. pelda.ro"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={state.kind === "running"}
          slotProps={{ htmlInput: { inputMode: "url", autoCapitalize: "none", autoCorrect: "off", spellCheck: false, maxLength: 300 } }}
          sx={{ flex: 1, "& .MuiOutlinedInput-root": { background: palette.surface } }}
        />
        <Button type="submit" variant="contained" size="large" disabled={state.kind === "running" || !input.trim()} startIcon={<Search />} sx={{ minHeight: 56, whiteSpace: "nowrap" }}>
          Átvilágítom
        </Button>
      </Box>

      {state.kind === "running" && (
        <Box role="status" aria-live="polite" sx={{ mt: 4, maxWidth: 640 }}>
          <Typography sx={{ fontWeight: 650, mb: 1 }}>{WAIT_STEPS[waitStep]}</Typography>
          <LinearProgress sx={{ "& .MuiLinearProgress-bar": { backgroundImage: packageThemes.standard.gradient } }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            A Google mérése általában 20–40 másodperc. Ne zárd be az oldalt.
          </Typography>
        </Box>
      )}

      {state.kind === "error" && (
        <Alert severity="error" sx={{ mt: 3, maxWidth: 640 }}>
          {state.message}
        </Alert>
      )}

      {state.kind === "done" && <AuditReport result={state.result} onRenovate={() => startPlanner("redesign", router.push)} />}
    </Box>
  );
}

function AuditReport({ result, onRenovate }: { result: AuditResult; onRenovate: () => void }) {
  const host = new URL(result.url).hostname;
  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h3" component="h2" sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, mb: 0.5 }}>
        {host} – eredmény
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Telefonos mérés a Google PageSpeed alapján. A fő tartalom <b>{result.metrics.lcp}</b> alatt jelenik meg.
      </Typography>

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

      <Typography variant="h4" component="h3" sx={{ mt: 4, mb: 1.5 }}>
        {result.issues.length > 0 ? "A 3 legfontosabb javítanivaló" : "Komoly hibát nem találtunk"}
      </Typography>
      <Stack component="ol" spacing={1.5} sx={{ pl: 2.5, m: 0 }}>
        {result.issues.slice(0, 3).map((issue) => (
          <Box component="li" key={issue.id}>
            <Typography sx={{ fontWeight: 650 }}>{issue.title}</Typography>
            <Typography color="text.secondary">{issue.why}</Typography>
          </Box>
        ))}
      </Stack>

      <Box sx={{ mt: 4, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <ReportByEmail url={result.url} more={Math.max(0, result.issues.length - 3)} />
        <Box sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, background: palette.ink, color: "#fff" }}>
          <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
            Mennyibe kerülne a javítás?
          </Typography>
          <Typography sx={{ color: palette.inkMuted, mb: 2.5 }}>Egy felújítás kérdőívvel 3 perc alatt kiszámolod, tételesen.</Typography>
          <Button variant="contained" size="large" endIcon={<ArrowForward />} onClick={onRenovate}>
            Felújítás árának kiszámolása
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function ReportByEmail({ url, more }: { url: string; more: number }) {
  const shownAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "sending" | "sent" } | { kind: "error"; message: string }>({ kind: "idle" });

  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/audit/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email: email.trim(), consent, website: honeypot.current?.value ?? "", elapsedMs: Date.now() - shownAt.current }),
      });
      const body = (await response.json().catch(() => null)) as { ok: boolean; error?: string } | null;
      if (response.ok && body?.ok) {
        trackStep("audit_lead");
        setStatus({ kind: "sent" });
      } else setStatus({ kind: "error", message: body?.error ?? "Nem sikerült elküldeni. Próbáld újra." });
    } catch {
      setStatus({ kind: "error", message: "Nem sikerült kapcsolódni. Próbáld újra." });
    }
  };

  return (
    <Box sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, background: palette.surface, border: 1, borderColor: "divider" }}>
      <Typography variant="h4" component="h3" sx={{ mb: 1 }}>
        Kérd a teljes jelentést
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Elküldjük e-mailben{more > 0 ? ` mind a ${more + 3} javítanivalóval` : ""}, és személyesen is írok pár sort arról, mit javítanék elsőként.
      </Typography>
      {status.kind === "sent" ? (
        <Alert severity="success" icon={<MailOutline />}>
          Elküldtük a(z) <b>{email}</b> címre.
        </Alert>
      ) : (
        <Box component="form" onSubmit={submit}>
          <TextField type="email" label="E-mail-címed" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Box aria-hidden sx={{ position: "absolute", left: "-10000px", width: "1px", height: "1px", overflow: "hidden" }}>
            <label>
              Weboldal
              <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </Box>
          <FormControlLabel
            sx={{ alignItems: "flex-start", mt: 1 }}
            control={<Checkbox checked={consent} onChange={(event) => setConsent(event.target.checked)} sx={{ mt: -0.75 }} />}
            label={
              <Typography variant="body2">
                Elfogadom az{" "}
                <MuiLink component={Link} href="/adatkezeles" target="_blank">
                  adatkezelési tájékoztatót
                </MuiLink>
                , és hozzájárulok, hogy a jelentést erre a címre elküldjétek.
              </Typography>
            }
          />
          {status.kind === "error" && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {status.message}
            </Alert>
          )}
          <Button
            type="submit"
            variant="outlined"
            size="large"
            disabled={status.kind === "sending" || !consent || !email.trim()}
            startIcon={status.kind === "sending" ? <CircularProgress size={16} /> : <MailOutline />}
            sx={{ mt: 1.5, color: palette.ink, borderColor: palette.ink }}
          >
            Kérem a jelentést
          </Button>
        </Box>
      )}
    </Box>
  );
}
