import { useState, useRef } from "react";
import { Mic, Loader2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";

export default function VoiceSearchButton({ onResult }) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(t => t.stop());
        await transcribeAudio(blob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast({ title: "לא ניתן לגשת למיקרופון", variant: "destructive", duration: 2000 });
    }
  };

  const handleStop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const transcribeAudio = async (blob) => {
    setTranscribing(true);
    try {
      const file = new File([blob], "voice.webm", { type: "audio/webm" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const transcript = await base44.integrations.Core.TranscribeAudio({ audio_url: file_url });
      onResult(transcript.trim());
    } catch {
      toast({ title: "שגיאה בתמלול", variant: "destructive", duration: 2000 });
    } finally {
      setTranscribing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={recording ? handleStop : handleStart}
      disabled={transcribing}
      className="h-12 w-12 rounded-2xl flex-shrink-0 border-2 border-primary/20"
      title="חיפוש קולי"
    >
      {transcribing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : recording ? (
        <Square className="w-5 h-5 text-red-500 fill-red-500" />
      ) : (
        <Mic className="w-5 h-5 text-primary" />
      )}
    </Button>
  );
}