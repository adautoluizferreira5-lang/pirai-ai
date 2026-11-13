import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-dark-700">{label}</label>}
      <input
        className={`rounded-lg border border-dark-300 px-3.5 py-2 text-sm text-dark-900 outline-none transition-colors placeholder:text-dark-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${className}`}
        {...props}
      />
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-dark-700">{label}</label>}
      <textarea
        className={`rounded-lg border border-dark-300 px-3.5 py-2 text-sm text-dark-900 outline-none transition-colors placeholder:text-dark-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${className}`}
        {...props}
      />
    </div>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { value: string; label: string }[];
};

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-dark-700">{label}</label>}
      <select
        className={`rounded-lg border border-dark-300 px-3.5 py-2 text-sm text-dark-900 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
