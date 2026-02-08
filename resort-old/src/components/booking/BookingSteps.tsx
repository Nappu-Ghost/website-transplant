import React from 'react';

interface BookingStep {
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface BookingStepsProps {
  steps: BookingStep[];
  currentStep: number;
}

const BookingSteps: React.FC<BookingStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="max-w-7xl mx-auto mb-12">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div key={step.title} className="flex flex-col items-center relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${step.isCompleted ? 'bg-blue-600' : step.isCurrent ? 'bg-blue-500' : 'bg-gray-300'} text-white font-semibold`}
            >
              {index + 1}
            </div>
            <span className="mt-2 text-sm font-medium text-white">{step.title}</span>
          </div>
        ))}
        {/* Progress Line */}
        <div className="absolute top-5 left-0 h-1 bg-gray-300 w-full -z-10">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingSteps;