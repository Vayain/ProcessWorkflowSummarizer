import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// Define the possible workflow steps
export type WorkflowStep = 
  | 'capture-setup' 
  | 'capture-active' 
  | 'capture-completed' 
  | 'analysis-pending' 
  | 'analysis-active' 
  | 'analysis-completed' 
  | 'agent-config' 
  | 'documentation';

export type StepStatus = 'incomplete' | 'active' | 'completed';

interface WorkflowContextType {
  // Current active workflow step
  currentStep: WorkflowStep;
  
  // Set the current step
  setCurrentStep: (step: WorkflowStep) => void;
  
  // Get the status of a specific step
  getStepStatus: (step: WorkflowStep) => StepStatus;
  
  // Mark a step as completed
  completeStep: (step: WorkflowStep) => void;
  
  // Reset the workflow to initial state
  resetWorkflow: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location] = useLocation();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('capture-setup');
  const [completedSteps, setCompletedSteps] = useState<Set<WorkflowStep>>(new Set());
  
  // Initialize workflow state based on URL on first load
  useEffect(() => {
    if (location === '/agent-config') {
      // If on agent config page, mark previous steps as completed
      const completedStepsArray: WorkflowStep[] = [
        'capture-setup', 
        'capture-active', 
        'capture-completed',
        'analysis-pending',
        'analysis-active',
        'analysis-completed'
      ];
      setCompletedSteps(new Set(completedStepsArray));
      setCurrentStep('agent-config');
    } else if (location === '/documentation') {
      // If on documentation page, mark all previous steps as completed
      const completedStepsArray: WorkflowStep[] = [
        'capture-setup', 
        'capture-active', 
        'capture-completed',
        'analysis-pending',
        'analysis-active',
        'analysis-completed',
        'agent-config'
      ];
      setCompletedSteps(new Set(completedStepsArray));
      setCurrentStep('documentation');
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Update current step based on URL changes
  useEffect(() => {
    if (location === '/') {
      if (completedSteps.has('capture-completed')) {
        setCurrentStep('analysis-pending');
      } else if (completedSteps.has('capture-active')) {
        setCurrentStep('capture-active');
      } else {
        setCurrentStep('capture-setup');
      }
    } else if (location === '/agent-config') {
      setCurrentStep('agent-config');
    } else if (location === '/documentation') {
      setCurrentStep('documentation');
    }
  }, [location, completedSteps]);

  const getStepStatus = (step: WorkflowStep): StepStatus => {
    if (completedSteps.has(step)) {
      return 'completed';
    }
    if (currentStep === step) {
      return 'active';
    }
    return 'incomplete';
  };

  const completeStep = (step: WorkflowStep) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(step);
      return newSet;
    });
    
    // Auto-advance to the next logical step
    const stepOrder: WorkflowStep[] = [
      'capture-setup',
      'capture-active',
      'capture-completed',
      'analysis-pending',
      'analysis-active',
      'analysis-completed',
      'agent-config',
      'documentation'
    ];
    
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex >= 0 && currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const resetWorkflow = () => {
    setCurrentStep('capture-setup');
    setCompletedSteps(new Set());
  };

  return (
    <WorkflowContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        getStepStatus,
        completeStep,
        resetWorkflow
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = (): WorkflowContextType => {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};