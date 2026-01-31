import type React from "react";
import type { FC } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  success?: boolean;
  error?: boolean;
  hint?: string;
  label?: string; // ✅ label added
}

const Input: FC<InputProps> = ({
  type = "text",
  className = "",
  disabled = false,
  success = false,
  error = false,
  hint,
  label,
  ...rest
}) => {
  // Special case for checkbox
  if (type === "checkbox") {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={`h-5 w-5 cursor-pointer ${className}`}
          {...rest}
        />
        {label && <span className="text-sm text-gray-700 dark:text-white/90">{label}</span>}
      </div>
    );
  }

  // Input styles
  let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    inputClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
  } else if (success) {
    inputClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative">
      {/* Label */}
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-white/90">
          {label}
        </label>
      )}

      {/* Input field */}
      <input type={type} disabled={disabled} className={inputClasses} {...rest} />

      {/* Hint / error message */}
      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error ? "text-error-500" : success ? "text-success-500" : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
