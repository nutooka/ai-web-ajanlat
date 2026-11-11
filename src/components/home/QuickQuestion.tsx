"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import MuiLink from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { srOnly } from "@/features/questionnaire/components/a11y";
import { palette } from "@/theme/tokens";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };
type Field = "reach" | "message" | "consent";
type FieldErrors = Partial<Record<Field, string>>;

// Same rules as the server (src/features/contact/question.ts); copied so no server code ships to the client.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+\d][\d\s()./-]{6,}$/;

function validate(reach: string, message: string, consent: boolean): FieldErrors {
  const errors: FieldErrors = {};
  if (!reach) errors.reach = "Add meg a telefonszámod vagy az e-mail-címed.";
  else if (!EMAIL.test(reach) && !PHONE.test(reach)) errors.reach = "Adj meg érvényes telefonszámot vagy e-mail-címet.";
  if (message.length < 3) errors.message = "Írd le röviden, miben segíthetünk.";
  if (!consent) errors.consent = "Az elküldéshez pipáld be, hogy elfogadod az adatkezelési tájékoztatót.";
  return errors;
}

/** "Inkább kérdeznél?" – for visitors who are not ready for the questionnaire. */
export function QuickQuestion() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const shownAt = useRef(0);
  useEffect(() => {
    shownAt.current = Date.now();
  }, []);
  const honeypot = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const reachRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const consentErrorId = `${id}-consent-error`;
  const sending = status.kind === "sending";

  useEffect(() => {
    // The form is replaced by the confirmation: keep focus on the page instead of dropping it to <body>.
    if (status.kind === "sent") doneRef.current?.focus();
  }, [status.kind]);

  const clearError = (field: Field) => setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The button stays focusable while sending (aria-disabled), so guard against a second submit here.
    if (inFlight.current) return;
    const data = new FormData(event.currentTarget);
    const reach = String(data.get("reach") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const found = validate(reach, message, consent);
    setErrors(found);
    const firstInvalid = found.reach ? reachRef : found.message ? messageRef : found.consent ? consentRef : null;
    if (firstInvalid) {
      firstInvalid.current?.focus();
      return;
    }
    inFlight.current = true;
    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reach,
          message,
          consent,
          website: honeypot.current?.value ?? "",
          elapsedMs: Date.now() - shownAt.current,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      setStatus(body.ok ? { kind: "sent" } : { kind: "error", message: body.error ?? "Nem sikerült elküldeni." });
    } catch {
      setStatus({ kind: "error", message: "Nincs kapcsolat. Próbáld újra." });
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <Box sx={{ mt: 6, p: { xs: 3, md: 4 }, borderRadius: 4, background: palette.surface, border: 1, borderColor: "divider" }}>
      <Typography variant="h5" component="h3" sx={{ mb: 0.75 }}>
        Nem találod a választ? Kérdezz tőlünk.
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2.5 }}>
        Írd le röviden, és 1 munkanapon belül válaszolunk. Nem kell kitöltened a kérdőívet.
      </Typography>
      {/* One persistent status region: "Küldés…", then the result. */}
      <Box role="status">
        {sending && <Box sx={srOnly}>Küldés…</Box>}
        {status.kind === "sent" && (
          <Alert ref={doneRef} tabIndex={-1} role="none" severity="success">
            Megkaptuk, hamarosan jelentkezünk.
          </Alert>
        )}
      </Box>
      {status.kind !== "sent" && (
        <Box component="form" onSubmit={onSubmit} noValidate sx={{ display: "grid", gap: 2 }}>
          <TextField
            name="reach"
            label="Telefonszám vagy e-mail-cím"
            required
            autoComplete="email"
            inputRef={reachRef}
            error={Boolean(errors.reach)}
            helperText={errors.reach}
            onChange={() => clearError("reach")}
            slotProps={{ htmlInput: { maxLength: 120 } }}
          />
          <TextField
            name="message"
            label="Kérdésed"
            required
            multiline
            minRows={3}
            inputRef={messageRef}
            error={Boolean(errors.message)}
            helperText={errors.message}
            onChange={() => clearError("message")}
            slotProps={{ htmlInput: { maxLength: 2000 } }}
          />
          <Box aria-hidden sx={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
            <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" />
          </Box>
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={consent}
                  onChange={(event) => {
                    setConsent(event.target.checked);
                    clearError("consent");
                  }}
                  slotProps={{
                    input: {
                      ref: consentRef,
                      "aria-required": true,
                      "aria-invalid": Boolean(errors.consent),
                      "aria-describedby": errors.consent ? consentErrorId : undefined,
                    },
                  }}
                />
              }
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
            {errors.consent && (
              <FormHelperText id={consentErrorId} error>
                {errors.consent}
              </FormHelperText>
            )}
          </Box>
          <Box role="status">
            {status.kind === "error" && (
              <Alert severity="error" role="none">
                {status.message}
              </Alert>
            )}
          </Box>
          <Button type="submit" variant="contained" size="large" aria-disabled={sending} sx={{ justifySelf: "start" }}>
            {sending ? "Küldés…" : "Elküldöm"}
          </Button>
        </Box>
      )}
    </Box>
  );
}
