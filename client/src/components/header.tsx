import { Link, useLocation } from "wouter";
import logoSvg from "../assets/logo.svg";
import { useWorkflow } from "@/lib/context/workflow-context";

export default function Header() {
  const [location] = useLocation();
  const { currentStep, getStepStatus } = useWorkflow();
  
  // Check if Documentation tab should be highlighted
  const isDocumentationHighlighted = 
    currentStep === 'documentation' || 
    getStepStatus('analysis-completed') === 'completed';
  
  return (
    <header className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b border-neutral-200 px-4 py-3 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img src={logoSvg} alt="ScreenCaptureSummarizer Logo" className="h-8 w-8 mr-3" />
          <h1 className="text-xl font-semibold text-primary-600">
            ScreenCaptureSummarizer
          </h1>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="flex mt-2 space-x-1">
        <Link href="/">
          <div className={`px-3 py-1 text-sm font-medium rounded-t-md transition-colors cursor-pointer ${
            location === '/' 
              ? 'bg-white border-t border-l border-r border-neutral-200 -mb-px' 
              : 'text-neutral-600 hover:text-primary-600'
          }`}>
            Capture
          </div>
        </Link>
        
        <Link href="/agent-config">
          <div className={`px-3 py-1 text-sm font-medium rounded-t-md transition-colors cursor-pointer ${
            location === '/agent-config' 
              ? 'bg-white border-t border-l border-r border-neutral-200 -mb-px' 
              : 'text-neutral-600 hover:text-primary-600'
          }`}>
            Agent Config
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
    </header>
  );
}
