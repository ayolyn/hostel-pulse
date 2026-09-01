export function getEmailTemplate({
    preheader = '',
    subHeading = '',
    title = '',
    body = '',
    buttonText = '',
    buttonLink = '',
    showFallbackLink = true,
}: {
    preheader?: string;
    subHeading?: string;
    title: string;
    body: string;
    buttonText?: string;
    buttonLink?: string;
    showFallbackLink?: boolean;
}) {
    const brandColor = '#BEF264';
    const bgColor = '#0F172A'; // Dark slate background
    const cardColor = '#1E293B'; // Lighter slate for the card
    const textColor = '#F8FAFC'; // White/slate-50
    const mutedColor = '#94A3B8'; // Slate-400

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: 'Inter', Arial, sans-serif; background-color: ${bgColor}; color: ${textColor}; }
        .wrapper { width: 100%; table-layout: fixed; background-color: ${bgColor}; padding: 40px 0; }
        .main { max-width: 600px; margin: 0 auto; width: 100%; background-color: ${cardColor}; border-radius: 24px; overflow: hidden; padding: 40px; box-sizing: border-box; }
        .header { text-align: center; padding-bottom: 30px; }
        .logo { font-size: 24px; font-weight: 900; color: #ffffff; text-decoration: none; display: inline-flex; align-items: center; letter-spacing: -1px; }
        .logo-accent { color: ${brandColor}; }
        .subheading { color: ${brandColor}; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
        .title { font-size: 28px; font-weight: 900; color: #ffffff; margin: 0 0 20px 0; line-height: 1.2; letter-spacing: -0.5px; }
        .body-text { font-size: 15px; font-weight: 400; color: ${mutedColor}; line-height: 1.6; margin: 0 0 24px 0; }
        .button { display: inline-block; background-color: ${brandColor}; color: #000000 !important; font-size: 14px; font-weight: 900; text-decoration: none; padding: 16px 32px; border-radius: 12px; margin: 8px 0 24px 0; }
        .fallback { background-color: rgba(0,0,0,0.2); border-radius: 12px; padding: 20px; font-size: 12px; color: ${mutedColor}; word-break: break-all; line-height: 1.5; margin-bottom: 30px; }
        .fallback a { color: ${brandColor}; text-decoration: none; }
        .footer { text-align: center; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05); }
        .footer p { font-size: 12px; color: ${mutedColor}; margin: 0 0 10px 0; font-weight: 700; }
    </style>
</head>
<body style="background-color: ${bgColor}; margin: 0; padding: 0;">
    <!-- Preheader text -->
    <div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>

    <center class="wrapper">
        <div style="padding-bottom: 30px; text-align: center;">
            <a href="https://hostel-pulse.pages.dev" class="logo" style="font-family: 'Inter', Arial, sans-serif;">
                <span class="logo-accent" style="margin-right: 8px;">'</span> Hostel Pulse
            </a>
        </div>
        <table class="main" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: ${cardColor}; border-radius: 24px; padding: 40px;">
            <tr>
                <td style="padding: 40px;">
                    ${subHeading ? `<p class="subheading" style="font-family: 'Inter', Arial, sans-serif;">${subHeading}</p>` : ''}
                    <h1 class="title" style="font-family: 'Inter', Arial, sans-serif;">${title}</h1>
                    <div class="body-text" style="font-family: 'Inter', Arial, sans-serif;">
                        ${body}
                    </div>
                    
                    ${buttonText && buttonLink ? `
                        <a href="${buttonLink}" class="button" style="font-family: 'Inter', Arial, sans-serif;">${buttonText}</a>
                    ` : ''}

                    ${buttonText && buttonLink && showFallbackLink ? `
                        <div class="fallback" style="font-family: 'Inter', Arial, sans-serif;">
                            If the button does not work, copy and paste this link into your browser:<br><br>
                            <a href="${buttonLink}">${buttonLink}</a>
                        </div>
                    ` : ''}

                    <div class="footer" style="font-family: 'Inter', Arial, sans-serif;">
                        <p>Stay connected</p>
                        <!-- Social Icons could go here -->
                        <p style="font-weight: 400; opacity: 0.5; margin-top: 20px;">(c) ${new Date().getFullYear()} Hostel Pulse. All rights reserved.</p>
                    </div>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
    `;
}
