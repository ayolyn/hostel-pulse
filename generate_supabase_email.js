const fs = require('fs');

const bg = '#0F172A';
const card = '#1E293B';
const brand = '#BEF264';
const text = '#F8FAFC';
const muted = '#94A3B8';

const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Action Required</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: 'Inter', Arial, sans-serif; background-color: ${bg}; color: ${text}; }
        .wrapper { width: 100%; table-layout: fixed; background-color: ${bg}; padding: 40px 0; }
        .main { max-width: 600px; margin: 0 auto; width: 100%; background-color: ${card}; border-radius: 24px; overflow: hidden; padding: 40px; box-sizing: border-box; }
        .logo { font-size: 24px; font-weight: 900; color: #ffffff; text-decoration: none; display: inline-flex; align-items: center; letter-spacing: -1px; margin-bottom: 30px; }
        .logo-accent { color: ${brand}; margin-right: 8px; }
        .subheading { color: ${brand}; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
        .title { font-size: 28px; font-weight: 900; color: #ffffff; margin: 0 0 20px 0; line-height: 1.2; letter-spacing: -0.5px; }
        .body-text { font-size: 15px; font-weight: 400; color: ${muted}; line-height: 1.6; margin: 0 0 24px 0; }
        .button { display: inline-block; background-color: ${brand}; color: #000000 !important; font-size: 14px; font-weight: 900; text-decoration: none; padding: 16px 32px; border-radius: 12px; margin: 8px 0 24px 0; }
        .fallback { background-color: rgba(0,0,0,0.2); border-radius: 12px; padding: 20px; font-size: 12px; color: ${muted}; word-break: break-all; line-height: 1.5; margin-bottom: 30px; }
        .fallback a { color: ${brand}; text-decoration: none; }
        .footer { text-align: center; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05); }
        .footer p { font-size: 12px; color: ${muted}; margin: 0 0 10px 0; font-weight: 700; }
    </style>
</head>
<body style="background-color: ${bg}; margin: 0; padding: 0;">
    <center class="wrapper">
        <div style="padding-bottom: 30px; text-align: center;">
            <a href="{{ .SiteURL }}" class="logo" style="font-family: 'Inter', Arial, sans-serif;">
                <span class="logo-accent" style="color: ${brand}; margin-right: 8px;">'</span> Hostel Pulse
            </a>
        </div>
        <table class="main" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: ${card}; border-radius: 24px; padding: 40px;">
            <tr>
                <td style="padding: 40px;">
                    <p class="subheading" style="font-family: 'Inter', Arial, sans-serif; color: ${brand}; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">WELCOME TO HOSTEL PULSE</p>
                    <h1 class="title" style="font-family: 'Inter', Arial, sans-serif; font-size: 28px; font-weight: 900; color: #ffffff; margin: 0 0 20px 0;">Verify your email</h1>
                    <div class="body-text" style="font-family: 'Inter', Arial, sans-serif; font-size: 15px; font-weight: 400; color: ${muted}; line-height: 1.6; margin: 0 0 24px 0;">
                        You're almost ready to get started. To complete your account setup and confirm your identity, please verify your email address using the secure link below.
                    </div>
                    
                    <a href="{{ .ConfirmationURL }}" class="button" style="font-family: 'Inter', Arial, sans-serif; display: inline-block; background-color: ${brand}; color: #000000; font-size: 14px; font-weight: 900; text-decoration: none; padding: 16px 32px; border-radius: 12px; margin: 8px 0 24px 0;">Verify Email</a>

                    <div class="fallback" style="font-family: 'Inter', Arial, sans-serif; background-color: rgba(0,0,0,0.2); border-radius: 12px; padding: 20px; font-size: 12px; color: ${muted}; word-break: break-all; line-height: 1.5; margin-bottom: 30px;">
                        If the button does not work, copy and paste this link into your browser:<br><br>
                        <a href="{{ .ConfirmationURL }}" style="color: ${brand}; text-decoration: none;">{{ .ConfirmationURL }}</a>
                    </div>

                    <div class="footer" style="font-family: 'Inter', Arial, sans-serif; text-align: center; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05);">
                        <p style="font-size: 12px; color: ${muted}; margin: 0 0 10px 0; font-weight: 700;">Stay connected</p>
                        <p style="font-size: 12px; font-weight: 400; color: ${muted}; opacity: 0.5; margin-top: 20px;">(c) 2026 Hostel Pulse. All rights reserved.</p>
                    </div>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>`;

fs.writeFileSync('supabase_email_template.html', template, 'utf-8');
console.log("Supabase email template created!");
