import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { jwtVerify } from 'jose';

// Claves para verificar tokens según su tipo
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || '');

// Esquema completo para solicitud de préstamo
const loanApplicationSchema = z.object({
  // Datos personales del solicitante
  personalData: z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    apellido: z.string().min(1, 'El apellido es requerido'),
    cuil: z.string().min(1, 'El CUIL es requerido'),
    email: z.string().email('Email inválido'),
    telefono: z.string().min(1, 'El teléfono es requerido'),
    fechaNacimiento: z.string().optional(),
    domicilio: z.string().optional(),
    ciudad: z.string().optional(),
    provincia: z.string().optional(),
    codigoPostal: z.string().optional(),
    estadoCivil: z.enum(['soltero', 'casado', 'divorciado', 'viudo', 'union_convivencial']).optional(),
  }),
  
  // Datos del cónyuge (opcional)
  spouseData: z.object({
    nombreConyuge: z.string().optional(),
    apellidoConyuge: z.string().optional(),
    cuilConyuge: z.string().optional(),
    ingresoConyuge: z.number().optional(),
  }).optional(),
  
  // Datos laborales
  employmentData: z.object({
    tipoEmpleo: z.string().optional(),
    tipoEmpleoOtro: z.string().optional(),
    nombreEmpresa: z.string().optional(),
    telefonoEmpresa: z.string().optional(),
    experienciaLaboral: z.string().optional(),
  }).optional(),
  
  // Datos del vehículo
  vehicleData: z.object({
    condicionVehiculo: z.enum(['nuevo', 'usado']).optional(),
    marca: z.string().optional(),
    modelo: z.string().optional(),
    anio: z.number().optional(),
    version: z.string().optional(),
  }).optional(),
  
  // Datos de cálculo
  calculationData: z.object({
    vehiclePrice: z.number(),
    loanAmount: z.number(),
    loanTermMonths: z.number(),
    monthlyPayment: z.number(),
    totalAmount: z.number(),
    interestRate: z.number(),
    cftAnnual: z.number(),
  }),
  
  // Documentos subidos
  documents: z.array(z.any()).optional(),
});

