'use client';

import { toast } from 'sonner';

interface ContactEmailLinkProps {
  email: string;
  className?: string;
  children: React.ReactNode;
}

export default function ContactEmailLink({ email, className, children }: ContactEmailLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Copy to clipboard
    navigator.clipboard.writeText(email).then(() => {
      toast.success(`Copied "${email}" to clipboard!`, {
        description: 'Your mail app should open. If it doesn\'t, you can paste the copied address.',
        duration: 4000,
      });
    }).catch(() => {
      // Fallback if clipboard fails
      toast.info(`Contact Email: ${email}`);
    });
  };

  return (
    <a
      href={`mailto:${email}`}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
