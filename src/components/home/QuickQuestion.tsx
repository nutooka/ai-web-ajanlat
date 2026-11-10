"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MuiLink from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { palette } from "@/theme/tokens";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

/** "Inkább kérdeznél?" – for visitors who are not ready for the questionnaire. */
export function QuickQuestion() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [consent, setConsent] = useState(false);
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);
  const honeypot = useRef<HTMLInputElement>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reach: String(data.get("reach") ?? ""),
          message: String(data.get("message") ?? ""),
          consent,
          website: honeypot.current?.value ?? "",
          elapsedMs: Date.now() - shownAt.current,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      setStatus(body.ok ? { kind: "sent" } : { kind: "error", message: body.error ?? "Nem sikerült elküldeni." });
    } catch {
      setStatus({ kind: "error", message: "Nincs kapcsolat. Próbáld újra." });
    }
  }

  return (
    <Box sx={{ mt: 6, p: { xs: 3, md: 4 }, borderRadius: 4, background: palette.surface, border: 1, borderColor: "divider" }}>
      <Typography variant="h5" component="h3" sx={{ mb: 0.75 }}>
        Nem találod a választ? Kérdezz tőlem.
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>
        Írd le röviden, és 1 munkanapon belül válaszolok. Nem kell kitöltened a kérdőívet.
      </Typography>
      {status.kind === "sent" ? (
        <Alert severity="success">Megkaptam, hamarosan jelentkezem.</Alert>
      ) : (
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ display: "grid", gap: 2 }}>
          <TextField name="reach" label="Telefonszám vagy e-mail-cím" required autoComplete="email" slotProps={{ htmlInput: { maxLength: 120 } }} />
          <TextField name="message" label="Kérdésed" required multiline minRows={3} slotProps={{ htmlInput: { maxLength: 2000 } }} />
          <Box aria-hidden sx={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
            <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" />
          </Box>
          <FormControlLabel
            control={<Checkbox checked={consent} onChange={(event) => setConsent(event.target.checked)} />}
            label={
              <Typography variant="body2" color="text.secondary">
                Elfogadom az{" "}
                <MuiLink component={Link} href="/adatkezeles" target="_blank">
                  adatkezelési tájékoztatót
                </MuiLink>
                .
              </Typography>
            }
          />
          {status.kind === "error" && <Alert severity="error">{status.message}</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={status.kind === "sending" || !consent} sx={{ justifySelf: "start" }}>
            {status.kind === "sending" ? "Küldés…" : "Elküldöm"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
