"use client";

import Add from "@mui/icons-material/Add";
import ArrowForward from "@mui/icons-material/ArrowForward";
import MailOutline from "@mui/icons-material/MailOutlined";
import Search from "@mui/icons-material/Search";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
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
import type { AuditResult } from "./audit";
import { Checklist, Comparison, ImpactBox, Previews, ScoreCards } from "./AuditReport";

const WAIT_STEPS = [
  "Megnyitjuk az oldalt telefonos nézetben…",
  "Mérjük a betöltési sebességet…",
  "Ellenőrizzük az elérhetőséget és a jogi minimumot…",
  "Megnézzük, hogyan látja a Google és a Facebook…",
  "Összeállítjuk az eredményt…",
];

type Done = { kind: "done"; result: AuditResult; competitor: AuditResult | null; competitorError: string | null };
type State = { kind: "idle" } | { kind: "running" } | Done | { kind: "error"; message: string };

/** Free website check: Google mobile test + our own checklist → Hungarian report → e-mail → renovation offer. */
export function AuditTool() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [rival, setRival] = useState("");
  const [compare, setCompare] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [waitStep, setWaitStep] = useState(0);

  useEffect(() => {
    if (state.kind !== "running") return;
    const timer = window.setInterval(() => setWaitStep((step) => Math.min(step + 1, WAIT_STEPS.length - 1)), 6000);
    return () => window.clearInterval(timer);
  }, [state.kind]);

  const run = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    setWaitStep(0);
    setState({ kind: "running" });
    trackStep("audit_run");
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input, competitor: compare ? rival : "" }),
      });
      const body = (await response.json().catch(() => null)) as
        | { ok: true; result: AuditResult; competitor: AuditResult | null; competitorError: string | null }
        | { ok: false; error: string }
        | null;
      if (body?.ok) setState({ kind: "done", result: body.result, competitor: body.competitor, competitorError: body.competitorError });
      else setState({ kind: "error", message: body?.error ?? "A mérés nem sikerült. Próbáld újra." });
    } catch {
      setState({ kind: "error", message: "Nem sikerült kapcsolódni. Ellenőrizd az internetet, és próbáld újra." });
    }
  };

  const running = state.kind === "running";
  return (
    <Box>
      <Box component="form" onSubmit={run} sx={{ maxWidth: 680 }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}>
          <TextField
            label="A weboldalad címe"
            placeholder="pl. pelda.ro"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={running}
            slotProps={{ htmlInput: { inputMode: "url", autoCapitalize: "none", autoCorrect: "off", spellCheck: false, maxLength: 300 } }}
            sx={{ flex: 1, "& .MuiOutlinedInput-root": { background: palette.surface } }}
          />
          <Button type="submit" variant="contained" size="large" disabled={running || !input.trim()} startIcon={<Search />} sx={{ minHeight: 56, whiteSpace: "nowrap" }}>
            Átvilágítom
          </Button>
        </Box>
        {compare ? (
          <TextField
            label="Versenytárs weboldala (nem kötelező)"
            placeholder="pl. konkurencia.ro"
            value={rival}
            onChange={(event) => setRival(event.target.value)}
            disabled={running}
            slotProps={{ htmlInput: { inputMode: "url", autoCapitalize: "none", autoCorrect: "off", spellCheck: false, maxLength: 300 } }}
            sx={{ mt: 1.5, "& .MuiOutlinedInput-root": { background: palette.surface } }}
          />
        ) : (
          <ButtonBase onClick={() => setCompare(true)} sx={{ mt: 1, minHeight: 40, gap: 0.5, fontWeight: 650, color: palette.ink }}>
            <Add sx={{ fontSize: 18 }} /> Hasonlítsd össze egy versenytárssal
          </ButtonBase>
        )}
      </Box>

      {running && (
        <Box role="status" aria-live="polite" sx={{ mt: 4, maxWidth: 680 }}>
          <Typography sx={{ fontWeight: 650, mb: 1 }}>{WAIT_STEPS[waitStep]}</Typography>
          <LinearProgress sx={{ "& .MuiLinearProgress-bar": { backgroundImage: packageThemes.standard.gradient } }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            A Google mérése általában 20–40 másodperc. Ne zárd be az oldalt.
          </Typography>
        </Box>
      )}

      {state.kind === "error" && (
        <Alert severity="error" sx={{ mt: 3, maxWidth: 680 }}>
          {state.message}
        </Alert>
      )}

      {state.kind === "done" && <Report state={state} onRenovate={() => startPlanner("redesign", router.push)} />}
    </Box>
  );
}

function Report({ state, onRenovate }: { state: Done; onRenovate: () => void }) {
  const { result, competitor, competitorError } = state;
  const host = new URL(result.url).hostname;
  const facts = result.inspection?.facts;
  return (
    <Stack spacing={5} sx={{ mt: 5 }}>
      <Box>
        <Typography variant="h3" component="h2" sx={{ fontSize: { xs: "1.6rem", md: "2.1rem" }, mb: 0.5 }}>
          {host} – eredmény
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Telefonos mérés (Google PageSpeed) + saját ellenőrzés.
          {facts?.platform ? ` Rendszer: ${facts.platform}.` : ""}
          {result.pageWeight ? ` Oldalméret: ${result.pageWeight}.` : ""}
        </Typography>
        <ScoreCards result={result} />
      </Box>

      <ImpactBox result={result} />

      {(result.screenshot || result.inspection) && <Previews result={result} />}

      {result.inspection ? (
        <Checklist checks={result.inspection.checks} />
      ) : (
        <Alert severity="info">Az oldal letiltotta a részletes ellenőrzést – a sebességmérés eredménye így is érvényes.</Alert>
      )}

      {result.issues.length > 0 && (
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" }, mb: 1.5 }}>
            Sebesség – a legfontosabb javítanivalók
          </Typography>
          <Stack component="ol" spacing={1.5} sx={{ pl: 2.5, m: 0 }}>
            {result.issues.slice(0, 4).map((issue) => (
              <Box component="li" key={issue.id}>
                <Typography sx={{ fontWeight: 650 }}>{issue.title}</Typography>
                <Typography color="text.secondary">{issue.why}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {competitor && <Comparison own={result} rival={competitor} />}
      {competitorError && <Alert severity="warning">{competitorError}</Alert>}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <ReportByEmail url={result.url} />
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
    </Stack>
  );
}

function ReportByEmail({ url }: { url: string }) {
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
        Elküldjük e-mailben a teljes listával, és személyesen is írok pár sort arról, mit javítanék elsőként.
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
