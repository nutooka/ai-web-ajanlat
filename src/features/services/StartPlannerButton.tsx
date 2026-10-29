"use client";

import ArrowForward from "@mui/icons-material/ArrowForward";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import { startPlanner } from "@/components/home/startPlanner";

/** Starts the questionnaire with this service's project type already chosen. */
export function StartPlannerButton({ projectType, children }: { projectType: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Button variant="contained" color="primary" size="large" endIcon={<ArrowForward />} onClick={() => startPlanner(projectType, router.push)}>
      {children}
    </Button>
  );
}
