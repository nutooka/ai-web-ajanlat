"use client";

import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowForward from "@mui/icons-material/ArrowForward";
import CloudDoneOutlined from "@mui/icons-material/CloudDoneOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { track } from "@vercel/analytics";
import { AnimatePresence, m } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { trackStep } from "@/features/funnel/track";
import { calculateQuote } from "@/features/pricing/engine";
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
import { otherAnswerKey, type AnswerValue, type Answers } from "../types";
import { pricingConfig } from "@/config/pricing";
import { DeadlineSliderControl } from "@/features/offer/components/DeadlineSlider";
import { flexibilityMultiplier } from "@/features/pricing/flexibility";
import { QuestionStep } from "./QuestionStep";
import { WaveProgress } from "./WaveProgress";
import { WizardSidebar } from "./WizardSidebar";

const AUTO_ADVANCE_MS = 260;

/** Readable category for the chosen deadline (used in e-mails and the summary). */
function deadlineCategory(multiplier: number): string {
  if (multiplier >= 1.25) return "urgent";
  if (multiplier > 1.02) return "fast";
  if (multiplier < 0.98) return "flexible";
  return "normal";
}

/** Set one answer; re-answering the deadline question discards a deadline picked on the offer slider. */
function withAnswer(answers: Answers, id: string, value: AnswerValue | undefined): Answers {
  const next: Answers = { ...answers, [id]: value };
  if (id === "deadline") delete next.deadlineWeeks;
  return next;
}
/** Typical length before the project type is known (keeps the first step from showing 0%). */
const ESTIMATED_TOTAL = 15;

const slide = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -40 }),
};

