'use client';

import { useState } from 'react';
import { UploadCloud, CheckCircle2, FileText, Loader2, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { uploadPhase2PDF } from '@/lib/actions/phase2-actions';

export function Phase2PDFSubmission({
  teamId,
  userId,
  isLeader,
  initialHasUploaded = false,
}: {
  teamId: string;
  userId: string;
  isLeader: boolean;
  initialHasUploaded?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(initialHasUploaded);
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/phase2_pdfs/${teamId}.pdf`;
  const fileUrl = `${baseUrl}?t=${cacheBuster}`;

  const handleViewPDF = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(`${baseUrl}?t=${Date.now()}`, '_blank', 'noopener,noreferrer');
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.size > 4 * 1024 * 1024) {
      toast.error('File size exceeds 4MB limit. Please compress your PDF before uploading.');
      return;
    }

    const name = selectedFile.name?.toLowerCase() || '';
    const type = selectedFile.type?.toLowerCase() || '';
    const isPdf = name.endsWith('.pdf') || type.includes('pdf') || type === 'application/octet-stream' || type === '';

    if (!isPdf) {
      toast.error('Please select a valid PDF file (.pdf).');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error('File size exceeds 4MB limit. Please compress your PDF before uploading.');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('teamId', teamId);

    // Strategy 1: Direct API Route (Supports maxDuration=60s on Vercel without Server Action timeout)
    try {
      const response = await fetch('/api/phase2/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        toast.success('Phase 2 PDF submitted successfully!');
        setHasUploaded(true);
        setCacheBuster(Date.now());
        setFile(null);
        setIsUploading(false);
        return;
      }

      if (data?.error && response.status < 500) {
        toast.error(data.error);
        setIsUploading(false);
        return;
      }
    } catch (apiErr) {
      console.warn('API route upload error, trying fallback server action...', apiErr);
    }

    // Strategy 2: Server Action fallback
    try {
      const res = await uploadPhase2PDF(formData);
      if (res.success) {
        toast.success('Phase 2 PDF submitted successfully!');
        setHasUploaded(true);
        setCacheBuster(Date.now());
        setFile(null);
        setIsUploading(false);
        return;
      } else {
        toast.error(res.error || 'Failed to upload. Please try again.');
      }
    } catch (err: any) {
      console.error('All upload attempts failed:', err);
      toast.error(
        'Upload timed out. If college network is weak, connect to Wi-Fi/Hotspot or submit via pendrive to organizers at the venue.',
        { duration: 8000 }
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-100 p-6 md:p-8 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-sih-blue uppercase tracking-widest bg-blue-50 px-2 py-0.5 border border-blue-100">
              Phase 2 &middot; Active Round
            </span>
          </div>
          <h2 className="heading-display text-2xl sm:text-3xl text-sih-dark">
            PDF SUBMISSION
          </h2>

          <div className="mt-4 space-y-5">
            {/* No upload deadline banner */}
            <div className="bg-blue-50/70 border-2 border-blue-200 p-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-sih-blue flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-blue-950 uppercase tracking-wide">
                    Submit on Event Day
                  </p>
                  <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                    As a registered Phase 2 team, you can upload or update your presentation PDF anytime before your pitch on 16 Sep.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-4">
              <p className="text-sm font-bold text-orange-800">
                ⚠️ SUBMISSION GUIDELINES:
              </p>
              <ul className="text-xs sm:text-sm text-orange-700 mt-2 space-y-1 list-disc list-inside">
                <li>
                  Submit your Phase 2 presentation based on your{' '}
                  <strong>selected problem statement</strong>.
                </li>
                <li>Strictly PDF format (&le; 4MB limit).</li>
                <li>
                  Uploading a new file will{' '}
                  <strong>replace and overwrite</strong> your previous submission.
                </li>
                <li className="text-orange-950 font-semibold">
                  📶 If you have low mobile network inside the hall, connect to college Wi-Fi, hotspot with a teammate, or provide the PDF on a USB drive to the room coordinators.
                </li>
              </ul>
            </div>

            {hasUploaded ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 border border-green-200">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="font-bold text-xs sm:text-sm uppercase tracking-wide">
                    Phase 2 Presentation Uploaded &amp; Saved
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={fileUrl}
                    onClick={handleViewPDF}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-sih-blue text-sih-blue font-bold text-xs sm:text-sm hover:bg-sih-blue hover:text-white transition-all active:scale-[0.97]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Submitted PDF
                  </a>

                  {isLeader && (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,application/pdf,application/x-pdf"
                          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploading}
                        />
                        <button
                          type="button"
                          disabled={isUploading}
                          className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-100 transition-all active:scale-[0.97]"
                        >
                          <FileText className="w-4 h-4" />
                          {file ? file.name : 'Select Replacement PDF'}
                        </button>
                      </div>
                      {file && (
                        <button
                          type="button"
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="btn-primary text-xs sm:text-sm flex items-center gap-2 py-2.5 px-4 cursor-pointer active:scale-[0.97]"
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UploadCloud className="w-4 h-4" />
                          )}
                          {isUploading ? 'Uploading...' : 'Overwrite & Submit'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {isLeader ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,application/pdf,application/x-pdf"
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                      <button
                        type="button"
                        disabled={isUploading}
                        className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-300 bg-gray-50 text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-100 transition-all active:scale-[0.97]"
                      >
                        <FileText className="w-4 h-4" />
                        {file ? file.name : 'Select PDF File'}
                      </button>
                    </div>
                    {file && (
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="btn-primary text-xs sm:text-sm flex items-center gap-2 py-2.5 px-4 cursor-pointer active:scale-[0.97]"
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UploadCloud className="w-4 h-4" />
                        )}
                        {isUploading ? 'Uploading...' : 'Submit PDF'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 px-4 py-3 text-xs sm:text-sm text-gray-500 font-bold">
                    Only the team leader can upload the Phase 2 PDF.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
