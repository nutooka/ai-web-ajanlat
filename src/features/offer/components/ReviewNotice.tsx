import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import ChecklistOutlined from "@mui/icons-material/ChecklistOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Quote } from "@/features/pricing/types";
import { palette } from "@/theme/tokens";

export const REVIEW_ID = "egyeztetes-szukseges";

/**
 * Risky or custom requests: say clearly that the price is a starting estimate and why,
 * plus what the customer will need to arrange. Nothing renders when neither applies.
 */
export function ReviewNotice({ quote }: { quote: Quote }) {
  const { review, requirements } = quote;
  if (!review.required && requirements.length === 0) return null;

  return (
    <Box id={REVIEW_ID} component="section" aria-label="Tudnivalók az árról" sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr", md: review.required && requirements.length > 0 ? "1fr 1fr" : "1fr" }, gap: 2, scrollMarginTop: 24 }}>
      {review.required && (
        <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, background: palette.surface, border: `2px solid ${palette.ink}` }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 1 }}>
            <FactCheckOutlined />
            <Typography variant="h6" component="h2">
              Technikai egyeztetés szükséges
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ mb: 1.5 }}>
            Néhány kérésed egyedi megoldást igényel, ezért az ár <b>kiinduló becslés</b>. Az ingyenes egyeztetésen megnézzük a részleteket, és utána fix árat adunk.
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {review.reasons.map((reason) => (
              <Typography component="li" variant="body2" key={reason} sx={{ mb: 0.5 }}>
                {reason}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
      {requirements.length > 0 && (
        <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, background: palette.surface, border: 1, borderColor: "divider" }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", mb: 1 }}>
            <ChecklistOutlined />
            <Typography variant="h6" component="h2">
              Amire szükség lesz
            </Typography>
          </Stack>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {requirements.map((item) => (
              <Typography component="li" variant="body2" key={item} sx={{ mb: 0.5 }}>
                {item}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
