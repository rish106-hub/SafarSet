"use client";

import { useRef, useState } from "react";
import { ArrowUp, LinkIcon, Mic, Square, Sparkles } from "lucide-react";
import Link from "next/link";

type Entry = Readonly<{ role: "USER" | "ASSISTANT"; text: string; links?: readonly Readonly<{ label: string; href: string }>[]; mode?: string }>;

export function AgentConsole() {
  const [entries, setEntries] = useState<Entry[]>([{ role: "ASSISTANT", text: "What are you planning or trying to fix? You can ask about saved trips, family rules, live status, or a new trip." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  async function send(text = input, source: "TEXT" | "VOICE_TRANSCRIPT" = "TEXT") {
    const clean = text.trim();
    if (!clean || busy) return;
    setBusy(true); setError(""); setInput(""); setEntries((items) => [...items, { role: "USER", text: clean }]);
    try {
      const response = await fetch("/api/agent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: clean, conversationId, source }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Request failed.");
      setConversationId(payload.conversationId); setEntries((items) => [...items, { role: "ASSISTANT", text: payload.reply, links: payload.links, mode: payload.mode }]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The agent is unavailable."); }
    finally { setBusy(false); }
  }

  async function toggleRecording() {
    if (recording) { recorder.current?.stop(); return; }
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream); chunks.current = []; recorder.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => { if (event.data.size) chunks.current.push(event.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop()); setRecording(false); setBusy(true);
        const form = new FormData(); form.set("audio", new File([new Blob(chunks.current, { type: mediaRecorder.mimeType })], "recording.webm", { type: mediaRecorder.mimeType })); chunks.current = [];
        try { const response = await fetch("/api/agent/transcribe", { method: "POST", body: form }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error); setInput(payload.text); }
        catch (cause) { setError(cause instanceof Error ? cause.message : "Voice transcription failed."); }
        finally { setBusy(false); }
      };
      mediaRecorder.start(); setRecording(true);
    } catch { setError("Microphone access was not available."); }
  }

  return <div className="grid min-h-[calc(100vh-170px)] overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white lg:grid-cols-[240px_1fr]"><aside className="hidden border-r border-[#E4E7EB] bg-[#F7FAFC] p-5 lg:block"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[#147D92]">Agent boundaries</p><ul className="mt-5 space-y-3 text-sm leading-6 text-[#52606D]"><li>Reads your saved context</li><li>Drafts plans to verify</li><li>Shows provider limits</li><li>Never books or pays silently</li></ul><div className="mt-8 rounded-xl border border-[#F6AD55]/40 bg-[#FFF8EC] p-3 text-xs leading-5 text-[#7B6232]">Voice audio is discarded after transcription. Only text enters this chat.</div></aside><section className="flex min-h-[620px] flex-col"><div className="flex items-center justify-between border-b border-[#E4E7EB] px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-[#E3F8F8] text-[#147D92]"><Sparkles className="size-4" /></span><div><h2 className="text-sm font-semibold">SafarSet agent</h2><p className="text-xs text-[#7B8794]">Draft, check, then confirm</p></div></div></div><div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-7">{entries.map((entry, index) => <div key={index} className={entry.role === "USER" ? "ml-auto max-w-[85%]" : "max-w-[90%]"}><div className={entry.role === "USER" ? "whitespace-pre-wrap rounded-2xl rounded-br-md bg-[#102A43] px-4 py-3 text-sm leading-6 text-white" : "whitespace-pre-wrap rounded-2xl rounded-bl-md bg-[#F0F4F8] px-4 py-3 text-sm leading-6 text-[#334E68]"}>{entry.text}</div>{entry.mode && <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[.12em] text-[#9FB3C8]">{entry.mode.replace("_", " ")}</p>}{entry.links?.length ? <div className="mt-2 flex flex-wrap gap-2">{entry.links.map((item) => <Link key={item.href} href={item.href} className="inline-flex items-center gap-1.5 rounded-lg border border-[#BCCCDC] px-3 py-2 text-xs font-medium text-[#147D92]"><LinkIcon className="size-3" />{item.label}</Link>)}</div> : null}</div>)}{busy && <p className="text-sm text-[#627D98]">Working…</p>}</div><div className="border-t border-[#E4E7EB] p-4 sm:p-5">{error && <p className="mb-3 rounded-lg bg-[#FFF5F5] px-3 py-2 text-sm text-[#9B2C2C]" role="alert">{error}</p>}<form className="flex items-end gap-2" onSubmit={(event) => { event.preventDefault(); void send(); }}><label className="sr-only" htmlFor="agent-message">Message</label><textarea id="agent-message" value={input} onChange={(event) => setInput(event.target.value)} rows={2} className="min-h-12 flex-1 resize-none rounded-xl border border-[#BCCCDC] px-4 py-3 text-sm outline-none focus:border-[#2CB1BC]" placeholder="Ask about a trip, rule, or plan…" /><button type="button" onClick={() => void toggleRecording()} aria-label={recording ? "Stop recording" : "Record a message"} className={`grid size-12 shrink-0 place-items-center rounded-xl border ${recording ? "border-[#D64545] bg-[#FFF5F5] text-[#D64545]" : "border-[#BCCCDC] text-[#52606D]"}`}>{recording ? <Square className="size-4 fill-current" /> : <Mic className="size-5" />}</button><button type="submit" disabled={busy || !input.trim()} aria-label="Send message" className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#102A43] text-white disabled:opacity-40"><ArrowUp className="size-5" /></button></form></div></section></div>;
}
