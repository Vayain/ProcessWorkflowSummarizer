import { Link, useLocation } from "wouter";
import { useWorkflow } from "@/lib/context/workflow-context";

export default function TopNavigation() {
  const [location] = useLocation();
  const { currentStep, getStepStatus } = useWorkflow();
  
  // Check if Documentation tab should be highlighted
  const isDocumentationHighlighted = 
    currentStep === 'documentation' || 
    getStepStatus('analysis-completed') === 'completed';
  
  return (
    <div className="bg-white border-b border-neutral-200 px-4 py-2 flex justify-center">
      <div className="flex space-x-1 max-w-4xl mx-auto">
        <Link href="/">
          <div className={`px-3 py-1 text-sm font-medium rounded-t-md transition-colors cursor-pointer ${
            location === '/' 
              ? 'bg-white border-t border-l border-r border-neutral-200 -mb-px' 
              : 'text-neutral-600 hover:text-primary-600'
          }`}>
            Screen Capture
          </div>
        </Link>
        
        <Link href="/agent-config">
          <div className={`px-3 py-1 text-sm font-medium rounded-t-md transition-colors cursor-pointer ${
            location === '/agent-config' 
              ? 'bg-white border-t border-l border-r border-neutral-200 -mb-px' 
              : 'text-neutral-600 hover:text-primary-600'
          }`}>
            Agent Configuration
          </div>
        </Link>
        
        <Link href="/documentation">
          <div className={`px-3 py-1 text-sm font-medium rounded-t-md transition-colors cursor-pointer ${
            location === '/documentation' 
              ? 'bg-white border-t border-l border-r border-neutral-200 -mb-px' 
              : isDocumentationHighlighted
              ? 'bg-green-50 border-t border-l border-r border-green-300 text-green-700 -mb-px'
              : 'text-neutral-600 hover:text-primary-600'
          }`}>
            Documentation
          </div>
        </Link>
      </div>
    </div>
  );
}