interface BadgeProps {
  children: React.ReactNode;
  variant?: 'zinc' | 'success' | 'warning' | 'error' | 'blue';
  className?: string;
}

export const Badge = ({ children, variant = 'zinc', className = '' }: BadgeProps) => {
  const variants = {
    zinc: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
    success: "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-800 dark:border-zinc-200",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-500 border-amber-200 dark:border-amber-800",
    error: "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-500 border-rose-200 dark:border-rose-800",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-500 border-blue-200 dark:border-blue-800"
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
