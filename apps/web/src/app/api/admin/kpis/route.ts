import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');

interface KPIData {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  description: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface MonthlyTrendData {
  month: string;
  applications: number;
  approved: number;
}

interface KPIResponse {
  success: boolean;
  data: {
    kpiData: KPIData[];
    statusDistribution: ChartData[];
    monthlyTrend: MonthlyTrendData[];
    summary: {
      totalGrowth: number;
      approvalRate: number;
      avgProcessingTime: number;
    };
  };
  error?: string;
}

// Helper para calcular fechas según el período
function getDateRange(period: '7d' | '30d' | '90d' | '1y') {
  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return { startDate, endDate: now };
}

// Helper para calcular período anterior para comparación
function getPreviousDateRange(period: '7d' | '30d' | '90d' | '1y') {
  const { startDate: currentStart, endDate: currentEnd } = getDateRange(period);
  const duration = currentEnd.getTime() - currentStart.getTime();
  
  const previousEnd = new Date(currentStart);
  const previousStart = new Date(currentStart.getTime() - duration);
  
  return { startDate: previousStart, endDate: previousEnd };
}

// Helper para formatear números como moneda argentina
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  } else {
    return `$${amount.toFixed(0)}`;
  }
}

// Helper para formatear números grandes
function formatNumber(num: number): string {
  if (num >= 1000) {
    return num.toLocaleString('es-AR');
  }
  return num.toString();
}

