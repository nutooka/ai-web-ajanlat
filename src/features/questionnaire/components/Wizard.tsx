"use client";

import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowForward from "@mui/icons-material/ArrowForward";
import CloudDoneOutlined from "@mui/icons-material/CloudDoneOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { calculateQuote } from "@/features/pricing/engine";
import { formatRon } from "@/lib/format";
import { useWizardSnapshot, wizardStore } from "@/lib/storage";
import { palette } from "@/theme/tokens";
import {
  getEffectiveProjectType,
  getRecommendedOption,
  getVisibleQuestions,
  isComplete,
  isQuestionAnswered,
  validateAnswer,
} from "../engine";
import type { AnswerValue, Answers } from "../types";
import { QuestionStep } from "./QuestionStep";
import { WizardSidebar } from "./WizardSidebar";

const AUTO_ADVANCE_MS = 260;

const slide = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -40 }),
};

function WizardSkeleton() {
  return (
    <Container maxWidth="md" sx={{ pt: 12 }} aria-busy="true">
      <Skeleton variant="text" width="70%" height={56} />
      <Skeleton variant="text" width="40%" />
      <Stack spacing={1.5} sx={{ mt: 4 }}>
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} variant="rounded" height={72} />
        ))}
      </Stack>
    </Container>
  );
}

export function Wizard() {
  const snapshot = useWizardSnapshot();
  if (!snapshot) return <WizardSkeleton />;
  return <WizardContent answers={snapshot.answers} currentId={snapshot.currentId} />;
}

