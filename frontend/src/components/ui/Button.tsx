import Link from 'next/link';
import { forwardRef } from 'react';
import { Spinner } from '@/components/Loading';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variantClass: Record<Variant, string> = {
  primary:   'bg-gradient-brand text-white shadow-pop hover:brightness-110 active:brightness-95',
  secondary: 'bg-white text-ink border border-gray-200 hover:border-brand-300 hover:bg-brand-50/50',
  ghost:     'bg-transparent text-gray-700 hover:bg-gray-100',
  danger:    'bg-error text-white hover:brightness-110',
};

const sizeClass: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
  md: 'text-sm px-4 py-2 rounded-lg gap-2',
  lg: 'text-base px-6 py-3 rounded-xl gap-2',
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
};

const base =
  'inline-flex items-center justify-center font-medium transition disabled:opacity-50 disabled:cursor-not-allowed no-underline hover:no-underline select-none';

export const Button = forwardRef<HTMLButtonElement, BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function Button({ variant = 'primary', size = 'md', loading, className = '', children, disabled, ...rest }, ref) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variantClass[variant]} ${sizeClass[size]} ${className}`}
        {...rest}
      >
        {loading && <Spinner size={14} />}
        {children}
      </button>
    );
  }
);

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: BaseProps & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className'>) {
  return (
    <Link
      href={href}
      className={`${base} ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
