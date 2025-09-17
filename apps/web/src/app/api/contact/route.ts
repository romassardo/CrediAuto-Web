import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';

// Marcar el handler como dinámico para evitar cacheos en App Router
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 15;

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre es demasiado corto'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'El número de teléfono es demasiado corto'),
  message: z.string().min(10, 'La consulta es demasiado corta'),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Debés aceptar los términos y condiciones',
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message);
      return NextResponse.json(
        { success: false, error: 'Validación fallida', details: issues },
        { status: 400 }
      );
    }

    const { name, email, phone, message } = parsed.data;

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const CONTACT_RECIPIENT = process.env.CONTACT_RECIPIENT;
    const CONTACT_FROM = process.env.CONTACT_FROM || 'onboarding@resend.dev';

    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Falta configurar RESEND_API_KEY en variables de entorno' },
        { status: 500 }
      );
    }

    if (!CONTACT_RECIPIENT) {
      return NextResponse.json(
        { success: false, error: 'Falta configurar CONTACT_RECIPIENT en variables de entorno' },
        { status: 500 }
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    // Prefijo configurable para el asunto, con fallback por defecto
    const SUBJECT_PREFIX = process.env.CONTACT_SUBJECT_PREFIX || 'Consulta Web - CrediAuto';
    const subjectBase = `${SUBJECT_PREFIX} | ${name}`;
    const subject = phone && phone.trim()
      ? `${subjectBase} | ${phone.trim()}`
      : subjectBase;

    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6; color:#111">
        <h2 style="margin:0 0 12px">Nuevo mensaje de contacto</h2>
        <p style="margin:0 0 16px">Recibiste un nuevo mensaje desde el formulario de contacto de la web.</p>
        <table style="border-collapse:collapse; width:100%; max-width:720px">
          <tbody>
            <tr>
              <td style="padding:8px 0; width:140px; color:#555;">Nombre</td>
              <td style="padding:8px 0; font-weight:600;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#555;">Email</td>
              <td style="padding:8px 0; font-weight:600;">${escapeHtml(email)}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#555;">Teléfono</td>
              <td style="padding:8px 0; font-weight:600;">${escapeHtml(phone)}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#555; vertical-align:top">Mensaje</td>
              <td style="padding:8px 0; white-space:pre-wrap">${escapeHtml(message)}</td>
            </tr>
          </tbody>
        </table>
        <p style="margin-top:24px; color:#666; font-size:12px">Este correo fue generado automáticamente por el sitio web de CrediAuto.</p>
      </div>
    `;

    const text = `Nuevo mensaje de contacto\n\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\n\nMensaje:\n${message}\n`;

    const { data, error } = await resend.emails.send({
      from: CONTACT_FROM,
      to: CONTACT_RECIPIENT,
      replyTo: email,
      subject,
      html,
      text,
    });

    if (error) {
      const isDev = process.env.NODE_ENV !== 'production';
      const message = (error as any)?.message || String(error);
      const name = (error as any)?.name;
      console.error('[/api/contact] Resend error:', { name, message, full: error });
      return NextResponse.json(
        {
          success: false,
          error: 'No se pudo enviar el email de contacto',
          ...(isDev ? { details: message, providerError: name } : {}),
        },
        { status: 502 }
      );
    }

    // Log de éxito en dev para poder rastrear en Resend Activity
    if (process.env.NODE_ENV !== 'production') {
      const msgId = (data as any)?.id || (data as any)?.data?.id;
      console.log('[/api/contact] Email sent via Resend. Message ID:', msgId ?? '(unknown)');
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const isDev = process.env.NODE_ENV !== 'production';
    const msg = err instanceof Error ? err.message : 'Error inesperado';
    if (isDev) {
      console.error('[/api/contact] Error:', err);
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Error procesando el contacto',
        ...(isDev ? { details: msg } : {}),
      },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
