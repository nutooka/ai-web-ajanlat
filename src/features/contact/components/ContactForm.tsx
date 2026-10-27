"use client";

import CheckCircleOutlineOutlined from "@mui/icons-material/CheckCircleOutlineOutlined";
import SendOutlined from "@mui/icons-material/SendOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, type UseFormRegisterReturn } from "react-hook-form";
import type { PackageId } from "@/features/pricing/types";
import type { Answers } from "@/features/questionnaire/types";
import { palette } from "@/theme/tokens";
import { contactSchema, type ContactData, type ContactInput } from "../schema";

interface ContactFormProps {
  answers: Answers;
  packageId: PackageId;
  packageName: string;
}

type Status = { kind: "idle" } | { kind: "success"; copySent: boolean } | { kind: "error"; message: string };

/** Adapts react-hook-form's register() to MUI TextField (ref goes to the input). */
function field({ ref, ...rest }: UseFormRegisterReturn) {
  return { ...rest, inputRef: ref };
}

export function ContactForm({ answers, packageId, packageName }: ContactFormProps) {
  const shownAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    shownAt.current = Date.now();
  }, []);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput, unknown, ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", company: "", message: "", wantsCopy: true, consent: false },
  });

  const onSubmit = async (contact: ContactData) => {
    setStatus({ kind: "idle" });
    try {
      const response = await fetch("/api/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          packageId,
          contact,
          website: honeypot.current?.value ?? "",
          elapsedMs: Date.now() - shownAt.current,
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | { ok: true; copySent: boolean }
        | { ok: false; error: string; fieldErrors?: Record<string, string> }
        | null;

      if (response.ok && body?.ok) {
        setStatus({ kind: "success", copySent: body.copySent });
        return;
      }
      if (body && !body.ok && body.fieldErrors) {
        for (const [path, message] of Object.entries(body.fieldErrors)) {
          const name = path.replace(/^contact\./, "") as keyof ContactInput;
          if (name in contactSchema.shape) setError(name, { message });
        }
      }
      setStatus({ kind: "error", message: body && !body.ok ? body.error : "Váratlan hiba történt. Kérjük, próbáld újra." });
    } catch {
      setStatus({ kind: "error", message: "Nem sikerült kapcsolódni a szerverhez. Ellenőrizd az internetkapcsolatot, és próbáld újra." });
    }
  };

  return (
    <Box
      sx={{
        borderRadius: { xs: 5, md: 7 },
        border: 1,
        borderColor: "divider",
        background: `linear-gradient(160deg, ${palette.surface} 40%, #EEF1FF 100%)`,
        p: { xs: 3, sm: 4, md: 6 },
        boxShadow: "0 30px 60px -40px rgba(43,75,255,.45)",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {status.kind === "success" ? (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center", py: 4 }} role="status">
              <CheckCircleOutlineOutlined sx={{ fontSize: 56, color: palette.success }} />
              <Typography variant="h3" component="h2">
                Köszönjük, megkaptuk!
              </Typography>
              <Typography variant="subtitle1" sx={{ maxWidth: 480 }}>
                1 munkanapon belül jelentkezünk.
                {status.copySent ? " Az ajánlat másolatát elküldtük az e-mail-címedre." : ""}
              </Typography>
            </Stack>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "0.8fr 1.2fr" }, gap: { xs: 4, md: 6 } }}>
              <Box>
                <Typography variant="overline" color="primary">
                  Utolsó lépés
                </Typography>
                <Typography variant="h3" component="h2" sx={{ mt: 1, mb: 2 }}>
                  Küldd el az ajánlatot, és egyeztessünk
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  A(z) <b>{packageName}</b> csomag ajánlatát küldöd el. Az ajánlat megtekintéséhez nem kell semmit megadnod – a küldés teljesen opcionális.
                </Typography>
              </Box>

              <Box component="form" noValidate onSubmit={(event) => void handleSubmit(onSubmit)(event)} aria-label="Ajánlat elküldése">
                <Stack spacing={2}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                    <TextField label="Név" autoComplete="name" {...field(register("name"))} error={Boolean(errors.name)} helperText={errors.name?.message} />
                    <TextField label="Cégnév" autoComplete="organization" {...field(register("company"))} error={Boolean(errors.company)} helperText={errors.company?.message} />
                    <TextField label="E-mail-cím" type="email" autoComplete="email" {...field(register("email"))} error={Boolean(errors.email)} helperText={errors.email?.message} />
                    <TextField label="Telefonszám" type="tel" autoComplete="tel" {...field(register("phone"))} error={Boolean(errors.phone)} helperText={errors.phone?.message} />
                  </Box>
                  <TextField label="Megjegyzés" multiline minRows={3} {...field(register("message"))} error={Boolean(errors.message)} helperText={errors.message?.message} />

                  {/* Honeypot – hidden from people and assistive tech. */}
                  <Box aria-hidden sx={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
                    <label>
                      Weboldal
                      <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                  </Box>

                  <Controller
                    name="wantsCopy"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <FormControlLabel control={<Checkbox checked={value} onChange={(event) => onChange(event.target.checked)} />} label="Kérek másolatot az ajánlatról e-mailben" />
                    )}
                  />
                  <Box>
                    <Controller
                      name="consent"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          sx={{ alignItems: "flex-start" }}
                          control={<Checkbox checked={value} onChange={(event) => onChange(event.target.checked)} sx={{ mt: -0.75 }} />}
                          label={
                            <Typography variant="body2">
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
                    {isSubmitting ? "Küldés…" : "Ajánlat elküldése"}
                  </Button>
                </Stack>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
