'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PreviewPhase2EmailPage() {
  const [emailType, setEmailType] = useState<'guidelines' | 'broadcast' | 'confirmation'>('guidelines');
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [teamName, setTeamName] = useState('Byte Bandits');
  const [leaderName, setLeaderName] = useState('Arjun Reddy');
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop' | 'full'>('desktop');
  const whatsappLink = 'https://chat.whatsapp.com/LABDr9I1Y3QKUVi4Coa8QV';

  const previewSrc = `/api/preview-phase2-email?type=${emailType}&registered=${isRegistered}&regCount=48&totalTeams=73&team=${encodeURIComponent(teamName)}&leader=${encodeURIComponent(leaderName)}&t=${encodeURIComponent(Date.now().toString())}`;

  const viewportWidths = {
    mobile: '390px',
    tablet: '520px',
    desktop: '640px',
    full: '100%',
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* TOP CONTROLS NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand / Status */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h1 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                Phase 2 Guidelines &amp; Venue Details Email
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Live Preview
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Official announcement + 2 PDF attachments to all team leaders
              </p>
            </div>
          </div>

          {/* Email Type Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setEmailType('guidelines')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                emailType === 'guidelines'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🚀 Guidelines &amp; Venue Email</span>
            </button>
            <button
              onClick={() => setEmailType('broadcast')}
              className={`px-3 py-1.5 rounded transition flex items-center gap-1.5 ${
                emailType === 'broadcast'
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📢 Previous Broadcast</span>
            </button>
          </div>

          {/* Device Toggles */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setViewport('mobile')}
              className={`px-3 py-1.5 rounded transition ${
                viewport === 'mobile'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📱 Mobile (390px)
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`px-3 py-1.5 rounded transition ${
                viewport === 'tablet'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📱 Tablet (520px)
            </button>
            <button
              onClick={() => setViewport('desktop')}
              className={`px-3 py-1.5 rounded transition ${
                viewport === 'desktop'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              💻 Email Client (640px)
            </button>
            <button
              onClick={() => setViewport('full')}
              className={`px-3 py-1.5 rounded transition ${
                viewport === 'full'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ↔️ Full Width
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <a
              href="/teams-breakdown"
              className="text-xs font-bold px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-md"
            >
              📊 Teams Segregation &amp; CSV ↗
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
            >
              <span>💬 Test WhatsApp Link ↗</span>
            </a>
          </div>

        </div>

        {/* Dynamic Testing Inputs */}
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Test Team Name:</span>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none w-44"
              placeholder="e.g. Byte Bandits"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Leader Name:</span>
            <input
              type="text"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none w-40"
              placeholder="e.g. Arjun Reddy"
            />
          </div>
          <div className="text-slate-500 flex items-center gap-1.5 ml-auto">
            <span>Official Group:</span>
            <code className="text-[11px] bg-slate-950 text-emerald-400 px-2 py-0.5 rounded border border-slate-800">
              {whatsappLink}
            </code>
          </div>
        </div>
      </header>

      {/* MAIN PREVIEW CANVAS */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-8 overflow-x-auto">
        <div
          className="transition-all duration-300 ease-out bg-white rounded-lg shadow-2xl overflow-hidden border border-slate-700 flex flex-col"
          style={{
            width: viewportWidths[viewport],
            maxWidth: '100%',
            height: 'calc(100vh - 170px)',
            minHeight: '720px',
          }}
        >
          {/* Iframe simulated top browser chrome */}
          <div className="bg-slate-100 border-b border-slate-300 px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="ml-2 font-mono text-[10px] text-slate-500 truncate max-w-xl">
                To: {leaderName.toLowerCase().replace(/\s+/g, '')}@gmail.com &bull; Subject: {emailType === 'guidelines' ? 'Welcome to Internal SIH Phase 2! 🚀 Important Guidelines & Venue Details' : `🚨 [SIH 2026] Phase 2 Pitching is Tomorrow (16 Sept) — ${teamName}`}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex-shrink-0">
              Viewport: {viewport === 'full' ? '100% Desktop (Centered 640px Card)' : viewportWidths[viewport]}
            </div>
          </div>

          <iframe
            src={previewSrc}
            title="Phase 2 Guidelines & Venue Details Email Preview"
            className="w-full flex-1 border-0 bg-[#F0F2F5]"
          />
        </div>

        {/* Verification Checklist Footnote */}
        <div className="mt-6 max-w-2xl w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 space-y-2 shadow-lg">
          <div className="font-semibold text-white flex items-center gap-2">
            <span>✅ Verification Checklist for Guidelines &amp; Venue Details Broadcast:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>
              <strong className="text-slate-200">Engineering Style:</strong> Fine technical strokes, Anton headline, and blueprint with rocket accent.
            </li>
            <li>
              <strong className="text-slate-200">Exact Copy Included:</strong> Full welcome text, 6 highlights (Registration 9-10 AM, 4 parallel venues in Main Building &amp; ECE, 10 min presentation rules, portal upload, 100-mark rubric, top 45 shortlisting).
            </li>
            <li>
              <strong className="text-slate-200">Attachments:</strong> 2 PDF attachment badges displayed in the email (Guidelines Booklet + Venue Details Schedule).
            </li>
            <li>
              <strong className="text-slate-200">WhatsApp &amp; Portal CTAs:</strong> Direct links to join the Team Leads WhatsApp group and open the portal.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
