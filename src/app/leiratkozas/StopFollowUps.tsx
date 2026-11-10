"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string };

export function StopFollowUps() {
  const token = useSearchParams().get("t") ?? "";
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  if (!token) return <Alert severity="warning">Hiányzik a leiratkozó kód. Nyisd meg újra a levél alján lévő linket.</Alert>;
  if (status.kind === "done") return <Alert severity="success">Kész, erről több levelet nem küldünk.</Alert>;

  async function stop() {
    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/followup/stop", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: token }) });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      setStatus(body.ok ? { kind: "done" } : { kind: "error", message: body.error ?? "Nem sikerült. Próbáld újra." });
    } catch {
      setStatus({ kind: "error", message: "Nincs kapcsolat. Próbáld újra." });
    }
  }

  return (
    <>
      {status.kind === "error" && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {status.message}
        </Alert>
      )}
      <Button variant="contained" size="large" onClick={stop} disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Leállítás…" : "Nem kérek több levelet"}
      </Button>
    </>
  );
}
