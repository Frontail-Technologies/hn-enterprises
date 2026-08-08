import { useRef } from "react";
import { cn } from "@/lib/utils";

export function SegmentedDigitInput({
  value,
  onChange,
  digits = 10,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  digits?: number;
  className?: string;
}) {
  const characters = value.padEnd(digits, " ").slice(0, digits).split("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function setDigit(index: number, nextChar: string) {
    const clean = nextChar.replace(/\D/g, "").slice(-1);
    const next = characters.map((character) => (character === " " ? "" : character));
    next[index] = clean;
    onChange(next.join("").replace(/\s+$/, ""));

    if (clean && index < digits - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !characters[index]?.trim() && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < digits - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, digits);
    if (pasted) onChange(pasted);
  }

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {characters.map((character, index) => (
        <input
          key={index}
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={character === " " ? "" : character}
          onChange={(event) => setDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          className="h-8 w-6.5 shrink-0 rounded-md border border-input bg-transparent text-center text-xs font-medium outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      ))}
    </div>
  );
}
