"use client";

import TipsAndUpdatesOutlined from "@mui/icons-material/TipsAndUpdatesOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { optionImpacts } from "@/features/pricing/optionImpact";
import { toggleMultiOption } from "../engine";
import { OTHER_TEXT_MAX, type AnswerValue, type Question, type QuestionOption } from "../types";
import { useRovingRadio } from "./a11y";
import { OptionCard } from "./OptionCard";

type SelectSource = "pointer" | "keyboard" | "arrow" | "enter";

interface QuestionStepProps {
  question: Question;
  value: AnswerValue | undefined;
  recommended?: string;
  error: string | null;
  onChange: (value: AnswerValue | undefined, options?: { advance?: boolean }) => void;
  /** Replaces the default answer UI (e.g. the deadline slider). */
  customControl?: React.ReactNode;
  /** Free text of the "Egyéb" option, shown when that option is picked. */
  otherText?: string;
  onOtherChange?: (text: string | undefined) => void;
  /** Move focus to this step when it mounts (after navigating, never on the first page load). */
  focusOnMount?: boolean;
}

export function QuestionStep({ question, value, recommended, error, onChange, customControl, otherText, onOtherChange, focusOnMount = false }: QuestionStepProps) {
  const errorId = `${question.id}-error`;
  const titleId = `${question.id}-title`;
  const hintId = `${question.id}-hint`;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  // Read once: this step instance mounts after the previous one finished its exit animation,
  // so focusing here never targets the outgoing heading.
  const focusTarget = useRef(focusOnMount ? (question.kind === "text" ? textRef : headingRef) : null);
  // The "Egyéb" field grabs focus only when the visitor picked it on purpose (not when arrowing past it).
  const [focusOther, setFocusOther] = useState(false);

  useEffect(() => {
    const target = focusTarget.current?.current;
    if (!target) return;
    window.scrollTo({ top: 0 });
    target.focus({ preventScroll: true });
  }, []);

  const single = question.kind === "single";
  const options = question.kind === "text" ? [] : question.options;
  const selectedIndex = single ? options.findIndex((option) => option.id === value) : -1;

  const select = (option: QuestionOption, source: SelectSource) => {
    if (question.kind === "multi") {
      const next = toggleMultiOption(question, Array.isArray(value) ? value : [], option.id);
      onChange(next.length > 0 ? next : undefined);
    } else {
      // Auto-advance only on a pointer click or Enter. Space, arrows and number keys just select (WCAG 3.2.2).
      // "Egyéb" needs a moment to type: no auto-advance.
      onChange(option.id, { advance: (source === "pointer" || source === "enter") && !option.other });
    }
    if (option.other && source !== "arrow") setFocusOther(true);
  };

  const radioProps = useRovingRadio(options.length, selectedIndex, (index) => select(options[index], "arrow"));

  // Number keys 1–9: only while focus is inside this option group, never in a text field.
  const onGroupKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey || !/^[1-9]$/.test(event.key)) return;
    const target = event.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
    const index = Number(event.key) - 1;
    const option = options[index];
    if (!option) return;
    event.preventDefault();
    groupRef.current?.querySelectorAll<HTMLElement>("[role=radio],[role=checkbox]")[index]?.focus();
    select(option, "keyboard");
  };

  return (
    <Stack spacing={3.5}>
      <Stack spacing={1.5}>
        <Typography id={titleId} ref={headingRef} tabIndex={-1} variant="h3" component="h1" sx={{ outline: "none", boxShadow: "none", maxWidth: 720 }}>
          {question.title}
        </Typography>
        {question.subtitle && <Typography variant="subtitle1">{question.subtitle}</Typography>}
        {question.hint && (
          <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start", color: "text.secondary" }}>
            <TipsAndUpdatesOutlined sx={{ fontSize: 18, mt: "2px", color: "text.primary" }} />
            <Typography variant="body2">{question.hint}</Typography>
          </Stack>
        )}
      </Stack>

      {customControl ? (
        customControl
      ) : question.kind === "text" ? (
        <TextField
          inputRef={textRef}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value === "" ? undefined : event.target.value)}
          placeholder={question.placeholder}
          multiline={question.multiline}
          minRows={question.multiline ? 4 : undefined}
          error={Boolean(error)}
          helperText={error ?? `${typeof value === "string" ? value.length : 0} / ${question.maxLength}`}
          slotProps={{
            htmlInput: { maxLength: question.maxLength, "aria-labelledby": titleId },
            formHelperText: { sx: { textAlign: error ? "left" : "right" } },
          }}
          sx={{ "& .MuiInputBase-root": { fontSize: "1.0625rem" } }}
        />
      ) : (
        <Box>
          <Box
            ref={groupRef}
            role={single ? "radiogroup" : "group"}
            aria-labelledby={titleId}
            aria-describedby={[error ? errorId : "", single ? hintId : ""].filter(Boolean).join(" ") || undefined}
            onKeyDown={onGroupKeyDown}
            sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fill, minmax(260px, 1fr))" }, gap: 1.5 }}
          >
            {question.options.map((option, index) => {
              const selected = Array.isArray(value) ? value.includes(option.id) : value === option.id;
              const roving = single ? radioProps(index) : null;
              return (
                <OptionCard
                  key={option.id}
                  option={option}
                  selected={selected}
                  multiple={question.kind === "multi"}
                  shortcut={index < 9 ? index + 1 : undefined}
                  recommended={recommended === option.id}
                  impacts={optionImpacts(question.id, option.id)}
                  onSelect={(source) => select(option, source)}
                  tabIndex={roving?.tabIndex}
                  ref={roving?.ref}
                  onKeyDown={
                    roving
                      ? (event) => {
                          // Enter on a radio = "choose this and continue" (Space only selects).
                          if (event.key === "Enter" && !event.altKey && !event.ctrlKey && !event.metaKey) {
                            event.preventDefault();
                            select(option, "enter");
                            return;
                          }
                          roving.onKeyDown(event);
                        }
                      : undefined
                  }
                />
              );
            })}
          </Box>
          {single && (
            <Typography id={hintId} variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Kattintás után automatikusan továbblépünk; billentyűzettel válassz, majd nyomj Entert.
            </Typography>
          )}
        </Box>
      )}

      {question.kind !== "text" &&
        question.options.some((option) => option.other && (Array.isArray(value) ? value.includes(option.id) : value === option.id)) && (
          <TextField
            autoFocus={focusOther}
            label="Mit szeretnél még? Írd le röviden."
            value={otherText ?? ""}
            onChange={(event) => onOtherChange?.(event.target.value === "" ? undefined : event.target.value)}
            slotProps={{ htmlInput: { maxLength: OTHER_TEXT_MAX } }}
            helperText="Nem kerül automatikusan az árba – az egyeztetésen beárazzuk."
          />
        )}

      {error && question.kind !== "text" && (
        <Typography id={errorId} role="alert" color="error" variant="body2">
          {error}
        </Typography>
      )}
    </Stack>
  );
}
