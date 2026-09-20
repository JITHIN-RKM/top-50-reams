import { escapeHtml, isSafeHttpsUrl } from '@/lib/security';

export function buildPhase2GuidelinesEmail({
  teamName: rawTeam = 'Team Enthusiasts',
  leaderName: rawLeader = 'Enthusiastic Student',
  whatsappLink: rawWhatsapp = 'https://chat.whatsapp.com/LABDr9I1Y3QKUVi4Coa8QV',
}: {
  teamName?: string;
  leaderName?: string;
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
  <title>Welcome to Internal SIH Phase 2! 🚀 Important Guidelines &amp; Venue Details — ${teamName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Raleway:wght@400;500;600;700;800&display=swap');
    body,table,td,p,a,li,blockquote{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;margin:0;padding:0;}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none;display:block;}
    @media only screen and (max-width:640px){
      .fluid-container{width:100%!important;max-width:100%!important;}
      .headline-text{font-size:24px!important;line-height:1.08!important;}
      .body-text{font-size:13px!important;line-height:1.55!important;}
      .cta-btn{padding:12px 18px!important;font-size:12px!important;}
      .hero-left{padding:22px 18px 24px 18px!important;}
      .hero-right{display:none!important;}
      .header-cell{padding:14px 16px!important;}
      .info-cell{padding:18px 16px!important;}
      .footer-cell{padding:14px 16px!important;}
      .highlight-card{padding:12px 14px!important;}
      .attachment-box{padding:12px 14px!important;}
    }
    .email-wrapper{max-width:640px!important;width:100%!important;margin:0 auto!important;}
    .fluid-container{max-width:640px!important;width:100%!important;margin:0 auto!important;}
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F0F2F5;font-family:'Raleway',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#111111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F0F2F5;padding:28px 12px;margin:0;width:100%;">
    <tr><td align="center" style="padding:0;margin:0;">
      <!--[if (gte mso 9)|(IE)]>
      <table role="presentation" width="640" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td>
      <![endif]-->
      <div class="email-wrapper" style="max-width:640px;width:100%;margin:0 auto;text-align:left;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="fluid-container" style="max-width:640px;width:100%;background-color:#FFFFFF;border-collapse:collapse;box-shadow:0 12px 40px rgba(0,0,0,0.08);border-radius:6px;overflow:hidden;border:1px solid #E2E8F0;margin:0 auto;">
        
        <!-- HEADER WITH LOGOS -->
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

        <!-- HERO SECTION WITH BLUEPRINT & ROCKET ACCENT -->
        <tr>
          <td style="padding:0;background-color:#FFFFFF;" bgcolor="#FFFFFF">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF;"><tr>
              
              <!-- LEFT CONTENT -->
              <td class="hero-left" style="padding:28px 24px 30px 28px;vertical-align:top;background-color:#FFFFFF;">
                
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
                  <tr>
                    <td style="background-color:#EFF6FF;border:1px solid #BFDBFE;padding:4px 10px;border-radius:3px;">
                      <p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:10px;font-weight:800;color:#0072BC;letter-spacing:0.06em;text-transform:uppercase;">
                        🚀 PHASE 2 OFFICIAL BRIEFING &bull; 16 SEPT 2026
                      </p>
                    </td>
                  </tr>
                </table>

                <h1 class="headline-text" style="margin:0 0 10px;font-family:'Anton','Arial Black',Impact,sans-serif;font-size:28px;color:#111111;line-height:1.05;letter-spacing:-0.02em;text-transform:uppercase;word-break:break-word;">
                  WELCOME TO INTERNAL SIH PHASE 2!
                </h1>
                
                <div style="height:4px;width:48px;background-color:#0072BC;margin-bottom:16px;border-radius:2px;"></div>
                
                <p class="body-text" style="margin:0 0 12px;font-family:'Raleway',Arial,sans-serif;font-size:14px;color:#222222;line-height:1.55;font-weight:700;">
                  Dear Enthusiastic Students,
                </p>

                <p class="body-text" style="margin:0 0 14px;font-family:'Raleway',Arial,sans-serif;font-size:13px;color:#334155;line-height:1.6;font-weight:500;">
                  It is wonderful to see your dedication to innovating and pushing yourselves beyond just your standard academic curriculum! We are heartfully welcoming you and team <strong style="color:#0072BC;">${teamName}</strong> to <strong>Phase 2 of the Internal Smart India Hackathon (SIH) 2026</strong>.
                </p>

                <p class="body-text" style="margin:0 0 16px;font-family:'Raleway',Arial,sans-serif;font-size:13px;color:#334155;line-height:1.6;font-weight:500;">
                  To help you and your team prepare for a smooth and successful event on <strong>16 September 2026</strong>, please find attached two important documents: the official guidelines booklet (<strong>"Internal_SIH_Phase_2_Guidelines_2026.pdf"</strong>) and the <strong>venue details schedule</strong>.
                </p>

              </td>

              <!-- RIGHT BLUEPRINT ROCKET ACCENT -->
              <td class="hero-right" width="220" bgcolor="#0072BC" style="padding:0;width:220px;max-width:220px;min-width:180px;vertical-align:bottom;text-align:right;background-color:#0072BC;background-image:url('https://sih-ouce.meetthealtezza.tech/blueprint-bg.png');background-repeat:repeat;background-position:top center;">
                <img src="https://sih-ouce.meetthealtezza.tech/rocket.png" alt="Rocket Launch" width="220" style="display:block;width:100%;max-width:220px;height:auto;margin:0 auto;" />
              </td>

            </tr></table>
          </td>
        </tr>

        <!-- ATTACHMENT BOX -->
        <tr>
          <td style="padding:0 28px 18px 28px;background-color:#FFFFFF;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="attachment-box" style="background-color:#F8FAFC;border:1.5px dashed #94A3B8;border-radius:4px;padding:14px 16px;">
              <tr>
                <td>
                  <p style="margin:0 0 8px;font-family:'Raleway',Arial,sans-serif;font-size:11px;font-weight:800;color:#0F172A;text-transform:uppercase;letter-spacing:0.04em;">
                    📎 Attached Documents in this Email:
                  </p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:'Raleway',Arial,sans-serif;font-size:12px;color:#1E293B;line-height:1.5;">
                    <tr>
                      <td style="padding:4px 0;font-weight:700;">
                        📑 1. <span style="color:#0072BC;">Internal_SIH_Phase_2_Guidelines_2026.pdf</span> &bull; <span style="font-weight:500;color:#64748B;">Official Rules &amp; Evaluation Rubric</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;font-weight:700;">
                        📍 2. <span style="color:#0072BC;">Phase_2_Venues_and_Schedule.pdf</span> &bull; <span style="font-weight:500;color:#64748B;">Room Allocations &amp; Parallel Session Timings</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CRITICAL HIGHLIGHTS SECTION -->
        <tr>
          <td style="padding:0 28px 20px 28px;background-color:#FFFFFF;">
            <p style="margin:0 0 10px;font-family:'Raleway',Arial,sans-serif;font-size:13px;color:#111827;font-weight:700;line-height:1.5;">
              While we highly encourage you to read the attached guidelines book thoroughly, here are a few critical highlights your team must follow:
            </p>

            <!-- HIGHLIGHT 1: REGISTRATION -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="highlight-card" style="background-color:#FFFFFF;border:1px solid #E2E8F0;border-left:4px solid #0072BC;padding:12px 14px;margin-bottom:10px;border-radius:3px;">
              <tr>
                <td>
                  <p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:12.5px;color:#1E293B;line-height:1.55;">
                    <strong>🕒 Registration:</strong> Registration will take place strictly between <strong>9:00 AM and 10:00 AM</strong>. Please report with your complete 6-member team, ensuring that at least one female member is present.
                  </p>
                </td>
              </tr>
            </table>

            <!-- HIGHLIGHT 2: VENUES & SCHEDULE -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="highlight-card" style="background-color:#FFFFFF;border:1px solid #E2E8F0;border-left:4px solid #0072BC;padding:12px 14px;margin-bottom:10px;border-radius:3px;">
              <tr>
                <td>
                  <p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:12.5px;color:#1E293B;line-height:1.55;">
                    <strong>🏢 Venues &amp; Schedule:</strong> Because of the large number of registrations, there are <strong>four parallel sessions</strong> happening across the <strong>Main Building</strong> and the <strong>Department of ECE</strong>. Please check the attached venue details to find your specifically allotted room and report there well before your scheduled presentation time.
                  </p>
                </td>
              </tr>
            </table>

            <!-- HIGHLIGHT 3: PRESENTATION RULES -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="highlight-card" style="background-color:#FFFFFF;border:1px solid #E2E8F0;border-left:4px solid #0072BC;padding:12px 14px;margin-bottom:10px;border-radius:3px;">
              <tr>
                <td>
                  <p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:12.5px;color:#1E293B;line-height:1.55;">
                    <strong>⏱️ Presentation Rules:</strong> You must use the prescribed PPT template that was shared previously. You will have <strong>exactly 10 minutes total</strong>: 5 minutes for your presentation, followed by 5 minutes for a Question &amp; Answer session.
                  </p>
                </td>
              </tr>
            </table>

            <!-- HIGHLIGHT 4: PORTAL SUBMISSION -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="highlight-card" style="background-color:#FFFFFF;border:1px solid #E2E8F0;border-left:4px solid #0072BC;padding:12px 14px;margin-bottom:10px;border-radius:3px;">
              <tr>
                <td>
                  <p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:12.5px;color:#1E293B;line-height:1.55;">
                    <strong>💻 Portal Submission:</strong> Do not forget to upload your presentations to the portal at <a href="https://sih-ouce.meetthealtezza.tech/" target="_blank" style="color:#0072BC;font-weight:800;text-decoration:underline;">https://sih-ouce.meetthealtezza.tech/</a>.
                  </p>
                </td>
              </tr>
            </table>

            <!-- HIGHLIGHT 5: EVALUATION CRITERIA -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="highlight-card" style="background-color:#FFFFFF;border:1px solid #E2E8F0;border-left:4px solid #0072BC;padding:12px 14px;margin-bottom:10px;border-radius:3px;">
              <tr>
                <td>
                  <p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:12.5px;color:#1E293B;line-height:1.55;">
                    <strong>🎯 Evaluation Criteria:</strong> The jury will evaluate your project <strong>out of 100 marks</strong> based on novelty, technical complexity, feasibility, sustainability, and scale of impact, among other factors.
                  </p>
                </td>
              </tr>
            </table>

            <!-- HIGHLIGHT 6: SHORTLISTING & SIH PORTAL -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="highlight-card" style="background-color:#FEF3C7;border:1px solid #FCD34D;border-left:4px solid #D97706;padding:12px 14px;margin-bottom:14px;border-radius:3px;">
              <tr>
                <td>
                  <p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:12.5px;color:#92400E;line-height:1.55;font-weight:600;">
                    <strong>🏆 Top 45 &amp; Waitlist:</strong> If your team is shortlisted among the <strong>top 45 (or 5 waitlisted teams)</strong>, your team leader details will be uploaded to the official SIH Portal, where you will need to finalize your details before <strong>30 September 2026</strong>.
                  </p>
                </td>
              </tr>
            </table>

            <p class="body-text" style="margin:0 0 18px;font-family:'Raleway',Arial,sans-serif;font-size:13px;color:#334155;line-height:1.55;font-weight:600;">
              Please make sure your entire team is fully prepared and ready to present immediately when your turn is called. We wish you the very best of luck!
            </p>

            <!-- ACTION BUTTONS -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="background-color:#25D366;border-radius:3px;box-shadow:0 3px 10px rgba(37,211,102,0.3);text-align:center;">
                  <a href="${whatsappLink}" target="_blank" class="cta-btn" style="display:block;padding:13px 20px;font-family:'Anton','Arial Black',Impact,sans-serif;font-size:13px;color:#FFFFFF;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;">
                    👉 JOIN TEAM LEADS WHATSAPP GROUP &rarr;
                  </a>
                </td>
              </tr>
              <tr><td style="height:10px;"></td></tr>
              <tr>
                <td style="background-color:#0072BC;border-radius:3px;box-shadow:0 3px 10px rgba(0,114,188,0.25);text-align:center;">
                  <a href="https://sih-ouce.meetthealtezza.tech/phase2/dashboard" target="_blank" class="cta-btn" style="display:block;padding:13px 20px;font-family:'Anton','Arial Black',Impact,sans-serif;font-size:13px;color:#FFFFFF;text-decoration:none;letter-spacing:0.06em;text-transform:uppercase;">
                    OPEN PORTAL &amp; SUBMIT PPT &rarr;
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- FOOTER SIGN-OFF & INFO -->
        <tr>
          <td class="info-cell" style="padding:20px 28px 16px 28px;background-color:#FFFFFF;border-top:1px solid #E5E7EB;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <p style="margin:0 0 2px;font-family:'Raleway',Arial,sans-serif;font-size:13px;color:#1E293B;font-weight:700;">
                    Warm regards,
                  </p>
                  <p style="margin:0 0 2px;font-family:'Anton','Arial Black',Impact,sans-serif;font-size:13px;color:#111111;text-transform:uppercase;letter-spacing:0.02em;">
                    ORGANIZING COMMITTEE
                  </p>
                  <p style="margin:0 0 2px;font-family:'Raleway',Arial,sans-serif;font-size:12px;color:#0072BC;font-weight:700;">
                    Internal Smart India Hackathon 2026 &bull; Phase 2
                  </p>
                  <p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:11px;color:#64748B;line-height:1.4;">
                    University College of Engineering (A), Osmania University, Hyderabad
                  </p>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;margin-bottom:12px;"><tr><td style="height:1px;background-color:#E5E7EB;"></td></tr></table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td><p style="margin:0;font-family:'Raleway',Arial,sans-serif;font-size:11px;color:#666666;line-height:1.5;font-weight:600;">You received this email because you are a registered team leader for the OUCE SIH 2026 Internal Hackathon Phase 2. Visit your <a href="https://sih-ouce.meetthealtezza.tech/phase2" style="color:#0072BC;text-decoration:underline;font-weight:800;">Phase 2 portal</a> anytime.</p></td></tr></table>
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
    </div>
    <!--[if (gte mso 9)|(IE)]>
    </td></tr></table>
    <![endif]-->
  </td></tr>
  </table>
</body>
</html>`;
}
