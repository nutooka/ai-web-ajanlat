"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import type { PackageId } from "@/features/pricing/types";
import type { Answers } from "@/features/questionnaire/types";
import { wizardStore } from "@/lib/storage";

/** Opens a shared offer as your own (loads its answers into this browser). */
export function LoadSharedOfferButton({ answers, packageId }: { answers: Answers; packageId: PackageId }) {
  const router = useRouter();
  return (
    <Button
      variant="contained"
      color="primary"
      size="large"
      endIcon={<ArrowForward />}
      onClick={() => {
        wizardStore.update({ answers, packageId });
        router.push("/ajanlat");
      }}
    >
      Megnyitom a teljes ajánlatot
    </Button>
  );
}
