"use client";

import ExpandMore from "@mui/icons-material/ExpandMore";
import SendOutlined from "@mui/icons-material/SendOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { track } from "@vercel/analytics";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import type { PackageId } from "@/features/pricing/types";
import type { Answers } from "@/features/questionnaire/types";
import { Blob } from "@/components/Blob";
import { palette } from "@/theme/tokens";
import { CALLBACK_LABELS, CALLBACK_TIMES, isEmailLike, quickContactSchema, toContact, type QuickContactValues } from "../schema";

interface ContactFormProps {
  answers: Answers;
  packageId: PackageId;
  packageName: string;
  /** Called after the request went out; the page then shows a persistent confirmation. */
  onSubmitted: (copySent: boolean) => void;
}

type Status = { kind: "idle" } | { kind: "error"; message: string };

/** Adapts react-hook-form's register() to MUI TextField (ref goes to the input). */
function field({ ref, ...rest }: UseFormRegisterReturn) {
  return { ...rest, inputRef: ref };
}

/** Server field paths → quick-form fields. */
const SERVER_FIELD: Record<string, keyof QuickContactValues> = {
  "contact.email": "reach",
  "contact.phone": "reach",
  "contact.name": "name",
  "contact.company": "company",
  "contact.message": "message",
  "contact.consent": "consent",
};

/**
 * The quick request: one "phone or e-mail" field, when to call, consent.
 * Name, company and message are optional and folded away.
 */
