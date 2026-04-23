import { forwardRef } from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, hint, error, id, className = '', ...rest }, ref
) {
  const inputId = id || rest.name;
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={[
          'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink',
          'placeholder:text-gray-400 transition',
          error
            ? 'border-red-300 focus:border-red-500'
            : 'border-gray-200 focus:border-brand-400',
          className,
        ].join(' ')}
        {...rest}
      />
      {hint && !error && <p className="text-xs text-gray-500 mt-1.5">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
});
