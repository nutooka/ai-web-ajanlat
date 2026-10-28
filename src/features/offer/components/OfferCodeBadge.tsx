"use client";

import CheckOutlined from "@mui/icons-material/CheckOutlined";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { PackageId } from "@/features/pricing/types";
import type { Answers } from "@/features/questionnaire/types";
import { palette } from "@/theme/tokens";
import { offerLink, useOfferCode } from "../useOfferCode";

/**
 * "Ajánlat-kód: K7M3QX · nutooka.tech/a/K7M3QX" – sits next to the price, so even a screenshot
 * sent on Messenger leads back to every answer.
 */
export function OfferCodeBadge({ answers, packageId }: { answers: Answers; packageId: PackageId }) {
  const code = useOfferCode(answers, packageId);
  const [copied, setCopied] = useState(false);
  if (!code) return <Box sx={{ minHeight: 32, mt: 2 }} />;

  const link = offerLink(code);
  const shortLink = link.replace(/^https?:\/\//, "");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Az ajánlat linkje:", link);
    }
  };

  return (
    <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, minHeight: 32 }}>
      <Typography component="span" sx={{ fontSize: 13, color: palette.inkMuted }}>
        Ajánlat-kód:{" "}
        <Box component="span" sx={{ color: "#fff", fontWeight: 800, letterSpacing: "0.08em", fontVariantNumeric: "tabular-nums" }}>
          {code}
        </Box>{" "}
        · {shortLink}
      </Typography>
      <ButtonBase
        onClick={() => void copy()}
        className="no-print"
        aria-label="Az ajánlat linkjének másolása"
        sx={{ minHeight: 32, px: 1.25, gap: 0.5, borderRadius: 1.5, border: `1px solid ${palette.inkLine}`, color: "#fff", fontSize: 13, fontWeight: 600, "&:hover": { borderColor: "#fff" }, "&.Mui-focusVisible": { outline: "2px solid #fff", outlineOffset: 2 } }}
      >
        {copied ? <CheckOutlined sx={{ fontSize: 16 }} /> : <ContentCopyOutlined sx={{ fontSize: 16 }} />}
        {copied ? "Másolva" : "Link másolása"}
      </ButtonBase>
    </Box>
  );
}