export function ContactForm({ answers, packageId, packageName, onSubmitted }: ContactFormProps) {
  const shownAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<QuickContactValues>({
    resolver: zodResolver(quickContactSchema),
    defaultValues: { reach: "", callbackTime: "asap", name: "", company: "", message: "", wantsCopy: true, consent: false },
  });
  const reach = useWatch({ control, name: "reach" });
  const emailEntered = isEmailLike(reach ?? "");

  const onSubmit = async (values: QuickContactValues) => {
    setStatus({ kind: "idle" });
    try {
      const response = await fetch("/api/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          packageId,
          contact: toContact(values),
          website: honeypot.current?.value ?? "",
          elapsedMs: Date.now() - shownAt.current,
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | { ok: true; copySent: boolean }
        | { ok: false; error: string; fieldErrors?: Record<string, string> }
        | null;

      if (response.ok && body?.ok) {
        track("Egyeztetés kérve", { package: packageId, callbackTime: values.callbackTime, channel: isEmailLike(values.reach) ? "email" : "phone" });
        onSubmitted(body.copySent);
        return;
      }
      if (body && !body.ok && body.fieldErrors) {
        let focused = false;
        for (const [path, message] of Object.entries(body.fieldErrors)) {
          const name = SERVER_FIELD[path];
          if (!name) continue;
          if (name !== "reach" && name !== "consent") setShowMore(true);
          setError(name, { message }, { shouldFocus: !focused });
          focused = true;
        }
      }
      setStatus({ kind: "error", message: body && !body.ok ? body.error : "Váratlan hiba történt. Kérjük, próbáld újra." });
    } catch {
      setStatus({ kind: "error", message: "Nem sikerült kapcsolódni a szerverhez. Ellenőrizd az internetkapcsolatot, és próbáld újra." });
    }
  };

  return (
    <Box sx={{ borderRadius: { xs: 3, md: 4 }, border: 1, borderColor: "divider", background: palette.surface, p: { xs: 3, sm: 4, md: 6 } }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "0.8fr 1.2fr" }, gap: { xs: 4, md: 6 } }}>
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.5 }}>
            <Blob tone={packageId} size={22} duration={12} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {packageName} csomag
            </Typography>
          </Stack>
          <Typography variant="h3" component="h2" sx={{ mb: 2 }}>
            Kérj ingyenes, 30 perces egyeztetést
          </Typography>
          <Typography color="text.secondary">
            Hagyd meg a telefonszámod vagy az e-mail-címed, és jelentkezünk a <b>{packageName}</b> csomag ajánlatával. Nincs kötelezettség, előre nem kell fizetni semmit.
          </Typography>
        </Box>

        <Box component="form" noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)} aria-label="Egyeztetés kérése">
          <Stack spacing={2.5}>
            <TextField
              label="Telefonszám vagy e-mail-cím"
              required
              autoComplete="tel email"
              inputMode={emailEntered ? "email" : "text"}
              {...field(register("reach"))}
              error={Boolean(errors.reach)}
              helperText={errors.reach?.message ?? "Csak ezt kell megadnod – ezen keresünk."}
            />

            <Box>
              <Typography id="callback-label" variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Mikor keressünk?
              </Typography>
              <Controller
                name="callbackTime"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Box role="radiogroup" aria-labelledby="callback-label" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1 }}>
                    {CALLBACK_TIMES.map((time) => {
                      const active = value === time;
                      return (
                        <ButtonBase
                          key={time}
                          role="radio"
                          aria-checked={active}
                          onClick={() => onChange(time)}
                          sx={{
                            minHeight: 44,
                            px: 1.5,
                            borderRadius: 2.5,
                            fontWeight: 600,
                            fontSize: 14,
                            border: "1.5px solid",
                            borderColor: active ? palette.ink : palette.line,
                            background: active ? palette.lime : palette.surface,
                            color: palette.ink,
                            transition: "background .15s ease, border-color .15s ease",
                            "&:hover": { borderColor: palette.ink },
                            "&.Mui-focusVisible": { outline: `2px solid ${palette.ink}`, outlineOffset: 2 },
                          }}
                        >
                          {CALLBACK_LABELS[time]}
                        </ButtonBase>
                      );
                    })}
                  </Box>
                )}
              />
            </Box>

            {emailEntered && (
              <Controller
                name="wantsCopy"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormControlLabel control={<Checkbox checked={value} onChange={(event) => onChange(event.target.checked)} />} label="Kérek másolatot az ajánlatról e-mailben" />
                )}
              />
            )}

            <Box>
              <ButtonBase
                onClick={() => setShowMore((open) => !open)}
                aria-expanded={showMore}
                aria-controls="contact-more"
                sx={{ minHeight: 44, gap: 0.5, fontWeight: 600, fontSize: 14, color: "text.secondary", borderRadius: 1.5, "&.Mui-focusVisible": { outline: `2px solid ${palette.ink}`, outlineOffset: 2 } }}
              >
                Továbbiak: név, cég, megjegyzés (nem kötelező)
                <ExpandMore sx={{ fontSize: 20, transform: showMore ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
              </ButtonBase>
              <Collapse in={showMore} id="contact-more">
                <Stack spacing={2} sx={{ pt: 1.5 }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    <TextField label="Név" autoComplete="name" {...field(register("name"))} error={Boolean(errors.name)} helperText={errors.name?.message} />
                    <TextField label="Cégnév" autoComplete="organization" {...field(register("company"))} error={Boolean(errors.company)} helperText={errors.company?.message} />
                  </Box>
                  <TextField label="Megjegyzés" multiline minRows={3} {...field(register("message"))} error={Boolean(errors.message)} helperText={errors.message?.message} />
                </Stack>
              </Collapse>
            </Box>

            {/* Honeypot – hidden from people and assistive tech. */}
            <Box aria-hidden sx={{ position: "absolute", left: "-10000px", width: "1px", height: "1px", overflow: "hidden" }}>
              <label>
                Weboldal
                <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </Box>

            <Box>
              <Controller
                name="consent"
                control={control}
                render={({ field: { value, onChange, ref } }) => (
                  <FormControlLabel
                    sx={{ alignItems: "flex-start" }}
                    control={
                      <Checkbox
                        checked={value}
                        onChange={(event) => onChange(event.target.checked)}
                        slotProps={{ input: { ref, "aria-required": true, "aria-invalid": Boolean(errors.consent) } }}
                        sx={{ mt: -0.75 }}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        <Box component="span" aria-hidden sx={{ fontWeight: 700 }}>
                          *{" "}
                        </Box>
                        Elolvastam és elfogadom az{" "}
                        <MuiLink component={Link} href="/adatkezeles" target="_blank">
                          adatkezelési tájékoztatót
                        </MuiLink>
                        , és hozzájárulok, hogy a megadott adataimat az ajánlatkérésem megválaszolására felhasználjátok.
                      </Typography>
                    }
                  />
                )}
              />
              {errors.consent && <FormHelperText error>{errors.consent.message}</FormHelperText>}
            </Box>

            {status.kind === "error" && (
              <Alert severity="error" role="alert">
                {status.message}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              endIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <SendOutlined />}
              sx={{ alignSelf: { sm: "flex-start" } }}
            >
              {isSubmitting ? "Küldés…" : `Egyeztetést kérek – ${packageName}`}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
