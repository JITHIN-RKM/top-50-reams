'use client';

import { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle2, FileText, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { uploadPPT } from '@/lib/actions/ppt-actions';

export function PPTSubmissionCard({ teamId, isFinalized, isLeader, initialHasUploaded }: { teamId: string, isFinalized: boolean, isLeader: boolean, initialHasUploaded: boolean }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(initialHasUploaded);
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/team_ppts/${teamId}.pdf`;
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

    if (selectedFile.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds 2MB limit. Please compress your PDF before uploading.');
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

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2MB limit. Please compress your PDF before uploading.");
      return;
    }

    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('teamId', teamId);
    
    try {
      const res = await uploadPPT(formData);
      if (res.success) {
        toast.success("Presentation PDF submitted successfully!");
        setHasUploaded(true);
        setCacheBuster(Date.now());
        setFile(null);
      } else {
        toast.error(res.error || "Failed to upload. Please try again.");
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error("Upload could not complete due to network connection. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-100 p-6 md:p-8 shadow-sm relative overflow-hidden mt-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target</p>
          <h2 className="heading-display text-2xl text-sih-dark">PPT SUBMISSION</h2>
          
          <div className="mt-4 space-y-6">
            <div className="bg-orange-50 border border-orange-200 p-4">
              <p className="text-sm font-bold text-orange-800">⚠️ IMPORTANT INSTRUCTIONS:</p>
              <ul className="text-sm text-orange-700 mt-2 space-y-1 list-disc list-inside">
                <li>Your presentation must be based on your <strong>PRIMARY PROBLEM STATEMENT ONLY</strong>.</li>
                <li>Only PDF files are accepted (Max 2MB).</li>
                <li>If you upload again, it will <strong>permanently delete and overwrite</strong> your previous submission.</li>
              </ul>
            </div>

            {hasUploaded ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 border border-green-200">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold text-sm uppercase tracking-wide">Presentation Submitted</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <a 
                    href={fileUrl} 
                    onClick={handleViewPDF}
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border-2 border-sih-blue text-sih-blue font-bold text-sm hover:bg-sih-blue hover:text-white transition-colors"
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
                          className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 bg-gray-50 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          {file ? file.name : "Select Replacement PDF"}
                        </button>
                      </div>
                      {file && (
                        <button
                          type="button"
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="btn-primary text-sm flex items-center gap-2 cursor-pointer active:scale-[0.97]"
                        >
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                          Overwrite & Submit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
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
                        className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 bg-gray-50 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        {file ? file.name : "Select PDF File"}
                      </button>
                    </div>
                    {file && (
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="btn-primary text-sm flex items-center gap-2 cursor-pointer active:scale-[0.97]"
                      >
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                        Submit Presentation
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-500 font-bold">
                    Only the team leader can upload the PPT.
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
