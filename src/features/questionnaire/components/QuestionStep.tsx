"use client";

import TipsAndUpdatesOutlined from "@mui/icons-material/TipsAndUpdatesOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { forwardRef } from "react";
import { optionImpacts } from "@/features/pricing/optionImpact";
import { toggleMultiOption } from "../engine";
import type { AnswerValue, Question } from "../types";
import { OptionCard } from "./OptionCard";

interface QuestionStepProps {
  question: Question;
  value: AnswerValue | undefined;
  recommended?: string;
  error: string | null;
  onChange: (value: AnswerValue | undefined, options?: { advance?: boolean }) => void;
  /** Replaces the default answer UI (e.g. the deadline slider). */
  customControl?: React.ReactNode;
}

export const QuestionStep = forwardRef<HTMLHeadingElement, QuestionStepProps>(function QuestionStep(
  { question, value, recommended, error, onChange, customControl },
  headingRef,
) {
  const errorId = `${question.id}-error`;
  const titleId = `${question.id}-title`;

  return (
    <Stack spacing={3.5}>
      <Stack spacing={1.5}>
        <Typography id={titleId} ref={headingRef} tabIndex={-1} variant="h3" component="h1" sx={{ outline: "none", maxWidth: 720 }}>
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
          autoFocus
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
        <Box
          role={question.kind === "single" ? "radiogroup" : "group"}
          aria-labelledby={titleId}
          aria-describedby={error ? errorId : undefined}
          sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fill, minmax(260px, 1fr))" }, gap: 1.5 }}
        >
          {question.options.map((option, index) => {
            const selected = Array.isArray(value) ? value.includes(option.id) : value === option.id;
            return (
              <OptionCard
                key={option.id}
                option={option}
                selected={selected}
                multiple={question.kind === "multi"}
                shortcut={index < 9 ? index + 1 : undefined}
                recommended={recommended === option.id}
                impacts={optionImpacts(question.id, option.id)}
                onSelect={() => {
                  if (question.kind === "multi") {
                    const next = toggleMultiOption(question, Array.isArray(value) ? value : [], option.id);
                    onChange(next.length > 0 ? next : undefined);
                  } else {
                    onChange(option.id, { advance: true });
                  }
                }}
              />
            );
          })}
        </Box>
      )}

      {error && question.kind !== "text" && (
        <Typography id={errorId} role="alert" color="error" variant="body2">
          {error}
        </Typography>
      )}
    </Stack>
  );
});
