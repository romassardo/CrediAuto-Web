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
        <h2 className="text-2xl font-bold text-gray-900">Simulador y Solicitud de Préstamo</h2>
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
      {/* Información adicional eliminada por solicitud del cliente */}
    </div>
  );
};

export default MainTabContent;
