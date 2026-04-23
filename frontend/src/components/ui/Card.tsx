export function Card({
  className = '',
  children,
  as: Tag = 'div',
  hover = false,
}: {
  className?: string;
  children: React.ReactNode;
  as?: 'div' | 'section' | 'article';
  hover?: boolean;
}) {
  return (
    <Tag
      className={[
        'bg-white rounded-2xl border border-gray-100 shadow-card p-6',
        hover && 'transition hover:shadow-card-hover hover:border-brand-200',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  icon,
  action,
  subtitle,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="min-w-0">
        <h2 className="font-semibold text-ink flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
