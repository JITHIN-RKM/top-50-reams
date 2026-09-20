export function buildAnnouncementEmail({
  title,
  content,
  adminOnly = false,
}: {
  title: string;
  content: string;
  adminOnly?: boolean;
}): string {
  const badgeText = adminOnly ? '🔒 ADMIN ONLY DIRECTIVE' : 'OFFICIAL BROADCAST';
  const badgeBg = adminOnly ? '#FEF2F2' : '#EBF5FF';
  const badgeBorder = adminOnly ? '#FECACA' : '#BFDBFE';
  const badgeColor = adminOnly ? '#DC2626' : '#0072BC';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Anton&family=Raleway:wght@400;600;700;800&display=swap');
    
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      margin: 0;
      padding: 0;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      border-collapse: collapse;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      display: block;
    }

    @media only screen and (max-width: 600px) {
      .fluid-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .headline-text {
        font-size: 26px !important;
        line-height: 1.05 !important;
      }
      .body-text {
        font-size: 13px !important;
        line-height: 1.5 !important;
      }
      .cta-btn {
        padding: 12px 20px !important;
        font-size: 12px !important;
      }
      .hero-left {
        padding: 24px 16px 32px 20px !important;
      }
      .header-cell {
        padding: 14px 16px !important;
      }
      .info-cell {
        padding: 24px 20px !important;
      }
      .footer-cell {
        padding: 16px 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F5F7; font-family: 'Raleway', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #111111;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F3F5F7; padding: 24px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="fluid-container" style="max-width: 620px; width: 100%; background-color: #FFFFFF; border-collapse: collapse; box-shadow: 0 10px 36px rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; border: 1px solid #E5E7EB;">
          
          <!-- 1. HEADER -->
          <tr>
            <td class="header-cell" style="padding: 18px 28px; background-color: #FFFFFF; border-bottom: 2px solid #0072BC;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 12px;">
                          <img src="https://sih-ouce.meetthealtezza.tech/sih-logo-mono.png" alt="SIH Logo" width="44" height="44" style="width: 44px; height: auto;" />
                        </td>
                        <td style="vertical-align: middle; border-left: 2px solid #E5E7EB; padding-left: 12px;">
                          <p style="margin: 0; font-family: 'Anton', 'Arial Black', Impact, sans-serif; font-size: 14px; line-height: 1.15; color: #111111; text-transform: uppercase; letter-spacing: 0.02em;">SMART INDIA HACKATHON</p>
                          <p style="margin: 2px 0 0; font-family: 'Raleway', Arial, sans-serif; font-weight: 700; font-size: 10px; color: #0072BC; line-height: 1.2; letter-spacing: 0.04em; text-transform: uppercase;">OUCE INTERNAL ROUND 2026</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="vertical-align: middle; text-align: right; width: 55px;">
                    <img src="https://sih-ouce.meetthealtezza.tech/ouce-logo-mono.png" alt="OUCE Logo" width="48" height="48" style="display: inline-block; width: 48px; height: auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2 & 3. MAIN HERO -->
          <tr>
            <td style="padding: 0; background-color: #FFFFFF;" bgcolor="#FFFFFF">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFFFFF;">
                <tr>
                  <td class="hero-left" width="56%" bgcolor="#FFFFFF" style="padding: 28px 16px 36px 28px; width: 56%; vertical-align: top; background-color: #FFFFFF;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; padding: 4px 10px; border-radius: 2px;">
                          <p style="margin: 0; font-family: 'Raleway', Arial, sans-serif; font-size: 10px; font-weight: 800; color: ${badgeColor}; letter-spacing: 0.06em; text-transform: uppercase;">${badgeText}</p>
                        </td>
                      </tr>
                    </table>
                    <h1 class="headline-text" style="margin: 0 0 14px; font-family: 'Anton', 'Arial Black', Impact, sans-serif; font-size: 34px; color: #111111; line-height: 0.98; letter-spacing: -0.02em; text-transform: uppercase; word-break: break-word;">${title}</h1>
                    <div style="height: 4px; width: 44px; background-color: #0072BC; margin-bottom: 20px; border-radius: 2px;"></div>
                    <div class="body-text" style="margin: 0 0 24px; font-family: 'Raleway', Arial, sans-serif; font-size: 14px; color: #111111; line-height: 1.6; font-weight: 600;">${content}</div>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color: #005A9C; border-radius: 3px; box-shadow: 0 3px 10px rgba(0,90,156,0.25);">
                          <a href="https://sih-ouce.meetthealtezza.tech/dashboard?tab=announcements" target="_blank" class="cta-btn" style="display: inline-block; padding: 14px 28px; font-family: 'Anton', 'Arial Black', Impact, sans-serif; font-size: 13px; color: #FFFFFF; text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase;">VIEW ON DASHBOARD &rarr;</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="44%" bgcolor="#0072BC" background="https://sih-ouce.meetthealtezza.tech/blueprint-bg.png" style="padding: 0; width: 44%; vertical-align: bottom; text-align: right; background-color: #0072BC; background-image: url('https://sih-ouce.meetthealtezza.tech/blueprint-bg.png'); background-repeat: repeat; background-position: top center;">
                    <img src="https://sih-ouce.meetthealtezza.tech/rocket.png" alt="Rocket Launch" width="270" style="display: block; width: 100%; max-width: 270px; height: auto; margin: 0 0 0 auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 4. LOWER INFO SECTION -->
          <tr>
            <td class="info-cell" style="padding: 20px 28px 16px 28px; background-color: #FFFFFF;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td><h3 style="margin: 0 0 4px; font-family: 'Anton', 'Arial Black', Impact, sans-serif; font-size: 15px; color: #111111; text-transform: uppercase; letter-spacing: 0.02em;">OUCE SIH 2026 TEAM</h3><p style="margin: 0; font-family: 'Raleway', Arial, sans-serif; font-size: 12px; color: #444444; line-height: 1.5; font-weight: 600;">University College of Engineering, Osmania University</p></td></tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 12px; margin-bottom: 12px;"><tr><td style="height: 1px; background-color: #E5E7EB;"></td></tr></table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td><p style="margin: 0; font-family: 'Raleway', Arial, sans-serif; font-size: 11px; color: #666666; line-height: 1.5; font-weight: 600;">You received this email because you are a registered participant or administrator for the OUCE SIH 2026 Internal Hackathon. Visit your <a href="https://sih-ouce.meetthealtezza.tech/dashboard" style="color: #0072BC; text-decoration: underline; font-weight: 800;">dashboard</a> to manage your team and track announcements.</p></td></tr>
              </table>
            </td>
          </tr>

          <!-- 5. FOOTER -->
          <tr>
            <td class="footer-cell" style="padding: 12px 28px; background-color: #005A9C;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;"><p style="margin: 0; font-family: 'Raleway', Arial, sans-serif; font-size: 11px; color: #FFFFFF; font-weight: 600; letter-spacing: 0.02em; line-height: 1.4;">&copy; 2026 OUCE SIH &nbsp;|&nbsp; <a href="https://sih-ouce.meetthealtezza.tech" style="color: #ffffff; text-decoration: none;">sih-ouce.meetthealtezza.tech</a></p></td>
                  <td style="vertical-align: middle; text-align: right; width: 100px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display: inline-block; vertical-align: middle;">
                      <tr>
                        <td style="padding-left: 8px; vertical-align: middle;">
                          <a href="https://www.linkedin.com/in/sih-uceou-03ba4a431/?skipRedirect=true" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://sih-ouce.meetthealtezza.tech/social-linkedin.png" alt="LinkedIn" width="20" height="20" style="display: block; width: 20px; height: 20px; border-radius: 4px;" />
                          </a>
                        </td>
                        <td style="padding-left: 8px; vertical-align: middle;">
                          <a href="https://www.instagram.com/sihxuceou.2k26?igsi=MXE3anRrOG90NDN0Zw==" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://sih-ouce.meetthealtezza.tech/social-instagram.png" alt="Instagram" width="20" height="20" style="display: block; width: 20px; height: 20px; border-radius: 4px;" />
                          </a>
                        </td>
                        <td style="padding-left: 8px; vertical-align: middle;">
                          <a href="https://x.com/sih2k26uceou" target="_blank" style="text-decoration: none; display: inline-block;">
                            <img src="https://sih-ouce.meetthealtezza.tech/social-x.png" alt="X (Twitter)" width="20" height="20" style="display: block; width: 20px; height: 20px; border-radius: 4px;" />
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
