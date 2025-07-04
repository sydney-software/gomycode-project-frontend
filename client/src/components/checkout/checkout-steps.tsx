import { Check } from "lucide-react";

interface CheckoutStepsProps {
  currentStep: number;
}

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const steps = [
    { id: 1, name: 'Shipping', description: 'Shipping details' },
    { id: 2, name: 'Payment', description: 'Payment method' },
    { id: 3, name: 'Review', description: 'Order review' },
  ];

  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step.id < currentStep
                  ? 'bg-green-500 text-white'
                  : step.id === currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-300 text-slate-600'
              }`}
            >
              {step.id < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                step.id
              )}
            </div>
            <div className="ml-2 text-sm">
              <div className={`font-medium ${
                step.id <= currentStep ? 'text-slate-900' : 'text-slate-600'
              }`}>
                {step.name}
              </div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-px mx-4 ${
              step.id < currentStep ? 'bg-green-500' : 'bg-slate-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}
