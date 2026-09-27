import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { alertChannelsKey, sendTestMessage } from "@/api/alerts";
import type { AlertChannel } from "@/types/alerts";

export type ChannelTestResult = { ok: boolean; message: string; elapsedMs: number };

export function useChannelTest(orgSlug: string) {
  const queryClient = useQueryClient();
  const [result, setResult] = useState<ChannelTestResult | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function send(channel: AlertChannel, isSaved = true) {
    setIsSending(true);
    setResult(null);
    const startedAt = performance.now();
    const response = await sendTestMessage(channel);
    const next = { ...response, elapsedMs: Math.round(performance.now() - startedAt) };
    setResult(next);
    setIsSending(false);
    if (isSaved) queryClient.invalidateQueries({ queryKey: alertChannelsKey(orgSlug) });
    return next;
  }

  return { result, isSending, send, reset: () => setResult(null) };
}
