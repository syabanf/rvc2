"use client";

type StepperProps = {
  name: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  labelledBy: string;
  hint?: string;
};

export function Stepper({ name, value, onChange, min = 1, max, labelledBy, hint }: StepperProps) {
  const set = (v: number) => onChange(Math.max(min, Math.min(max, v)));
  return (
    <div className="stepper" role="group" aria-labelledby={labelledBy}>
      <button type="button" aria-label="Fewer tickets" disabled={value <= min} onClick={() => set(value - 1)}>
        −
      </button>
      <output aria-live="polite">{value}</output>
      <input type="hidden" name={name} value={value} />
      <button type="button" aria-label="More tickets" disabled={value >= max} onClick={() => set(value + 1)}>
        +
      </button>
      {hint && <span className="stepper__hint">{hint}</span>}
    </div>
  );
}
