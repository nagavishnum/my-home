"use client";

import { useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

import { useSpeechRecognition } from "./useSpeechRecognition";

type Props<T> = {
  parser: (transcript: string) => T;
  onParsed: (data: T) => void;
  disabled?: boolean;
  title?: string;
};

export default function VoiceInput<T>({
  parser,
  onParsed,
  disabled = false,
  title = "Add using voice",
}: Props<T>) {
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    reset,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!transcript || isListening) {
      return;
    }

    const parsed = parser(transcript);

    onParsed(parsed);

    reset();
  }, [
    transcript,
    isListening,
    parser,
    onParsed,
    reset,
  ]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <button
      type="button"
      onClick={handleMicClick}
      disabled={disabled}
      title={
        isListening
          ? "Stop listening"
          : title
      }
      aria-label={
        isListening
          ? "Stop listening"
          : title
      }
      style={{
        width: 56,
        height: 56,
        minWidth: 56,
        minHeight: 56,
        padding: 0,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled
          ? "not-allowed"
          : "pointer",
      }}
    >
      {isListening ? (
        <MicOff size={30} />
      ) : (
        <Mic size={30} />
      )}
    </button>
  );
}