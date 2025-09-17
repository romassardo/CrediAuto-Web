import { Resend } from 'resend';
import fs from 'node:fs';
import path from 'node:path';

// Lazy initialization: avoid constructing Resend at module load time
// so GET routes that import this module don't throw when RESEND_API_KEY is missing.
let resendClient: Resend | null = null;
const getResend = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
};

// Remitente configurable desde variables de entorno
const EMAIL_FROM = process.env.EMAIL_FROM || 'Crediexpress Automotor <onboarding@resend.dev>';

// Helper para obtener el logo como attachment inline (CID)
function getLogoAttachment() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'crediexpress-logo.png');
    const content = fs.readFileSync(filePath).toString('base64');
    return {
      content,
      filename: 'crediexpress-logo.png',
      contentType: 'image/png',
      // disposition inline ayuda a algunos clientes a respetar el CID
      disposition: 'inline',
      // Algunos ejemplos de Resend usan content_id (snake_case) en lugar de contentId
      contentId: 'crediexpress-logo',
      content_id: 'crediexpress-logo',
      headers: { 'Content-ID': '<crediexpress-logo>' },
    } as const;
  } catch (err) {
    // Fallback a path remoto por si falla la lectura local (no debería)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return {
      path: `${baseUrl}/crediexpress-logo.png`,
      filename: 'crediexpress-logo.png',
      contentType: 'image/png',
      disposition: 'inline',
      contentId: 'crediexpress-logo',
      content_id: 'crediexpress-logo',
      headers: { 'Content-ID': '<crediexpress-logo>' },
    } as const;
  }
}

interface SendCredentialsEmailParams {
  to: string;
  dealerName: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}

