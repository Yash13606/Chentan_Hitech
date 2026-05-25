"use client";

import { useState, useTransition } from "react";
import { MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { requestMeetingAction } from "@/server/actions/quotations";

type Props = {
  quotationId: string;
  /** Whether a meeting has already been requested for the parent inquiry. */
  alreadyRequested: boolean;
};

export function RequestMeetingButton({ quotationId, alreadyRequested }: Props) {
  const [requested, setRequested] = useState(alreadyRequested);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await requestMeetingAction(quotationId);
      if ("success" in result) {
        setRequested(true);
      } else {
        setError(result.error);
      }
    });
  }

  if (requested) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-1">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Meeting requested
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-background border border-border hover:bg-muted rounded-md px-3 py-1.5 transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <MessageSquare className="w-3.5 h-3.5" />
        )}
        Request Meeting
      </button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
