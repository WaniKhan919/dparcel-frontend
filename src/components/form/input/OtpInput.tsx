import React, { useMemo, useRef } from "react";

type OtpInputProps = {
    length?: number;                 // default 6
    value: string;                   // controlled value (e.g. "123456")
    onChange: (val: string) => void; // setter from RHF or parent
    disabled?: boolean;
    className?: string;
    error?: boolean;                 // to style red border when invalid
    onComplete?: (val: string) => void; // optional: when all digits filled
};

const isDigit = (ch: string) => /^[0-9]$/.test(ch);

export default function OtpInput({
    length = 6,
    value,
    onChange,
    disabled,
    onComplete,
}: OtpInputProps) {
    // Ensure we always work with fixed-length array of chars
    const chars = useMemo(() => {
        const arr = new Array(length).fill("");
        (value || "")
            .slice(0, length)
            .split("")
            .forEach((c, i) => (arr[i] = c));
        return arr;
    }, [value, length]);

    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    // Focus helper
    const focusIndex = (idx: number) => {
        const el = inputsRef.current[idx];
        if (el) {
            el.focus();
            // select the content so typing overwrites
            requestAnimationFrame(() => el.setSelectionRange(0, 1));
        }
    };

    const setCharAt = (idx: number, ch: string) => {
        const next = chars.slice();
        next[idx] = ch;
        const nextVal = next.join("");
        onChange(nextVal);
        return nextVal;
    };

    const handleInput = (idx: number, raw: string) => {
        const c = raw.slice(-1); // last typed char
        if (!isDigit(c)) {
            // if not a digit, ignore
            setCharAt(idx, "");
            return;
        }
        const nextVal = setCharAt(idx, c);
        if (idx < length - 1) {
            focusIndex(idx + 1);
        }
        if (onComplete && nextVal.length === length && !nextVal.includes("")) {
            onComplete(nextVal);
        }
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            if (chars[idx]) {
                // if there is a char here, clear it and stay, then move left
                setCharAt(idx, "");
                if (idx > 0) focusIndex(idx - 1);
            } else {
                // if empty, move left and clear previous
                const prev = Math.max(0, idx - 1);
                setCharAt(prev, "");
                focusIndex(prev);
            }
            return;
        }

        if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (idx > 0) focusIndex(idx - 1);
        }

        if (e.key === "ArrowRight") {
            e.preventDefault();
            if (idx < length - 1) focusIndex(idx + 1);
        }
    };

    const handlePaste = (idx: number, e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text").replace(/\D/g, ""); // digits only
        if (!text) return;

        const next = chars.slice();
        let j = idx;
        for (let i = 0; i < text.length && j < length; i++, j++) {
            next[j] = text[i];
        }
        const nextVal = next.join("");
        onChange(nextVal);

        const lastFilled = Math.min(idx + text.length - 1, length - 1);
        focusIndex(lastFilled);

        if (onComplete && nextVal.length === length && !nextVal.includes("")) {
            onComplete(nextVal);
        }
    };

    return (
        <div className={'grid grid-cols-6 gap-2 w-full'}>
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        inputsRef.current[i] = el;
                    }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    type="text"
                    autoComplete="one-time-code"
                    maxLength={1}
                    disabled={disabled}
                    value={chars[i] ?? ""}
                    onChange={(e) => handleInput(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={(e) => handlePaste(i, e)}
                    onFocus={(e) => e.currentTarget.select()}
                    className="h-12 w-full rounded-lg border text-center text-xl font-medium"
                />
            ))}

        </div>
    );
}
