"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import type { PackageId } from "@/features/pricing/types";
import type { Answers } from "@/features/questionnaire/types";
import { wizardStore } from "@/lib/storage";

/** Opens a shared offer as your own (loads its answers into this browser). */
export function LoadSharedOfferButton({ answers, packageId }: { answers: Answers; packageId: PackageId }) {
  // Sits on the lime "shared offer" bar, so it is ink, not lime.
  const router = useRouter();
  return (
    <Button
      variant="contained"
      size="medium"
      sx={{ background: "#0E0F12", color: "#fff", "&:hover": { background: "#1A1C21" } }}
      endIcon={<ArrowForward />}
      onClick={() => {
        wizardStore.update({ answers, packageId });
        router.push("/ajanlat");
      }}
    >
      Megnyitom sajátként
    </Button>
  );
}
