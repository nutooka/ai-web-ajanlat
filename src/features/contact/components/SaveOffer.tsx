"use client";

import ChatOutlined from "@mui/icons-material/ChatOutlined";
import MailOutline from "@mui/icons-material/MailOutlined";
import WhatsApp from "@mui/icons-material/WhatsApp";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { siteConfig } from "@/config/site";
import { trackStep } from "@/features/funnel/track";
import type { PackageId } from "@/features/pricing/types";
import type { Answers } from "@/features/questionnaire/types";
import { formatRon } from "@/lib/format";
import { palette } from "@/theme/tokens";

const emailSchema = z.email();

interface SaveOfferProps {
  answers: Answers;
  packageId: PackageId;
  packageName: string;
  price: number;
  /** Offer code for the chat message, when already known. */
  code: string | null;
}

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; email: string } | { kind: "error"; message: string };

/** Pre-filled chat message: enough for the owner to open the exact offer. */
export function chatMessage(packageName: string, price: number, code: string | null): string {
  const ref = code ? ` Az ajánlatkódom: ${code} (nutooka.tech/a/${code}).` : "";
  return `Szia! Kitöltöttem a kérdőívet: ${packageName} csomag, ${formatRon(price)}.${ref} Kérdésem lenne:`;
}

/**
 * Lighter steps than a consultation request, for visitors who are not ready yet:
 * e-mail the offer to yourself, or ask a question in Messenger / WhatsApp.
 */
export function SaveOffer({ answers, packageId, packageName, price, code }: SaveOfferProps) {
  const shownAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [fieldError, setFieldError] = useState<{ email?: string; consent?: string }>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  const { messenger, whatsapp }: { messenger: string; whatsapp: string } = siteConfig.chat;
  const message = chatMessage(packageName, price, code);
  const chatLinks = [
    messenger && { id: "messenger", label: "Messenger", icon: ChatOutlined, href: `https://m.me/${messenger}?text=${encodeURIComponent(message)}` },
    whatsapp && { id: "whatsapp", label: "WhatsApp", icon: WhatsApp, href: `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}` },
  ].filter((link): link is { id: string; label: string; icon: typeof WhatsApp; href: string } => Boolean(link));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    const errors = {
      email: emailSchema.safeParse(value).success ? undefined : "Adj meg egy érvényes e-mail-címet.",
      consent: consent ? undefined : "Az elküldéshez fogadd el az adatkezelési tájékoztatót.",
    };
    setFieldError(errors);
    if (errors.email || errors.consent) return;

    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          packageId,
          intent: "save",
          contact: { email: value, wantsCopy: true, consent: true },
          website: honeypot.current?.value ?? "",
          elapsedMs: Date.now() - shownAt.current,
        }),
      });
      const body = (await response.json().catch(() => null)) as { ok: boolean; error?: string } | null;
      if (response.ok && body?.ok) {
        trackStep("offer_saved");
        setStatus({ kind: "sent", email: value });
        return;
      }
      setStatus({ kind: "error", message: body?.error ?? "Váratlan hiba történt. Kérjük, próbáld újra." });
    } catch {
      setStatus({ kind: "error", message: "Nem sikerült kapcsolódni a szerverhez. Kérjük, próbáld újra." });
    }
  };

  return (
    <Box sx={{ mt: 3, borderRadius: { xs: 3, md: 4 }, border: 1, borderColor: "divider", background: palette.surface, p: { xs: 3, sm: 4 } }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: chatLinks.length ? "1.3fr 0.7fr" : "1fr" }, gap: { xs: 4, md: 5 } }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ mb: 0.75 }}>
            Még gondolkodsz?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Küldd el magadnak az ajánlatot egy linkkel, amivel később is pontosan ezt látod. Nem hívunk fel, ha nem kéred.
          </Typography>

          {status.kind === "sent" ? (
            <Alert severity="success" icon={<MailOutline />}>
              Elküldtük a(z) <b>{status.email}</b> címre. Ha nem látod, nézd meg a Promóciók vagy a Spam mappát is.
            </Alert>
          ) : (
            <Box component="form" noValidate onSubmit={submit}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ alignItems: { sm: "flex-start" } }}>
                <TextField
                  type="email"
                  label="E-mail-címed"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  error={Boolean(fieldError.email)}
                  helperText={fieldError.email}
                  sx={{ flex: 1 }}
                />
                <Button
                  type="submit"
                  variant="outlined"
                  size="large"
                  disabled={status.kind === "sending"}
                  startIcon={status.kind === "sending" ? <CircularProgress size={16} /> : <MailOutline />}
                  sx={{ minHeight: 56, whiteSpace: "nowrap", color: palette.ink, borderColor: palette.ink, "&:hover": { borderColor: palette.ink, background: palette.limeTint } }}
                >
                  Elküldöm magamnak
                </Button>
              </Stack>
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
                  <Typography variant="body2" color={fieldError.consent ? "error" : undefined}>
                    Elfogadom az{" "}
                    <MuiLink component={Link} href="/adatkezeles" target="_blank">
                      adatkezelési tájékoztatót
                    </MuiLink>
                    , és hozzájárulok, hogy az ajánlatot erre a címre elküldjétek.
                  </Typography>
                }
              />
              {status.kind === "error" && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {status.message}
                </Alert>
              )}
            </Box>
          )}
        </Box>

        {chatLinks.length > 0 && (
          <Box>
            <Typography variant="h4" component="h2" sx={{ mb: 0.75 }}>
              Inkább írnál?
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Az üzenet előre ki van töltve az ajánlatoddal – csak a kérdésed kell hozzáírni.
            </Typography>
            <Stack spacing={1.25}>
              {chatLinks.map(({ id, label, icon: Icon, href }) => (
                <Button
                  key={id}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  size="large"
                  startIcon={<Icon />}
                  onClick={() => trackStep("chat_click")}
                  sx={{ justifyContent: "flex-start" }}
                >
                  Írok {label}en
                </Button>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