function WizardContent({ answers, currentId }: { answers: Answers; currentId: string | null }) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<number | undefined>(undefined);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState<{ questionId: string; message: string } | null>(null);

  const visible = getVisibleQuestions(answers);
  const foundIndex = visible.findIndex((question) => question.id === currentId);
  const index = foundIndex >= 0 ? foundIndex : Math.max(0, visible.findIndex((question) => !isQuestionAnswered(question, answers[question.id])));
  const question = visible[index];
  const recommended = getRecommendedOption(question.id, answers);
  const value = answers[question.id] ?? recommended;
  const isLast = index === visible.length - 1 && question.id === "notes";
  const typeKnown = getEffectiveProjectType(answers) !== undefined;

  const quote = useMemo(() => calculateQuote(answers), [answers]);
  const estimate = quote?.packages.standard.finalPrice;
  const answeredCount = visible.filter((item) => isQuestionAnswered(item, answers[item.id])).length;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [question.id]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const goTo = (questionId: string, nextDirection: number) => {
    setDirection(nextDirection);
    setError(null);
    wizardStore.update({ currentId: questionId });
  };

  const goNext = (nextValue: AnswerValue | undefined = value) => {
    const message = validateAnswer(question, nextValue);
    if (message) {
      setError({ questionId: question.id, message });
      return;
    }
    const nextAnswers = { ...answers, [question.id]: nextValue };
    if (nextValue !== answers[question.id]) wizardStore.update({ answers: nextAnswers });

    const sequence = getVisibleQuestions(nextAnswers);
    const position = sequence.findIndex((item) => item.id === question.id);
    const next = sequence[position + 1];
    if (next) {
      goTo(next.id, 1);
      return;
    }
    if (isComplete(nextAnswers)) {
      wizardStore.update({ packageId: calculateQuote(nextAnswers)?.recommended ?? "standard" });
      router.push("/ajanlat");
      return;
    }
    const firstInvalid = sequence.find((item) => validateAnswer(item, nextAnswers[item.id]) !== null);
    if (firstInvalid) goTo(firstInvalid.id, -1);
  };

  const goBack = () => {
    window.clearTimeout(advanceTimer.current);
    if (index === 0) {
      router.push("/");
      return;
    }
    goTo(visible[index - 1].id, -1);
  };

  const handleChange = (nextValue: AnswerValue | undefined, options?: { advance?: boolean }) => {
    setError(null);
    wizardStore.update({ answers: { ...answers, [question.id]: nextValue }, currentId: question.id });
    if (options?.advance) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = window.setTimeout(() => goNext(nextValue), AUTO_ADVANCE_MS);
    }
  };

  // Keyboard: 1–9 picks an option, Enter continues (Ctrl/Cmd+Enter inside a textarea).
  const keyHandler = useRef<(event: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    keyHandler.current = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const inTextarea = target.tagName === "TEXTAREA";
      const inInput = target.tagName === "INPUT";
      if (event.key === "Enter" && (!inTextarea || event.metaKey || event.ctrlKey)) {
        if (target.getAttribute("role") === "radio" || target.getAttribute("role") === "checkbox") return;
        if (target.tagName === "BUTTON" || target.tagName === "A") return;
        event.preventDefault();
        goNext();
        return;
      }
      if (question.kind === "text" || inInput || inTextarea || event.metaKey || event.ctrlKey || event.altKey) return;
      const number = Number(event.key);
      const option = Number.isInteger(number) && number >= 1 ? question.options[number - 1] : undefined;
      if (option) {
        event.preventDefault();
        (document.querySelectorAll<HTMLElement>("[role=radio],[role=checkbox]")[number - 1])?.click();
      }
    };
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => keyHandler.current(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const progress = typeKnown ? Math.round((index / visible.length) * 100) : 0;
  const answered = isQuestionAnswered(question, value);
  const nextLabel = isLast ? "Megnézem az ajánlatom" : !answered && !question.required ? "Kihagyom" : "Tovább";

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Box component="header" sx={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(242,240,234,.72)", backdropFilter: "blur(14px)" }}>
        <Container maxWidth="lg" sx={{ py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Logo />
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            {estimate !== undefined && (
              <Box sx={{ display: { xs: "none", sm: "flex", lg: "none" }, alignItems: "baseline", gap: 1, px: 1.75, py: 0.75, borderRadius: 999, background: palette.surface, border: 1, borderColor: "divider" }}>
                <Typography variant="body2" color="text.secondary">
                  Becslés:
                </Typography>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={estimate} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {formatRon(estimate)}
                  </motion.span>
                </AnimatePresence>
              </Box>
            )}
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", color: "text.secondary" }} aria-live="polite">
              <CloudDoneOutlined sx={{ fontSize: 18 }} />
              <Typography variant="body2" sx={{ display: { xs: "none", md: "block" } }}>
                Automatikusan mentve
              </Typography>
            </Stack>
          </Stack>
        </Container>
        <LinearProgress variant="determinate" value={progress} aria-label="Haladás" sx={{ borderRadius: 0, height: 4 }} />
      </Box>

      <Container
        component="main"
        maxWidth="lg"
        sx={{ flex: 1, pt: { xs: 4, md: 8 }, pb: 16, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" }, gap: 8, alignItems: "start" }}
      >
        <Box sx={{ maxWidth: 780, width: "100%" }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          {typeKnown ? `${index + 1}. kérdés / ${visible.length}` : `${index + 1}. kérdés`}
        </Typography>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={question.id}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <QuestionStep
              ref={headingRef}
              question={question}
              value={value}
              recommended={recommended}
              error={error?.questionId === question.id ? error.message : null}
              onChange={handleChange}
            />
          </motion.div>
        </AnimatePresence>
        </Box>
        <Box sx={{ display: { xs: "none", lg: "block" } }}>
          <WizardSidebar quote={quote} answeredCount={answeredCount} />
        </Box>
      </Container>

      <Box
        component="nav"
        aria-label="Kérdőív navigáció"
        sx={{ position: "fixed", insetInline: 0, bottom: 0, zIndex: 10, borderTop: 1, borderColor: "divider", background: "rgba(255,255,255,.85)", backdropFilter: "blur(14px)", pb: "env(safe-area-inset-bottom)" }}
      >
        <Container maxWidth="lg" sx={{ py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Button onClick={goBack} color="inherit" startIcon={<ArrowBack />}>
            Vissza
          </Button>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", md: "block" } }}>
              vagy nyomj <b>Enter</b>-t
            </Typography>
            <Button onClick={() => goNext()} variant="contained" color={isLast ? "primary" : "secondary"} size="large" endIcon={<ArrowForward />}>
              {nextLabel}
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