export async function sendDealerCredentials({
  to,
  dealerName,
  email,
  tempPassword,
  loginUrl
}: SendCredentialsEmailParams) {
  try {
    const client = getResend();
    if (!client) {
      // No API key configured: skip sending gracefully
      // and let the caller decide what to do.
      console.warn('Resend API key not configured. Skipping email send.');
      return { success: false, error: new Error('RESEND_API_KEY not configured') } as const;
    }

    // Base URL para recursos públicos (logo, links) – mejora compatibilidad en clientes de email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL || 'https://crediexpressautos.com.ar';

    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to: [to],
      replyTo: process.env.CONTACT_RECIPIENT || undefined,
      subject: '¡Bienvenido a Crediexpress Automotor! - Credenciales de acceso',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a Crediexpress Automotor</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            
            <!-- Header con gradiente de marca -->
            <div style="background: linear-gradient(135deg, #2e3192 0%, #1e40af 100%); background-color: #1e40af; padding: 40px 30px; text-align: center;">
              <div style="margin-bottom: 16px;">
                <img src="${baseUrl}/crediexpress-logo.png" alt="Crediexpress Automotor" width="200" style="display:block; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;" />
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">¡Bienvenido a Crediexpress Automotor!</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Tu concesionario ha sido aprobado</p>
            </div>

            <!-- Contenido principal -->
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Estimado/a <strong>${dealerName}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Nos complace informarte que tu solicitud para unirte a Crediexpress Automotor ha sido <strong style="color: #059669;">aprobada</strong>. 
                Ya puedes acceder a tu portal de concesionario y comenzar a gestionar tus solicitudes de crédito.
              </p>

              <!-- Credenciales en tarjeta destacada -->
              <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; margin: 30px 0;">
                <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                  🔐 Tus credenciales de acceso:
                </h3>
                
                <div style="margin-bottom: 12px;">
                  <strong style="color: #374151; display: inline-block; width: 100px;">Usuario:</strong>
                  <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace;">${email}</code>
                </div>
                
                <div style="margin-bottom: 16px;">
                  <strong style="color: #374151; display: inline-block; width: 100px;">Contraseña:</strong>
                  <code style="background-color: #fef3c7; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace; color: #92400e;">${tempPassword}</code>
                </div>

                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px;">
                  <p style="color: #dc2626; margin: 0; font-size: 14px; font-weight: 500;">
                    ⚠️ Por seguridad, deberás cambiar esta contraseña en tu primer inicio de sesión.
                  </p>
                </div>
              </div>

              <!-- Botón de acceso (bulletproof) -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:30px auto;">
                <tr>
                  <td bgcolor="#1E40AF" style="border-radius:8px; text-align:center;">
                    <a href="${loginUrl}" style="font-size:16px; font-weight:600; line-height:100%; color:#ffffff; text-decoration:none; padding:14px 32px; display:inline-block; background-color:#1E40AF; border-radius:8px;">
                      Acceder a mi Portal
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Información adicional -->
              <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 16px; border-radius: 4px; margin: 20px 0;">
                <h4 style="color: #0c4a6e; margin: 0 0 8px 0; font-size: 16px;">¿Qué puedes hacer en tu portal?</h4>
                <ul style="color: #0c4a6e; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>Crear y gestionar ejecutivos de cuentas</li>
                  <li>Calcular préstamos para tus clientes</li>
                  <li>Enviar solicitudes de crédito</li>
                  <li>Hacer seguimiento de tus solicitudes</li>
                </ul>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 30px 0 0 0;">
                Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. 
                ¡Bienvenido al equipo Crediexpress Automotor!
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                &copy; 2025 Crediexpress Automotor. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
¡Bienvenido a Crediexpress Automotor!

Estimado/a ${dealerName},

Nos complace informarte que tu solicitud para unirte a Crediexpress Automotor ha sido aprobada.

Tus credenciales de acceso:
Usuario: ${email}
Contraseña: ${tempPassword}

IMPORTANTE: Por seguridad, deberás cambiar esta contraseña en tu primer inicio de sesión.

Accede a tu portal en: ${loginUrl}

¡Bienvenido al equipo Crediexpress Automotor!
      `,
      // Sin attachments: el logo se sirve por URL pública para mayor compatibilidad
    });

    if (error) {
      console.error('[email] Error sending credentials email via Resend:', error);
      return { success: false, error };
    }

    const msgId = (data as any)?.id || (data as any)?.data?.id;
    console.log('[email] Credentials email sent via Resend. Message ID:', msgId ?? '(unknown)');
    return { success: true, data };
  } catch (error) {
    console.error('[email] Error in sendDealerCredentials:', error);
    return { success: false, error };
  }
}

interface SendDealerInviteLinkParams {
  to: string;
  dealerName: string;
  setPasswordUrl: string;
  supportEmail?: string;
}

// Envía un email de invitación con enlace para establecer contraseña
export async function sendDealerInviteLink({
  to,
  dealerName,
  setPasswordUrl,
  supportEmail,
}: SendDealerInviteLinkParams) {
  try {
    const client = getResend();
    if (!client) {
      console.warn('Resend API key not configured. Skipping email send.');
      return { success: false, error: new Error('RESEND_API_KEY not configured') } as const;
    }

    // Construir línea de contacto evitando enlaces mailto si el dominio no coincide con el dominio del remitente
    const fromMatch = EMAIL_FROM.match(/<([^>]+)>/)?.[1] || EMAIL_FROM;
    const fromDomain = fromMatch.split('@')[1]?.trim().toLowerCase();
    const support = supportEmail?.trim();
    const supportDomain = support ? support.split('@')[1]?.toLowerCase() : undefined;
    const contactLine = support
      ? `<p style="color:#6b7280; font-size:14px; margin:8px 0 0;">Si no solicitaste este acceso o necesitás ayuda, escribinos a ${
          fromDomain && supportDomain && fromDomain === supportDomain
            ? `<a href="mailto:${support}">${support}</a>`
            : `${support}`
        }.</p>`
      : '';

    // Base URL para recursos públicos
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL || 'https://crediexpressautos.com.ar';

    const { data, error } = await client.emails.send({
      from: EMAIL_FROM,
      to: [to],
      replyTo: supportEmail || process.env.CONTACT_RECIPIENT || undefined,
      subject: 'Bienvenido a Crediexpress Automotor – Establecé tu contraseña',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Establecé tu contraseña</title>
        </head>
        <body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #2e3192 0%, #1e40af 100%); background-color: #1e40af; padding: 40px 30px; text-align: center;">
              <div style="margin-bottom: 16px;">
                <img src="${baseUrl}/crediexpress-logo.png" alt="Crediexpress Automotor" width="200" style="display:block; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;" />
              </div>
              <h1 style="color:white; margin:0; font-size: 24px; font-weight: 700;">¡Bienvenido a Crediexpress Automotor!</h1>
              <p style="color: rgba(255,255,255,0.9); margin:8px 0 0;">Tu concesionario fue aprobado</p>
            </div>
            <div style="padding: 32px 28px;">
              <p style="color:#374151; font-size:16px; line-height:1.6; margin:0 0 16px;">
                Hola <strong>${dealerName}</strong>, para completar tu acceso por favor establecé tu contraseña.
              </p>
              <!-- Botón (bulletproof) -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:28px auto;">
                <tr>
                  <td bgcolor="#1E40AF" style="border-radius:10px; text-align:center;">
                    <a href="${setPasswordUrl}" style="display:inline-block; background-color:#1E40AF; color:#ffffff; text-decoration:none; padding:12px 28px; border-radius:10px; font-weight:600;">Establecer contraseña</a>
                  </td>
                </tr>
              </table>
              <p style="color:#6b7280; font-size:14px; margin:0;">
                Este enlace expira en 24 horas y solo puede usarse una vez.
              </p>
              ${contactLine}
            </div>
            <div style="background-color:#f8fafc; padding:16px 24px; text-align:center; border-top:1px solid #e5e7eb;">
              <p style="color:#6b7280; font-size:12px; margin:0;">&copy; 2025 Crediexpress Automotor. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Bienvenido a Crediexpress Automotor

Hola ${dealerName},

Tu concesionario fue aprobado. Para completar tu acceso, establecé tu contraseña usando el siguiente enlace (válido por 24 horas):

${setPasswordUrl}

Si no solicitaste este acceso o necesitás ayuda, por favor contactanos.
      `,
      attachments: [getLogoAttachment()],
    });

    if (error) {
      console.error('[email] Error sending invite link email via Resend:', error);
      return { success: false, error };
    }
    const msgId = (data as any)?.id || (data as any)?.data?.id;
    console.log('[email] Invite link email sent via Resend. Message ID:', msgId ?? '(unknown)');
    return { success: true, data };
  } catch (error) {
    console.error('[email] Error in sendDealerInviteLink:', error);
    return { success: false, error };
  }
}