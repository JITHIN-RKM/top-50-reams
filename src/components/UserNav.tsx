'use client';

import { UserButton } from '@clerk/nextjs';

interface UserNavProps {
  user?: any;
}

export default function UserNav({ user }: UserNavProps) {
  return (
    <div className="flex items-center">
      <UserButton
        appearance={{
          elements: {
            avatarBox: 'w-8 h-8 sm:w-9 sm:h-9 border border-gray-200',
          },
        }}
      />
    </div>
  );
}