function WizardSkeleton() {
  return (
    <Container maxWidth="md" sx={{ pt: 12 }} aria-busy="true">
      {/* Server-rendered: the heading and intro search engines see before the questionnaire loads. */}
      <Typography variant="h3" component="h1">
        Weboldal árkalkulátor
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Válaszolj néhány egyszerű kérdésre, és azonnal tételes árajánlatot kapsz RON-ban, három csomagban.
      </Typography>
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
  const [direction, setDirection] = useState(1);
  // Focus moves to the new step only after the visitor navigated – never on the first page load.
  const [hasNavigated, setHasNavigated] = useState(false);
  // A pointer pick waits a moment, then continues. A fresh object restarts the timer on every pick.
  const [pendingAdvance, setPendingAdvance] = useState<{ questionId: string; value: AnswerValue | undefined } | null>(null);
  const [error, setError] = useState<{ questionId: string; message: string } | null>(null);

  const visible = getVisibleQuestions(answers);
  const foundIndex = visible.findIndex((question) => question.id === currentId);
  const index = foundIndex >= 0 ? foundIndex : Math.max(0, visible.findIndex((question) => !isQuestionAnswered(question, answers[question.id])));
  const question = visible[index];
  const recommended = getRecommendedOption(question.id, answers);
  // The recommendation is shown as a label, never pre-selected: the visitor decides.
  // The deadline slider starts on the normal schedule, so "Tovább" works without touching it.
  const value = answers[question.id] ?? (question.id === "deadline" ? "normal" : undefined);
  const isLast = index === visible.length - 1 && question.id === "notes";
  const typeKnown = getEffectiveProjectType(answers) !== undefined;

  const quote = useMemo(() => calculateQuote(answers), [answers]);
  const answeredCount = visible.filter((item) => isQuestionAnswered(item, answers[item.id])).length;

  useEffect(() => {
    // Funnel: which questions people reach (the drop-off is between two consecutive ones).
    trackStep(`q:${question.id}`);
  }, [question.id]);

  const goTo = (questionId: string, nextDirection: number) => {
    setDirection(nextDirection);
    setHasNavigated(true);
    setPendingAdvance(null);
    setError(null);
    wizardStore.update({ currentId: questionId });
  };

  const goNext = (nextValue: AnswerValue | undefined = value) => {
    const message = validateAnswer(question, nextValue);
    if (message) {
      setError({ questionId: question.id, message });
      return;
    }
    const nextAnswers = withAnswer(answers, question.id, nextValue);
    // Funnel: first answer = questionnaire started.
    if (question.id === "projectType" && answers.projectType === undefined) track("Kérdőív elkezdve", { projectType: String(nextValue) });
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
      track("Kérdőív kitöltve", { projectType: String(nextAnswers.projectType) });
      router.push("/ajanlat");
      return;
    }
    const firstInvalid = sequence.find((item) => validateAnswer(item, nextAnswers[item.id]) !== null);
    if (firstInvalid) goTo(firstInvalid.id, -1);
  };

  const goBack = () => {
    setPendingAdvance(null);
    if (index === 0) {
      router.push("/");
      return;
    }
    goTo(visible[index - 1].id, -1);
  };

  const setDeadlineWeeks = (weeks: number) => {
    setError(null);
    const schedule = quote?.packages.standard.schedule;
    const multiplier = schedule ? flexibilityMultiplier(weeks, schedule.normalWeeks, pricingConfig.flexibility) : 1;
    wizardStore.update({ answers: { ...answers, deadline: deadlineCategory(multiplier), deadlineWeeks: String(weeks) }, currentId: question.id });
  };

  const handleChange = (nextValue: AnswerValue | undefined, options?: { advance?: boolean }) => {
    setError(null);
    wizardStore.update({ answers: withAnswer(answers, question.id, nextValue), currentId: question.id });
    setPendingAdvance(options?.advance ? { questionId: question.id, value: nextValue } : null);
  };

  // Effect events always see the latest answers/question, so the delayed advance never runs a stale goNext.
  const advance = useEffectEvent((pending: { questionId: string; value: AnswerValue | undefined }) => {
    setPendingAdvance(null);
    if (pending.questionId === question.id) goNext(pending.value);
  });
  useEffect(() => {
    if (!pendingAdvance) return;
    const timer = window.setTimeout(() => advance(pendingAdvance), AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [pendingAdvance]);

  // Keyboard: Enter continues (Ctrl/Cmd+Enter inside a textarea). Number keys live in QuestionStep (scoped to the option group).
  const onWindowKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== "Enter" || event.defaultPrevented || event.isComposing) return;
    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA" && !event.metaKey && !event.ctrlKey) return;
    if (target.getAttribute("role") === "radio" || target.getAttribute("role") === "checkbox") return;
    if (target.tagName === "BUTTON" || target.tagName === "A") return;
    event.preventDefault();
    setPendingAdvance(null);
    goNext();
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => onWindowKeyDown(event);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const total = typeKnown ? visible.length : ESTIMATED_TOTAL;
  const progress = isLast ? 100 : Math.min(99, Math.round(((index + 1) / total) * 100));
  const answered = isQuestionAnswered(question, value);
  const needsChoice = question.required && !answered;
  const nextLabel = isLast ? "Megnézem az ajánlatom" : needsChoice ? "Válassz egyet" : !answered ? "Kihagyom" : "Tovább";
  const stepLabel = isLast ? "Utolsó kérdés" : typeKnown ? `${index + 1}. kérdés / ${visible.length}` : `${index + 1}. kérdés / kb. ${ESTIMATED_TOTAL}`;

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <Box component="header" sx={{ position: "sticky", top: 0, zIndex: 10, background: palette.ink, color: "#fff" }}>
        <Container maxWidth="lg" sx={{ py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Logo tone="light" />
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", color: palette.inkMuted }}>
              <CloudDoneOutlined aria-hidden sx={{ fontSize: 18 }} />
              <Typography
                variant="body2"
                sx={{
                  // Visible from md; on small screens it stays readable for screen readers.
                  "@media (max-width: 899.95px)": { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" },
                }}
              >
                Automatikusan mentve
              </Typography>
            </Stack>
          </Stack>
        </Container>
        <WaveProgress value={progress} label="Haladás a kérdőívben" />
      </Box>

      <Container
        component="main"
        maxWidth="lg"
        sx={{ flex: 1, pt: { xs: 4, md: 8 }, pb: 16, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 340px" }, gap: 8, alignItems: "start" }}
      >
        <Box sx={{ maxWidth: 780, width: "100%" }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          {stepLabel}
        </Typography>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <m.div
            key={question.id}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <QuestionStep
              focusOnMount={hasNavigated}
              question={question}
              value={value}
              recommended={recommended}
              error={error?.questionId === question.id ? error.message : null}
              onChange={handleChange}
              otherText={typeof answers[otherAnswerKey(question.id)] === "string" ? String(answers[otherAnswerKey(question.id)]) : undefined}
              onOtherChange={(text) => wizardStore.update({ answers: withAnswer(answers, otherAnswerKey(question.id), text) })}
              customControl={
                question.id === "deadline" && quote ? (
                  <DeadlineSliderControl pkg={quote.packages.standard} onChange={setDeadlineWeeks} labelledBy={`${question.id}-title`} showAmount={false} />
                ) : undefined
              }
            />
          </m.div>
        </AnimatePresence>
        </Box>
        <Box sx={{ display: { xs: "none", lg: "block" } }}>
          <WizardSidebar quote={quote} answeredCount={answeredCount} stepKey={question.id} />
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
            <Button
              onClick={() => {
                setPendingAdvance(null);
                goNext();
              }}
              variant="contained"
              color="primary"
              size="large"
              endIcon={<ArrowForward />}
              aria-disabled={needsChoice}
            >
              {nextLabel}
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
