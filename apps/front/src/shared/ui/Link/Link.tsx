import { Link as RouterLink } from 'react-router-dom';
import { LinkHTMLAttributes } from 'react';

interface LinkProps extends LinkHTMLAttributes<HTMLAnchorElement> {
  to: string;
  variant?: 'primary' | 'secondary';
}

export const Link = ({
  to,
  variant = 'primary',
  className = '',
  children,
  ...props
}: LinkProps) => {
  const variantStyles = {
    primary:
      'text-[var(--tg-theme-link-color)] hover:text-[var(--tg-theme-button-color)] transition-colors duration-200',
    secondary:
      'text-[var(--tg-theme-text-color)] hover:text-[var(--tg-theme-hint-color)] transition-colors duration-200',
  };

  return (
    <RouterLink to={to} className={`font-medium ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </RouterLink>
  );
};
