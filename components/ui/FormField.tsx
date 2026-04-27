import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, required, hint, className, id, ...props }, ref) => {
    const fieldId = id ?? label;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-hidden="true">*</span>
          )}
        </label>
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cn(
            "rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
            "outline-none transition-colors",
            "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            error
              ? "border-red-400 bg-red-50 focus:ring-red-500"
              : "border-gray-300 bg-white hover:border-gray-400",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p id={`${fieldId}-hint`} className="text-xs text-gray-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${fieldId}-error`} className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  currentLength?: number;
  maxLength?: number;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, required, hint, currentLength, maxLength, className, id, ...props }, ref) => {
    const fieldId = id ?? label;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-hidden="true">*</span>
          )}
          {!required && (
            <span className="ml-1.5 text-xs font-normal text-gray-400">(선택)</span>
          )}
        </label>
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={cn(
            "rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400",
            "outline-none transition-colors resize-none",
            "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            error
              ? "border-red-400 bg-red-50 focus:ring-red-500"
              : "border-gray-300 bg-white hover:border-gray-400",
            className
          )}
          {...props}
        />
        <div className="flex justify-between">
          <div>
            {hint && !error && (
              <p id={`${fieldId}-hint`} className="text-xs text-gray-500">
                {hint}
              </p>
            )}
            {error && (
              <p id={`${fieldId}-error`} className="text-xs text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
          {maxLength !== undefined && (
            <p className={cn("text-xs", currentLength && currentLength > maxLength ? "text-red-500" : "text-gray-400")}>
              {currentLength ?? 0} / {maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextareaField.displayName = "TextareaField";
