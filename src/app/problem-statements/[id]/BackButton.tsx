'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();
  return (
    <button 
      onClick={() => router.back()} 
      className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-sih-blue transition-colors"
    >
      <ArrowLeft className="w-4 h-4" /> Back
    </button>
  );
}
