'use client';

type ProgressBarProps = {
    currentStep: number;
    highestCompletedStep: number;
    onStepClick: (step: number) => void;
};

const steps = ['Basic Details', 'Detailed Information', 'Plans & Pricing', "Your Details"];

export default function ProgressBar({ currentStep, highestCompletedStep, onStepClick }: ProgressBarProps) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-0 py-2">
        <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200" aria-hidden="true"></div>
            <div 
                className="absolute top-1/2 left-0 h-0.5 bg-blue-600 transition-all duration-500" 
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            ></div>
            <div className="relative flex justify-between w-full">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = highestCompletedStep >= stepNumber;
                    const isClickable = highestCompletedStep >= index;

                    return (
                        <div key={step} className="flex flex-col items-center text-center w-24">

                            <button
                                onClick={() => isClickable && onStepClick(index)}
                                disabled={!isClickable}
                                className={`flex flex-col items-center ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    isActive ? 'bg-blue-600 text-white' : isCompleted ? 'border-2 border-blue-600 text-blue-600' : 'bg-gray-200 text-gray-500'
                                }`}
                            >
                                {isCompleted ? '✔' : stepNumber}
                            </div>
                            <p className={`mt-2 text-xs font-semibold ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{step}</p>
                        </button>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
}
