import React from 'react';
import { Calculator, FileText } from 'lucide-react';
import LoanCalculator from '@/components/calculator/LoanCalculator';
import LoanApplicationSteps from '@/components/forms/LoanApplicationSteps';
import { type Result as CalculationResultType } from '@/lib/calculator/loan-calculator';

interface MainTabContentProps {
  calculationData: any;
  isSubmittingLoan: boolean;
  handleCalculationComplete: (data: any) => void;
  handleLoanSubmit: (data: any) => void;
}

const MainTabContent: React.FC<MainTabContentProps> = ({ 
  calculationData, 
  isSubmittingLoan, 
  handleCalculationComplete, 
  handleLoanSubmit 
}) => {
  // El estado calculationResult es interno de la calculadora y el formulario ahora
  const [calculationResult, setCalculationResult] = React.useState<CalculationResultType | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-brand-primary-600 rounded-full flex items-center justify-center shadow-sm">
          <Calculator className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Calculadora y Solicitud de Préstamo</h2>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div>
          <LoanCalculator 
            onCalculationChange={setCalculationResult}
            onCalculationComplete={handleCalculationComplete}
          />
        </div>
        
        <div id="loan-application-form">
          <LoanApplicationSteps 
            calculationResult={calculationResult}
            calculationData={calculationData}
            onSubmit={handleLoanSubmit}
            isSubmitting={isSubmittingLoan}
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-blue-900">Información Importante</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-blue-200">
              <Calculator className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">Calculadora en Tiempo Real</p>
                <p className="text-sm text-blue-700">Los cálculos se actualizan automáticamente</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/60 rounded-xl border border-blue-200">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">Solicitud Completa</p>
                <p className="text-sm text-blue-700">Todos los campos requeridos incluidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainTabContent;
