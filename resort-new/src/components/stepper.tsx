"use client";

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import {
  Children,
  type HTMLAttributes,
  type JSX,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import './stepper.css';

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  canProceed?: (step: number) => boolean;
  hideNextOnLastStep?: boolean;
}

interface StepProps {
  children: ReactNode;
}

const stepVariants: Variants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? '-100%' : '100%',
    opacity: 0,
  }),
  center: {
    x: '0%',
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? '50%' : '-50%',
    opacity: 0,
  }),
};

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange,
  onFinalStepCompleted,
  backButtonText = 'Back',
  nextButtonText = 'Next',
  disableStepIndicators = false,
  canProceed,
  hideNextOnLastStep = true,
  ...rest
}: StepperProps): JSX.Element {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted?.();
      return;
    }
    onStepChange?.(newStep);
  };

  const handleBack = () => {
    if (currentStep <= 1) return;
    setDirection(-1);
    updateStep(currentStep - 1);
  };

  const handleNext = () => {
    const allowed = canProceed ? canProceed(currentStep) : true;
    if (!allowed) return;

    if (isLastStep) {
      setDirection(1);
      updateStep(totalSteps + 1);
      return;
    }

    setDirection(1);
    updateStep(currentStep + 1);
  };

  const nextDisabled = canProceed ? !canProceed(currentStep) : false;

  return (
    <div className="booking-stepper" {...rest}>
      <div className="booking-stepper-shell">
        <div className="booking-stepper-row">
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const status =
              currentStep === stepNumber
                ? 'active'
                : currentStep > stepNumber
                ? 'complete'
                : 'inactive';
            const connectorComplete = currentStep > stepNumber;
            const isNotLast = index < totalSteps - 1;

            return (
              <div key={`step-${stepNumber}`} className="flex items-center">
                <button
                  type="button"
                  className="booking-step-indicator"
                  disabled={disableStepIndicators}
                  onClick={() => {
                    if (disableStepIndicators || stepNumber === currentStep) return;
                    setDirection(stepNumber > currentStep ? 1 : -1);
                    updateStep(stepNumber);
                  }}
                >
                  <span className={`booking-step-indicator-inner ${status}`}>
                    {status === 'complete' ? <CheckIcon className="booking-step-check" /> : stepNumber}
                  </span>
                </button>
                {isNotLast ? (
                  <span className="booking-step-connector" aria-hidden="true">
                    <motion.span
                      className="booking-step-connector-inner"
                      initial={false}
                      animate={{ width: connectorComplete ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <StepContentWrapper isCompleted={isCompleted} currentStep={currentStep} direction={direction}>
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted ? (
          <div className="booking-step-footer">
            <div className={`booking-step-footer-nav ${currentStep === 1 ? 'end' : ''}`}>
              {currentStep > 1 ? (
                <button type="button" className="booking-step-btn" onClick={handleBack}>
                  {backButtonText}
                </button>
              ) : null}
              {!(hideNextOnLastStep && isLastStep) ? (
                <button type="button" className="booking-step-btn next" onClick={handleNext} disabled={nextDisabled}>
                  {isLastStep ? 'Complete' : nextButtonText}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
}: {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: ReactNode;
}) {
  const [parentHeight, setParentHeight] = useState<number>(0);

  return (
    <motion.div
      className="booking-step-content"
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: 'spring', duration: 0.4 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted ? (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={setParentHeight}>
            {children}
          </SlideTransition>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: {
  children: ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    onHeightReady(containerRef.current.offsetHeight);
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      className="booking-step-pane"
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.05, ease: 'easeOut', duration: 0.25 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export function Step({ children }: StepProps): JSX.Element {
  return <div>{children}</div>;
}
