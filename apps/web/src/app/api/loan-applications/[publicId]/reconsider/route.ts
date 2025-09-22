import { NextRequest } from 'next/server';
import { headers, cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, stat } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { jwtVerify } from 'jose';
import { Prisma } from '@prisma/client';
import { fileURLToPath } from 'url';

// Helper: resolver robusto para apps/web/public/uploads/loan-docs
async function resolveUploadsDir(): Promise<string> {
  // 1) Intento directo con process.cwd() si ya apunta al proyecto Next
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const st = await stat(publicDir);
    if (st.isDirectory()) {
      const target = path.join(publicDir, 'uploads', 'loan-docs');
      await mkdir(target, { recursive: true });
      return target;
    }
  } catch {}

  // 2) Buscar ascendiendo desde el archivo compilado hasta encontrar "public"
  try {
    const __filename = fileURLToPath(import.meta.url);
    let dir = path.dirname(__filename);
    for (let i = 0; i < 10; i++) {
      const publicDir = path.join(dir, 'public');
      try {
        const st2 = await stat(publicDir);
        if (st2.isDirectory()) {
          const target = path.join(publicDir, 'uploads', 'loan-docs');
          await mkdir(target, { recursive: true });
          return target;
        }
      } catch {}
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  } catch {}

  // 3) Fallback: crear en process.cwd()/public/uploads/loan-docs
  const fallback = path.join(process.cwd(), 'public', 'uploads', 'loan-docs');
  await mkdir(fallback, { recursive: true });
  return fallback;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    // Await params para Next.js 15
    const resolvedParams = await params;
    const { publicId } = resolvedParams;

    // Obtener token JWT: preferir cookie, pero aceptar Authorization: Bearer como fallback
    const cookieStore = await cookies();
    const fromCookie = cookieStore.get('access_token')?.value;
    let accessToken = fromCookie;
    if (!accessToken) {
      const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
      if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
        accessToken = authHeader.slice(7).trim();
      }
    }

    if (!accessToken) {
      return Response.json({ error: 'No autorizado - Token faltante' }, { status: 401 });
    }

    // Verificar y decodificar JWT
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');
    let payload: any;
    
    try {
      const { payload: jwtPayload } = await jwtVerify(accessToken, JWT_SECRET);
      payload = jwtPayload;
    } catch (jwtError) {
      console.error('Error verificando JWT en reconsideración:', jwtError);
      return Response.json({ error: 'No autorizado - Token inválido' }, { status: 401 });
    }

    const userId = payload.userId as number;
    const userRole = payload.role as string;
    const userDealerId = payload.dealerId as number | undefined;

    // Verificar que el usuario tiene permisos (DEALER o EJECUTIVO_CUENTAS)
    if (!['DEALER', 'EJECUTIVO_CUENTAS'].includes(userRole)) {
      return Response.json({ error: 'Sin permisos para esta acción' }, { status: 403 });
    }

    // Buscar la solicitud existente
    const existingApplication = await prisma.loanApplication.findFirst({
      where: {
        publicId: publicId,
        deletedAt: null,
        status: 'REJECTED' // Solo se puede reconsiderar solicitudes rechazadas
      },
      include: {
        dealer: true
      }
    });

    if (!existingApplication) {
      return Response.json({ 
        error: 'Solicitud no encontrada o no se puede reconsiderar' 
      }, { status: 404 });
    }

    // Verificar que la solicitud pertenece al concesionario del usuario
    if (userDealerId && userDealerId !== existingApplication.dealerId) {
      return Response.json({ error: 'Sin permisos para esta solicitud' }, { status: 403 });
    }

    // Procesar el FormData
    const formData = await request.formData();
    const reconsiderationReason = formData.get('reason') as string;
    const files = formData.getAll('files') as File[];

    if (!reconsiderationReason?.trim()) {
      return Response.json({ 
        error: 'Las observaciones son obligatorias' 
      }, { status: 400 });
    }

    // Procesar archivos si existen
    let newDocumentsMetadata: any[] = [];
    
    if (files && files.length > 0) {
      // Resolver directorio de subida de forma robusta
      const uploadDir = await resolveUploadsDir();

      for (const file of files) {
        if (file.size > 0) {
          // Generar nombre único para el archivo
          const fileExtension = path.extname(file.name);
          const uniqueFilename = `${uuidv4()}${fileExtension}`;
          const filePath = path.join(uploadDir, uniqueFilename);

          // Guardar archivo
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          await writeFile(filePath, buffer);

          // Agregar metadata
          newDocumentsMetadata.push({
            originalName: file.name,
            name: file.name,
            filename: uniqueFilename,
            url: `/uploads/loan-docs/${uniqueFilename}`,
            storagePath: `uploads/loan-docs/${uniqueFilename}`,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
            isReconsideration: true // Marcar como documento de reconsideración
          });
        }
      }
    }

    // Actualizar la solicitud con datos de reconsideración (preservando observación inicial del admin)
    const updatedApplication = await prisma.loanApplication.update({
      where: { id: existingApplication.id },
      data: {
        status: 'A_RECONSIDERAR',
        reconsiderationRequested: true,
        reconsiderationReason: reconsiderationReason,
        reconsiderationRequestedAt: new Date(),
        reconsiderationDocumentsMetadata: newDocumentsMetadata.length > 0 ? newDocumentsMetadata : Prisma.DbNull,
        // Importante: no limpiar statusReason ni reviewedAt, para que el hilo muestre la primera observación del admin
      },
      include: {
        dealer: {
          select: {
            tradeName: true
          }
        },
        submittedByUser: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Registrar en audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: userId,
        action: 'LOAN_APPLICATION_RECONSIDER',
        entityType: 'LoanApplication',
        entityId: publicId,
        metadata: {
          reason: reconsiderationReason,
          filesCount: newDocumentsMetadata.length,
          previousStatus: 'REJECTED'
        },
        ip: request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown'
      }
    });

    return Response.json({
      success: true,
      message: 'Solicitud enviada para reconsideración exitosamente',
      data: {
        publicId: updatedApplication.publicId,
        status: updatedApplication.status,
        reconsiderationRequestedAt: updatedApplication.reconsiderationRequestedAt,
        filesUploaded: newDocumentsMetadata.length
      }
    });

  } catch (error) {
    console.error('Error en reconsideración:', error);
    return Response.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}