export async function POST(request: Request) {
  try {
    // 1. Extraer información del usuario que envía la solicitud
    const headersList = await headers();
    let userId = headersList.get('x-user-id');
    let dealerId = headersList.get('x-user-dealer-id');
    let role = headersList.get('x-user-role');
    const authHeader = headersList.get('authorization');

    // Log básico para depuración en entorno de desarrollo
    console.log('📥 POST /api/loan-applications', {
      hasAuthHeader: !!authHeader,
      hasXUserId: !!headersList.get('x-user-id'),
      hasXUserRole: !!headersList.get('x-user-role'),
      hasXDealer: !!headersList.get('x-user-dealer-id'),
    });

    // Fallback robusto: si los headers faltan, verificar JWT desde cookies (access_token primero, luego refresh_token con su secreto)
    if (!userId || !dealerId || !role) {
      try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;
        if (accessToken) {
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          const pUserId = (payload as any).userId;
          const pDealerId = (payload as any).dealerId;
          const pRole = (payload as any).role;
          if (pUserId) userId = String(pUserId);
          if (pDealerId) dealerId = String(pDealerId);
          if (pRole) role = String(pRole);
        } else {
          const refreshToken = cookieStore.get('refresh_token')?.value;
          if (refreshToken) {
            try {
              const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
              const pUserId = (payload as any).userId;
              const pDealerId = (payload as any).dealerId;
              const pRole = (payload as any).role;
              if (pUserId) userId = String(pUserId);
              if (pDealerId) dealerId = String(pDealerId);
              if (pRole) role = String(pRole);
            } catch (err) {
              console.error('❌ Error verificando refresh JWT desde cookie en fallback:', err);
            }
          }
        }
      } catch (err) {
        console.error('❌ Error verificando JWT desde cookie en fallback:', err);
      }
    }

    console.log('🔐 Identity resolved for loan application', { userId, dealerId, role });

    if (!userId || !dealerId) {
      return NextResponse.json({ error: 'No autorizado: Faltan datos de usuario.' }, { status: 401 });
    }

    // 2. Leer y validar los datos del cuerpo de la solicitud
    const body = await request.json();
    const validation = loanApplicationSchema.safeParse(body);

    if (!validation.success) {
      console.warn('⚠️ Validation failed in /api/loan-applications POST:', validation.error.errors);
      return NextResponse.json({ error: 'Datos inválidos', details: validation.error.errors }, { status: 400 });
    }

    const { personalData, spouseData, employmentData, vehicleData, calculationData, documents } = validation.data;

    // 3. Preparar y guardar los datos en la base de datos usando Prisma
    const newLoanApplication = await prisma.loanApplication.create({
      data: {
        publicId: randomUUID(),
        
        // Datos Personales del Solicitante
        applicantFirstName: personalData.nombre,
        applicantLastName: personalData.apellido,
        applicantCuil: personalData.cuil,
        applicantEmail: personalData.email,
        applicantPhone: personalData.telefono,
        applicantBirthDate: personalData.fechaNacimiento ? new Date(personalData.fechaNacimiento) : null,
        applicantAddress: personalData.domicilio,
        applicantCity: personalData.ciudad,
        applicantProvince: personalData.provincia,
        applicantPostalCode: personalData.codigoPostal,
        applicantMaritalStatus: personalData.estadoCivil,
        
        // Datos del Cónyuge
        spouseFirstName: spouseData?.nombreConyuge ?? null,
        spouseLastName: spouseData?.apellidoConyuge ?? null,
        spouseCuil: spouseData?.cuilConyuge ?? null,
        spouseIncome: spouseData?.ingresoConyuge ?? null,
        
        // Datos Laborales
        employmentType: employmentData?.tipoEmpleo ?? null,
        employmentTypeOther: employmentData?.tipoEmpleoOtro ?? null,
        companyName: employmentData?.nombreEmpresa ?? null,
        companyPhone: employmentData?.telefonoEmpresa ?? null,
        workExperience: employmentData?.experienciaLaboral ?? null,
        
        // Datos del Vehículo
        vehicleCondition: vehicleData?.condicionVehiculo ?? null,
        vehicleBrand: vehicleData?.marca ?? null,
        vehicleModel: vehicleData?.modelo ?? null,
        vehicleYear: vehicleData?.anio ?? null,
        vehicleVersion: vehicleData?.version ?? null,
        
        // Cálculos del Préstamo
        vehiclePrice: calculationData.vehiclePrice,
        loanAmount: calculationData.loanAmount,
        loanTermMonths: calculationData.loanTermMonths,
        monthlyPayment: calculationData.monthlyPayment,
        totalAmount: calculationData.totalAmount,
        interestRate: calculationData.interestRate,
        cftAnnual: calculationData.cftAnnual,
        downPayment: calculationData.vehiclePrice - calculationData.loanAmount,
        
        // Documentos
        documentsMetadata: documents && documents.length ? documents : undefined,
        
        // Metadatos completos
        submissionData: validation.data,
        calculationData: calculationData,
        
        // Estado y relaciones
        status: 'PENDING',
        dealerId: parseInt(dealerId, 10),
        submittedByUserId: parseInt(userId, 10),
        executiveId: role === 'EJECUTIVO_CUENTAS' ? parseInt(userId, 10) : null,
      },
    });

    // 4. Responder con éxito
    return NextResponse.json(
      {
        message: 'Solicitud de préstamo creada exitosamente.',
        applicationId: newLoanApplication.publicId,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error al crear la solicitud de préstamo:', error);
    // Devolvemos un error genérico para no exponer detalles internos.
    return NextResponse.json({ error: 'Ocurrió un error en el servidor.' }, { status: 500 });
  }
}

// Listado de solicitudes de préstamo con paginación y filtros
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Extraer identidad desde headers establecidos por el middleware
    const headersList = await headers();
    let userId = headersList.get('x-user-id');
    let dealerId = headersList.get('x-user-dealer-id');
    let role = headersList.get('x-user-role');

    // Fallback a cookie JWT si falta algún dato (access_token primero, luego refresh_token con su secreto)
    if (!role || !userId || (role !== 'ADMIN' && !dealerId)) {
      try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('access_token')?.value;
        if (accessToken) {
          const { payload } = await jwtVerify(accessToken, JWT_SECRET);
          const pUserId = (payload as any).userId;
          const pDealerId = (payload as any).dealerId;
          const pRole = (payload as any).role;
          if (pUserId) userId = String(pUserId);
          if (pDealerId) dealerId = String(pDealerId);
          if (pRole) role = String(pRole);
        } else {
          const refreshToken = cookieStore.get('refresh_token')?.value;
          if (refreshToken) {
            try {
              const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
              const pUserId = (payload as any).userId;
              const pDealerId = (payload as any).dealerId;
              const pRole = (payload as any).role;
              if (pUserId) userId = String(pUserId);
              if (pDealerId) dealerId = String(pDealerId);
              if (pRole) role = String(pRole);
            } catch (err) {
              console.error('❌ Error verificando refresh JWT desde cookie en fallback (GET):', err);
            }
          }
        }
      } catch (err) {
        console.error('❌ Error verificando JWT desde cookie en fallback (GET):', err);
      }
    }

    if (!role || !userId || (role !== 'ADMIN' && !dealerId)) {
      return NextResponse.json({ error: 'No autorizado: Faltan datos de usuario.' }, { status: 401 });
    }

    // Validación de query params
    const querySchema = z.object({
      status: z
        .enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'])
        .optional(),
      page: z.coerce.number().int().positive().default(1),
      pageSize: z.coerce.number().int().positive().max(100).default(10),
      search: z.string().trim().min(1).optional(),
      dealerId: z.coerce.number().int().positive().optional(), // solo ADMIN
    });

    const parsed = querySchema.safeParse({
      status: searchParams.get('status') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      dealerId: searchParams.get('dealerId') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parámetros inválidos', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { status: qStatus, page, pageSize, search, dealerId: adminDealerId } = parsed.data;

    // Construcción de filtros de búsqueda
    const where: any = {};
    if (qStatus) where.status = qStatus;
    if (search) {
      where.OR = [
        { applicantFirstName: { contains: search } },
        { applicantLastName: { contains: search } },
        { applicantCuil: { contains: search } },
        { applicantEmail: { contains: search } },
        { applicantPhone: { contains: search } },
      ];
    }

    // RBAC: acotar por dealer según rol
    if (role === 'DEALER') {
      where.dealerId = parseInt(dealerId!, 10);
    } else if (role === 'EJECUTIVO_CUENTAS') {
      // Los ejecutivos solo ven sus propias solicitudes
      where.dealerId = parseInt(dealerId!, 10);
      where.submittedByUserId = parseInt(userId!, 10);
    } else if (role === 'ADMIN' && adminDealerId) {
      where.dealerId = adminDealerId;
    }

    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      prisma.loanApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          publicId: true,
          // Datos Personales del Solicitante
          applicantFirstName: true,
          applicantLastName: true,
          applicantCuil: true,
          applicantEmail: true,
          applicantPhone: true,
          applicantBirthDate: true,
          applicantAddress: true,
          applicantCity: true,
          applicantProvince: true,
          applicantPostalCode: true,
          applicantMaritalStatus: true,
          // Datos del Cónyuge
          spouseFirstName: true,
          spouseLastName: true,
          spouseCuil: true,
          spouseIncome: true,
          // Datos Laborales
          employmentType: true,
          employmentTypeOther: true,
          companyName: true,
          companyPhone: true,
          workExperience: true,
          // Datos del Vehículo
          vehicleCondition: true,
          vehicleBrand: true,
          vehicleModel: true,
          vehicleYear: true,
          vehicleVersion: true,
          // Cálculos del Préstamo
          vehiclePrice: true,
          loanAmount: true,
          downPayment: true,
          loanTermMonths: true,
          monthlyPayment: true,
          totalAmount: true,
          interestRate: true,
          cftAnnual: true,
          // Documentos
          documentsMetadata: true,
          // Estado y Procesamiento
          status: true,
          statusReason: true,
          reviewedAt: true,
          reviewedByUserId: true,
          // Metadatos
          submissionData: true,
          calculationData: true,
          // Timestamps
          createdAt: true,
          updatedAt: true,
          // IDs
          dealerId: true,
          executiveId: true,
          submittedByUserId: true,
        },
      }),
      prisma.loanApplication.count({ where }),
    ]);

    return NextResponse.json({
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      items,
    });
  } catch (error) {
    console.error('Error al listar solicitudes de préstamo:', error);
    return NextResponse.json({ error: 'Ocurrió un error en el servidor.' }, { status: 500 });
  }
}
