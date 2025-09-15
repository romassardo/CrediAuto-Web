import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Asegurar runtime Node y evitar cache en desarrollo
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 15;

// Schema de validación para el registro de concesionarios
const registerDealerSchema = z.object({
  // Datos del responsable
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').trim(),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').trim(),
  email: z.string().email('Email inválido').toLowerCase().trim(),
  telefono: z.string()
    .transform((s) => s.replace(/\D/g, '')) // conservar solo dígitos
    .refine((s) => s.length >= 8, 'El teléfono debe tener al menos 8 dígitos'),
  
  // Datos del concesionario
  nombreComercial: z.string().min(3, 'El nombre comercial debe tener al menos 3 caracteres').trim(),
  cuit: z.string()
    .transform((s) => s.replace(/\D/g, '')) // conservar solo dígitos
    .refine((s) => s.length === 11, 'El CUIT debe tener 11 dígitos'),
  direccion: z.string().min(5, 'La dirección debe tener al menos 5 caracteres').trim(),
  ciudad: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres').trim(),
  provincia: z.string().min(2, 'La provincia debe tener al menos 2 caracteres').trim(),
  
  // Términos
  aceptaTerminos: z.boolean().refine(val => val === true, 'Debe aceptar los términos y condiciones'),
});

// --- Funciones Helper ---

/**
 * Genera una contraseña temporal segura.
 * @returns {string} Contraseña de 8 caracteres.
 */
function generateSecureTemporaryPassword(): string {
  return crypto.randomBytes(4).toString('hex'); // 4 bytes = 8 caracteres hexadecimales
}

/**
 * Placeholder para la función de envío de email.
 * @param {object} details - Detalles del email a enviar.
 */
async function sendTemporaryPasswordEmail(details: { email: string; tempPassword: string; dealerName: string; }) {
  // Aquí se integraría un servicio de email como Resend, Nodemailer, etc.
  console.log(`📧 [Simulación de Email] Credenciales para ${details.email}:`, {
    password: details.tempPassword,
    dealerName: details.dealerName,
  });
  // Por ahora, solo lo mostramos en consola.
  return Promise.resolve();
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = registerDealerSchema.parse(body);
    
    // Verificar si el email ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        deletedAt: null,
      },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe un usuario registrado con este email' 
        },
        { status: 400 }
      );
    }
    
    // Verificar si ya existe un concesionario con el mismo nombre comercial o CUIT
    const existingDealer = await prisma.dealer.findFirst({
      where: {
        OR: [
          { tradeName: validatedData.nombreComercial },
          { cuit: validatedData.cuit }
        ],
        deletedAt: null,
      },
    });
    
    if (existingDealer) {
      const duplicateField = existingDealer.tradeName === validatedData.nombreComercial ? 'nombre comercial' : 'CUIT';
      return NextResponse.json(
        { 
          success: false, 
          error: `Ya existe un concesionario registrado con este ${duplicateField}` 
        },
        { status: 400 }
      );
    }
    
    // Generar contraseña temporal segura
    const tempPassword = generateSecureTemporaryPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);
    
    // Crear transacción para crear dealer y usuario
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el concesionario
      const dealer = await tx.dealer.create({
        data: {
          publicId: uuidv4(),
          legalName: validatedData.nombreComercial, // Por ahora usamos el nombre comercial
          tradeName: validatedData.nombreComercial,
          cuit: validatedData.cuit,
          email: validatedData.email,
          phone: validatedData.telefono,
          addressStreet: validatedData.direccion,
          addressCity: validatedData.ciudad,
          addressProvince: validatedData.provincia,
          status: 'PENDING_APPROVAL', // Estado inicial
        },
      });
      
      // 2. Crear el usuario responsable del concesionario
      const user = await tx.user.create({
        data: {
          publicId: uuidv4(),
          email: validatedData.email,
          firstName: validatedData.nombre,
          lastName: validatedData.apellido,
          phone: validatedData.telefono,
          passwordHash: hashedPassword,
          role: 'DEALER',
          status: 'INVITED', // Estado inicial - debe activar cuenta
          dealerId: dealer.id,
        },
      });
      
      // 3. Log de auditoría (dentro de la transacción)
      await tx.auditLog.create({
        data: {
          actorUserId: user.id, // Asociamos al usuario creado
          action: 'auth.dealer.register',
          entityType: 'DEALER',
          entityId: dealer.publicId,
          metadata: {
            dealerName: validatedData.nombreComercial,
            city: validatedData.ciudad,
            userEmail: validatedData.email,
          },
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        },
      });

      return { dealer, user, tempPassword };
    });
    
    // Enviar email con credenciales temporales (fuera de la transacción)
    await sendTemporaryPasswordEmail({
      email: validatedData.email,
      tempPassword: result.tempPassword,
      dealerName: validatedData.nombreComercial,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Solicitud de registro enviada exitosamente',
      data: {
        dealerId: result.dealer.publicId,
        status: 'PENDING_APPROVAL',
        estimatedReviewTime: '24-48 horas hábiles',
      },
    });
    
  } catch (error) {
    console.error('--- DEALER REGISTRATION ERROR ---', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos de registro inválidos.',
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Manejo específico de errores Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        const meta = error.meta as any;
        if (meta?.target?.includes('cuit')) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Ya existe un concesionario registrado con este CUIT',
              field: 'cuit'
            },
            { status: 400 }
          );
        } else if (meta?.target?.includes('tradeName')) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Ya existe un concesionario registrado con este nombre comercial',
              field: 'nombreComercial'
            },
            { status: 400 }
          );
        } else {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Ya existe un registro con estos datos' 
            },
            { status: 400 }
          );
        }
      }
      
      // Otros errores Prisma
      const errorMessage = 'Error en la base de datos durante el registro.';
      const errorDetails = process.env.NODE_ENV === 'development' 
        ? { code: error.code, meta: error.meta }
        : {};
        
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' 
          ? errorMessage 
          : 'Ocurrió un problema. Por favor, intente más tarde.',
        ...(process.env.NODE_ENV === 'development' && { details: errorDetails }),
      }, { status: 500 });
    }

    // Otros errores
    const errorMessage = error instanceof Error ? error.message : 'Error inesperado';

    const responsePayload = {
      success: false,
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' 
        ? errorMessage 
        : 'Ocurrió un problema. Por favor, intente más tarde.',
      ...(process.env.NODE_ENV === 'development' && { details: errorDetails }),
    };

    return NextResponse.json(responsePayload, { status: 500 });
  }
}