export async function GET(request: NextRequest) {
  try {
    // Autenticación: primero usar headers inyectados por middleware; si faltan, intentar con cookies JWT
    let userRole = request.headers.get('x-user-role');
    if (!userRole) {
      const accessToken = request.cookies.get('access_token')?.value;
      const refreshToken = request.cookies.get('refresh_token')?.value;
      let payload: any | null = null;

      if (accessToken) {
        try {
          const v = await jwtVerify(accessToken, JWT_SECRET);
          payload = v.payload;
        } catch {}
      }
      if (!payload && refreshToken) {
        try {
          const v = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
          payload = v.payload;
        } catch {}
      }
      if (payload && typeof payload.role === 'string') {
        userRole = payload.role as string;
      }
    }
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado. Solo administradores pueden ver KPIs.' },
        { status: 403 }
      );
    }

    // Obtener parámetros de consulta
    const url = new URL(request.url);
    const period = (url.searchParams.get('period') as '7d' | '30d' | '90d' | '1y') || '30d';

    // Calcular rangos de fechas
    const { startDate, endDate } = getDateRange(period);
    const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousDateRange(period);

    // 1. Solicitudes Totales (período actual y anterior)
    const [totalApplications, totalApplicationsPrev] = await Promise.all([
      prisma.loanApplication.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          deletedAt: null,
        },
      }),
      prisma.loanApplication.count({
        where: {
          createdAt: { gte: prevStartDate, lte: prevEndDate },
          deletedAt: null,
        },
      }),
    ]);

    // 2. Solicitudes Aprobadas (para tasa de aprobación)
    const [approvedApplications, approvedApplicationsPrev] = await Promise.all([
      prisma.loanApplication.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'APPROVED',
          deletedAt: null,
        },
      }),
      prisma.loanApplication.count({
        where: {
          createdAt: { gte: prevStartDate, lte: prevEndDate },
          status: 'APPROVED',
          deletedAt: null,
        },
      }),
    ]);

    // 3. Préstamo Promedio
    const [avgLoanAmount, avgLoanAmountPrev] = await Promise.all([
      prisma.loanApplication.aggregate({
        _avg: { loanAmount: true },
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'APPROVED',
          deletedAt: null,
        },
      }),
      prisma.loanApplication.aggregate({
        _avg: { loanAmount: true },
        where: {
          createdAt: { gte: prevStartDate, lte: prevEndDate },
          status: 'APPROVED',
          deletedAt: null,
        },
      }),
    ]);

    // 4. Dealers Activos (con solicitudes en el período)
    const [activeDealers, activeDealersPrev] = await Promise.all([
      prisma.dealer.count({
        where: {
          status: 'APPROVED',
          deletedAt: null,
          loanApplications: {
            some: {
              createdAt: { gte: startDate, lte: endDate },
              deletedAt: null,
            },
          },
        },
      }),
      prisma.dealer.count({
        where: {
          status: 'APPROVED',
          deletedAt: null,
          loanApplications: {
            some: {
              createdAt: { gte: prevStartDate, lte: prevEndDate },
              deletedAt: null,
            },
          },
        },
      }),
    ]);

    // 5. Tiempo Promedio de Procesamiento
    const processedApplications = await prisma.loanApplication.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        reviewedAt: { not: null },
        deletedAt: null,
      },
      select: {
        createdAt: true,
        reviewedAt: true,
      },
    });

    const processedApplicationsPrev = await prisma.loanApplication.findMany({
      where: {
        createdAt: { gte: prevStartDate, lte: prevEndDate },
        reviewedAt: { not: null },
        deletedAt: null,
      },
      select: {
        createdAt: true,
        reviewedAt: true,
      },
    });

    // Calcular tiempo promedio en días
    const avgProcessingTime = processedApplications.length > 0 
      ? processedApplications.reduce((sum: number, app) => {
          const diffMs = app.reviewedAt!.getTime() - app.createdAt.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          return sum + diffDays;
        }, 0) / processedApplications.length
      : 0;

    const avgProcessingTimePrev = processedApplicationsPrev.length > 0 
      ? processedApplicationsPrev.reduce((sum: number, app) => {
          const diffMs = app.reviewedAt!.getTime() - app.createdAt.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          return sum + diffDays;
        }, 0) / processedApplicationsPrev.length
      : 0;

    // 6. Volumen Mensual (suma de préstamos aprobados)
    const [monthlyVolume, monthlyVolumePrev] = await Promise.all([
      prisma.loanApplication.aggregate({
        _sum: { loanAmount: true },
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'APPROVED',
          deletedAt: null,
        },
      }),
      prisma.loanApplication.aggregate({
        _sum: { loanAmount: true },
        where: {
          createdAt: { gte: prevStartDate, lte: prevEndDate },
          status: 'APPROVED',
          deletedAt: null,
        },
      }),
    ]);

    // Calcular cambios porcentuales
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const applicationsChange = calculateChange(totalApplications, totalApplicationsPrev);
    const approvalRate = totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0;
    const approvalRatePrev = totalApplicationsPrev > 0 ? (approvedApplicationsPrev / totalApplicationsPrev) * 100 : 0;
    const approvalRateChange = calculateChange(approvalRate, approvalRatePrev);
    
    const loanAmountChange = calculateChange(
      avgLoanAmount._avg?.loanAmount?.toNumber() || 0,
      avgLoanAmountPrev._avg?.loanAmount?.toNumber() || 0
    );
    
    const dealersChange = calculateChange(activeDealers, activeDealersPrev);
    const processingTimeChange = calculateChange(avgProcessingTime, avgProcessingTimePrev);
    
    const volumeChange = calculateChange(
      monthlyVolume._sum?.loanAmount?.toNumber() || 0,
      monthlyVolumePrev._sum?.loanAmount?.toNumber() || 0
    );

    // Construir datos de KPI
    const kpiData: KPIData[] = [
      {
        id: 'total_applications',
        title: 'Solicitudes Totales',
        value: formatNumber(totalApplications),
        change: Math.abs(applicationsChange),
        changeType: applicationsChange >= 0 ? 'increase' : 'decrease',
        description: 'Solicitudes recibidas en el período'
      },
      {
        id: 'approval_rate',
        title: 'Tasa de Aprobación',
        value: `${approvalRate.toFixed(1)}%`,
        change: Math.abs(approvalRateChange),
        changeType: approvalRateChange >= 0 ? 'increase' : 'decrease',
        description: 'Porcentaje de solicitudes aprobadas'
      },
      {
        id: 'avg_loan_amount',
        title: 'Préstamo Promedio',
        value: formatCurrency(avgLoanAmount._avg?.loanAmount?.toNumber() || 0),
        change: Math.abs(loanAmountChange),
        changeType: loanAmountChange >= 0 ? 'increase' : 'decrease',
        description: 'Monto promedio de préstamos aprobados'
      },
      {
        id: 'active_dealers',
        title: 'Dealers Activos',
        value: formatNumber(activeDealers),
        change: Math.abs(dealersChange),
        changeType: dealersChange >= 0 ? 'increase' : 'decrease',
        description: 'Concesionarios con actividad reciente'
      },
      {
        id: 'avg_processing_time',
        title: 'Tiempo Promedio',
        value: `${avgProcessingTime.toFixed(1)} días`,
        change: Math.abs(processingTimeChange),
        changeType: processingTimeChange <= 0 ? 'increase' : 'decrease', // Menor tiempo es mejor
        description: 'Tiempo promedio de procesamiento'
      },
      {
        id: 'monthly_volume',
        title: 'Volumen Mensual',
        value: formatCurrency(monthlyVolume._sum?.loanAmount?.toNumber() || 0),
        change: Math.abs(volumeChange),
        changeType: volumeChange >= 0 ? 'increase' : 'decrease',
        description: 'Volumen total de préstamos del mes'
      }
    ];

    // Distribución por Estado
    const statusCounts = await prisma.loanApplication.groupBy({
      by: ['status'],
      _count: { status: true },
      where: {
        createdAt: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
    });

    const statusDistribution: ChartData[] = [
      {
        name: 'Aprobadas',
        value: totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0,
        color: '#10b981'
      },
      {
        name: 'Pendientes',
        value: totalApplications > 0 ? 
          ((statusCounts.find((s: any) => s.status === 'PENDING')?._count?.status || 0) + 
           (statusCounts.find((s: any) => s.status === 'UNDER_REVIEW')?._count?.status || 0)) / totalApplications * 100 : 0,
        color: '#f59e0b'
      },
      {
        name: 'Rechazadas',
        value: totalApplications > 0 ? 
          (statusCounts.find((s: any) => s.status === 'REJECTED')?._count?.status || 0) / totalApplications * 100 : 0,
        color: '#ef4444'
      },
      {
        name: 'Canceladas',
        value: totalApplications > 0 ? 
          (statusCounts.find((s: any) => s.status === 'CANCELLED')?._count?.status || 0) / totalApplications * 100 : 0,
        color: '#6b7280'
      }
    ];

    // Tendencia Mensual (últimos 5 meses)
    const monthlyTrend: MonthlyTrendData[] = [];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    for (let i = 4; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      const [monthApplications, monthApproved] = await Promise.all([
        prisma.loanApplication.count({
          where: {
            createdAt: { gte: monthStart, lte: monthEnd },
            deletedAt: null,
          },
        }),
        prisma.loanApplication.count({
          where: {
            createdAt: { gte: monthStart, lte: monthEnd },
            status: 'APPROVED',
            deletedAt: null,
          },
        }),
      ]);

      monthlyTrend.push({
        month: monthNames[monthStart.getMonth()],
        applications: monthApplications,
        approved: monthApproved,
      });
    }

    const response: KPIResponse = {
      success: true,
      data: {
        kpiData,
        statusDistribution,
        monthlyTrend,
        summary: {
          totalGrowth: applicationsChange,
          approvalRate: approvalRate,
          avgProcessingTime: avgProcessingTime,
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error en API /admin/kpis:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor al calcular KPIs' 
      },
      { status: 500 }
    );
  }
}
