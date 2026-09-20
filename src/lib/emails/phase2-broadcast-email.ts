import { escapeHtml, isSafeHttpsUrl } from '@/lib/security';

export function buildPhase2BroadcastEmail({
  teamName: rawTeam,
  leaderName: rawLeader,
  isRegistered = false,
  registeredCount = 48,
  totalTeams = 73,
  whatsappLink: rawWhatsapp = 'https://chat.whatsapp.com/LABDr9I1Y3QKUVi4Coa8QV',
}: {
  teamName: string;
  leaderName: string;
  isRegistered?: boolean;
  registeredCount?: number;
  totalTeams?: number;
  whatsappLink?: string;
}): string {
  const teamName = escapeHtml(rawTeam);
  const leaderName = escapeHtml(rawLeader);
  const whatsappLink = isSafeHttpsUrl(rawWhatsapp) ? rawWhatsapp : 'https://chat.whatsapp.com/LABDr9I1Y3QKUVi4Coa8QV';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SIH 2026 Phase 2 is Tomorrow — ${teamName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Raleway:wght@400;500;600;700;800&display=swap');
    body,table,td,p,a,li,blockquote{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;margin:0;padding:0;}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none;display:block;}
    @media only screen and (max-width:600px){
      .fluid-container{width:100%!important;max-width:100%!important;}
      .headline-text{font-size:25px!important;line-height:1.05!important;}
      .body-text{font-size:13px!important;line-height:1.5!important;}
      .cta-btn{padding:12px 16px!important;font-size:12px!important;}
      .hero-left{padding:22px 18px 26px 18px!important;}
      .header-cell{padding:14px 16px!important;}
      .info-cell{padding:20px 16px!important;}
      .footer-cell{padding:14px 16px!important;}
      .brief-card{padding:14px 12px!important;}
      .status-card{padding:14px 12px!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F0F2F5;font-family:'Raleway',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#111111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F0F2F5;padding:24px 8px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="fluid-container" style="max-width:620px;width:100%;background-color:#FFFFFF;border-collapse:collapse;box-shadow:0 12px 40px rgba(0,0,0,0.08);border-radius:6px;overflow:hidden;border:1px solid #E2E8F0;">
        
        <!-- HEADER -->
        <tr>
          <td class="header-cell" style="padding:18px 28px;background-color:#FFFFFF;border-bottom:3px solid #0072BC;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="vertical-align:middle;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="vertical-align:middle;padding-right:12px;"><img src="https://sih-ouce.meetthealtezza.tech/sih-logo-mono.png" alt="SIH Logo" width="44" height="44" style="width:44px;height:auto;" /></td>
                <td style="vertical-align:middle;border-left:2px solid #E5E7EB;padding-left:12px;">
                  <p style="margin:0;font-family:'Anton','Arial Black',Impact,sans-serif;font-size:14px;line-height:1.15;color:#111111;text-transform:uppercase;letter-spacing:0.02em;">SMART INDIA HACKATHON</p>
                  <p style="margin:2px 0 0;font-family:'Raleway',Arial,sans-serif;font-weight:700;font-size:10px;color:#0072BC;line-height:1.2;letter-spacing:0.04em;text-transform:uppercase;">OUCE INTERNAL ROUND 2026 &bull; PHASE 2</p>
                </td>
              </tr></table></td>
              <td style="vertical-align:middle;text-align:right;width:55px;"><img src="https://sih-ouce.meetthealtezza.tech/ouce-logo-mono.png" alt="OUCE Logo" width="48" height="48" style="display:inline-block;width:48px;height:auto;" /></td>
            </tr></table>
          </td>
        </tr>

        <!-- HERO SECTION -->
        <tr>
          <td style="padding:0;background-color:#FFFFFF;" bgcolor="#FFFFFF">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;"><tr>
              <td class="hero-left" style="padding:28px 24px 30px 28px;vertical-align:top;background-color:#FFFFFF;">
                
                <!-- URGENT TIMELINE BADGE -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                  <tr>
                    <td style="background-color:#FEF2F2;border:1px solid #F87171;padding:4px 10px;border-radius:3px;">
                      <p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:10px;font-weight:800;color:#DC2626;letter-spacing:0.06em;text-transform:uppercase;">
                        🚨 EVENT IS TOMORROW &bull; WEDNESDAY, 16 SEPT 2026
                      </p>
                    </td>
                  </tr>
                </table>

                <h1 class="headline-text" style="margin:0 0 10px;font-family:'Anton','Arial Black',Impact,sans-serif;font-size:30px;color:#111111;line-height:1.02;letter-spacing:-0.02em;text-transform:uppercase;word-break:break-word;">
                  PHASE 2 PITCHING IS TOMORROW: CRITICAL DIRECTIVES
                </h1>
                
                <div style="height:4px;width:48px;background-color:#0072BC;margin-bottom:16px;border-radius:2px;"></div>
                
                <p class="body-text" style="margin:0 0 14px;font-family:'Raleway',Arial,sans-serif;font-size:14px;color:#222222;line-height:1.55;font-weight:600;">
                  Dear <strong>${leaderName}</strong>, this is an official communication for team <strong style="color:#0072BC;">${teamName}</strong>. The <strong>Smart India Hackathon 2026 Phase 2 pitching round</strong> takes place <strong>TOMORROW, 16 September 2026</strong>, at the <strong>Assembly Hall, UCEOU</strong>.
                </p>

                <!-- SECTION 1: MANDATORY WHATSAPP GROUP CALLOUT (MAIN FOCAL POINT) -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="brief-card" style="background-color:#F0FDF4;border:2px solid #22C55E;border-left:5px solid #16A34A;padding:16px 18px;margin-bottom:18px;border-radius:4px;box-shadow:0 4px 12px rgba(34,197,94,0.12);">
                  <tr>
                    <td>
                      <p style="margin:0 0 6px;font-family:'Raleway',Arial,sans-serif;font-size:13px;font-weight:800;color:#15803D;text-transform:uppercase;letter-spacing:0.04em;">
                        💬 MANDATORY: JOIN THE TEAM LEADERS WHATSAPP GROUP
                      </p>
                      <p style="margin:0 0 14px;font-family:'Raleway',Arial,sans-serif;font-size:13px;color:#166534;line-height:1.55;font-weight:600;">
                        All tomorrow's live pitching schedules, team presentation orders, slot timings, and jury announcements will be communicated <strong>exclusively in this WhatsApp group</strong>. Every team leader must join immediately to avoid missing your slot.
                      </p>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="background-color:#25D366;border-radius:3px;box-shadow:0 3px 10px rgba(37,211,102,0.3);text-align:center;">
                            <a href="${whatsappLink}" target="_blank" class="cta-btn" style="display:block;padding:13px 18px;font-family:'Anton','Arial Black',Impact,sans-serif;font-size:13px;color:#FFFFFF;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;">
                              👉 JOIN TEAM LEADERS WHATSAPP GROUP NOW &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- SECTION 2: REGISTRATION STATUS / NOTICE -->
                ${
                  isRegistered
                    ? `
                <!-- REGISTERED TEAM NOTICE -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="status-card" style="background-color:#F0FDF4;border:1px solid #BBF7D0;border-left:3px solid #16A34A;padding:12px 14px;margin-bottom:18px;border-radius:3px;">
                  <tr>
                    <td>
                      <p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:12px;color:#166534;line-height:1.5;font-weight:600;">
                        ✅ Team <strong>${teamName}</strong> is registered for Phase 2. Make sure your presentation PDF (strictly 6 slides, &le; 2MB) is uploaded on your dashboard before evaluation tomorrow.
                      </p>
                    </td>
                  </tr>
                </table>
                `
                    : `
                <!-- UNREGISTERED TEAM NOTICE -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="status-card" style="background-color:#FFFBEB;border:1px solid #FDE68A;border-left:3px solid #D97706;padding:12px 14px;margin-bottom:18px;border-radius:3px;">
                  <tr>
                    <td>
                      <p style="margin:0 0 6px;font-family:'Raleway',Arial,sans-serif;font-size:13px;color:#92400E;line-height:1.55;font-weight:700;">
                        ⚠️ Hey, you formed a team but you didn't register for Phase 2 yet. If your team is participating, register ASAP on the portal:
                      </p>
                      <a href="https://sih-ouce.meetthealtezza.tech/phase2" target="_blank" style="font-family:'Raleway',Arial,sans-serif;font-size:12px;color:#B45309;font-weight:800;text-decoration:underline;">
                        Register for Phase 2 on the Portal &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
                `
                }

                <!-- SECTION 3: EVENT DIRECTIVES TABLE -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="brief-card" style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-left:3px solid #0072BC;padding:14px 16px;margin-bottom:20px;border-radius:4px;">
                  <tr>
                    <td>
                      <p style="margin:0 0 8px;font-family:'Raleway',Arial,sans-serif;font-size:11px;font-weight:800;color:#0F172A;text-transform:uppercase;letter-spacing:0.04em;">
                        ⚡ Tomorrow's Pitching Guidelines & Rules:
                      </p>
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:'Raleway',Arial,sans-serif;font-size:12px;color:#334155;line-height:1.6;font-weight:600;">
                        <tr><td style="padding:3px 0;"><strong>📅 Date:</strong> Tomorrow, 16 September 2026</td></tr>
                        <tr><td style="padding:3px 0;"><strong>📍 Venue:</strong> Assembly Hall, Main Building, UCEOU</td></tr>
                        <tr><td style="padding:3px 0;"><strong>⏱️ Slot Duration:</strong> 10 Minutes (5 mins presentation + 5 mins jury Q&amp;A)</td></tr>
                        <tr><td style="padding:3px 0;"><strong>📑 Slide Deck:</strong> Strictly 6 Slides &bull; PDF format &bull; &le; 2MB</td></tr>
                        <tr><td style="padding:3px 0;"><strong>📢 Slot Order:</strong> Live updates and queue posted exclusively in the WhatsApp group</td></tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- SECTION 4: PORTAL ACTION BUTTON -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="background-color:#0072BC;border-radius:3px;box-shadow:0 3px 10px rgba(0,114,188,0.25);text-align:center;">
                      <a href="https://sih-ouce.meetthealtezza.tech/phase2" target="_blank" class="cta-btn" style="display:block;padding:13px 20px;font-family:'Anton','Arial Black',Impact,sans-serif;font-size:13px;color:#FFFFFF;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;">
                        ${isRegistered ? 'VIEW PHASE 2 DASHBOARD & SUBMIT PDF &rarr;' : 'REGISTER FOR PHASE 2 NOW &rarr;'}
                      </a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr></table>
          </td>
        </tr>

        <!-- FOOTER INFO -->
        <tr>
          <td class="info-cell" style="padding:20px 28px 16px 28px;background-color:#FFFFFF;border-top:1px solid #E5E7EB;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <h3 style="margin:0 0 4px;font-family:'Anton','Arial Black',Impact,sans-serif;font-size:13px;color:#111111;text-transform:uppercase;letter-spacing:0.02em;">
                    OUCE SIH 2026 ORGANIZING COMMITTEE
                  </h3>
                  <p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:12px;color:#64748B;line-height:1.5;font-weight:600;">
                    Prof. Dr. T. Nagaveni, College SPOC &bull; University College of Engineering, Osmania University
                  </p>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;margin-bottom:12px;"><tr><td style="height:1px;background-color:#E5E7EB;"></td></tr></table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:11px;color:#666666;line-height:1.5;font-weight:600;">You received this broadcast email because you are a registered team leader for the OUCE SIH 2026 Internal Hackathon. Visit your <a href="https://sih-ouce.meetthealtezza.tech/phase2" style="color:#0072BC;text-decoration:underline;font-weight:800;">Phase 2 portal</a> anytime.</p></td></tr></table>
          </td>
        </tr>
        <tr>
          <td class="footer-cell" style="padding:12px 28px;background-color:#005A9C;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="vertical-align:middle;"><p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:11px;color:#FFFFFF;font-weight:600;letter-spacing:0.02em;line-height:1.4;">&copy; 2026 OUCE SIH &nbsp;|&nbsp; <a href="https://sih-ouce.meetthealtezza.tech" style="color:#ffffff;text-decoration:none;">sih-ouce.meetthealtezza.tech</a></p></td>
              <td style="vertical-align:middle;text-align:right;width:100px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;vertical-align:middle;"><tr>
                  <td style="padding-left:8px;vertical-align:middle;"><a href="https://www.linkedin.com/in/sih-uceou-03ba4a431/?skipRedirect=true" target="_blank" style="text-decoration:none;display:inline-block;"><img src="https://sih-ouce.meetthealtezza.tech/social-linkedin.png" alt="LinkedIn" width="20" height="20" style="display:block;width:20px;height:20px;border-radius:4px;" /></a></td>
                  <td style="padding-left:8px;vertical-align:middle;"><a href="https://www.instagram.com/sihxuceou.2k26?igsi=MXE3anRrOG90NDN0Zw==" target="_blank" style="text-decoration:none;display:inline-block;"><img src="https://sih-ouce.meetthealtezza.tech/social-instagram.png" alt="Instagram" width="20" height="20" style="display:block;width:20px;height:20px;border-radius:4px;" /></a></td>
                  <td style="padding-left:8px;vertical-align:middle;"><a href="https://x.com/sih2k26uceou" target="_blank" style="text-decoration:none;display:inline-block;"><img src="https://sih-ouce.meetthealtezza.tech/social-x.png" alt="X (Twitter)" width="20" height="20" style="display:block;width:20px;height:20px;border-radius:4px;" /></a></td>
                </tr></table>
              </td>
            </tr></table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
