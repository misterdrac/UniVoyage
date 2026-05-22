import * as React from "react";
import { cn } from "@/lib/utils";
import { OTP_CODE_LENGTH } from "./otpCode";

interface OtpCodeInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  ariaDescribedBy?: string;
  autoFocusFirst?: boolean;
}

function sanitizeDigit(value?: string) {
  return value && /^\d$/.test(value) ? value : "";
}

function sanitizeDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, OTP_CODE_LENGTH);
}

export function OtpCodeInput({
  value,
  onChange,
  disabled,
  ariaDescribedBy,
  autoFocusFirst = false,
}: OtpCodeInputProps) {
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_CODE_LENGTH }, (_, index) =>
    sanitizeDigit(value[index]),
  );

  const focusDigit = (index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const fillFromIndex = (startIndex: number, rawValue: string) => {
    const nextDigits = [...digits];
    const incomingDigits = sanitizeDigits(rawValue);
    if (!incomingDigits) return;

    incomingDigits.split("").forEach((digit, offset) => {
      const targetIndex = startIndex + offset;
      if (targetIndex < OTP_CODE_LENGTH) {
        nextDigits[targetIndex] = digit;
      }
    });

    onChange(nextDigits);
    focusDigit(
      Math.min(startIndex + incomingDigits.length, OTP_CODE_LENGTH - 1),
    );
  };

  const clearDigit = (index: number) => {
    const nextDigits = [...digits];
    nextDigits[index] = "";
    onChange(nextDigits);
  };

  React.useEffect(() => {
    if (!autoFocusFirst || disabled) return;
    focusDigit(0);
  }, [autoFocusFirst, disabled]);

  return (
    <div
      role="group"
      aria-label="Verification code"
      aria-describedby={ariaDescribedBy}
      className="grid grid-cols-6 gap-2"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1} of 6`}
          aria-describedby={ariaDescribedBy}
          value={digit}
          disabled={disabled}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            if (!sanitizeDigits(nextValue)) {
              clearDigit(index);
              return;
            }
            fillFromIndex(index, nextValue);
          }}
          onPaste={(event) => {
            event.preventDefault();
            fillFromIndex(index, event.clipboardData.getData("text"));
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace") {
              event.preventDefault();
              if (digits[index]) {
                clearDigit(index);
                return;
              }
              if (index > 0) {
                const nextDigits = [...digits];
                nextDigits[index - 1] = "";
                onChange(nextDigits);
                focusDigit(index - 1);
              }
              return;
            }

            if (event.key === "Delete") {
              event.preventDefault();
              clearDigit(index);
              return;
            }

            if (event.key === "ArrowLeft" && index > 0) {
              event.preventDefault();
              focusDigit(index - 1);
              return;
            }

            if (event.key === "ArrowRight" && index < OTP_CODE_LENGTH - 1) {
              event.preventDefault();
              focusDigit(index + 1);
            }
          }}
          className={cn(
            "h-12 min-w-0 rounded-xl border border-input bg-background text-center text-lg font-semibold tabular-nums ring-offset-background transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
      ))}
    </div>
  );
}
