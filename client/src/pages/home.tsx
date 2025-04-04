import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/sidebar";
import CaptureControls from "@/components/capture-controls";
import LiveView from "@/components/live-view";
import ScreenshotGallery from "@/components/screenshot-gallery";
import EditDescriptionModal from "@/components/edit-description-modal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkflow } from "@/lib/context/workflow-context";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedScreenshotId, setSelectedScreenshotId] = useState<number | null>(null);
  const { currentStep, getStepStatus } = useWorkflow();
  
  // Check if the Documentation tab should be highlighted
  const isDocumentationHighlighted = 
    currentStep === 'documentation' || 
    getStepStatus('analysis-completed') === 'completed';

  const openEditModal = (screenshotId: number) => {
    setSelectedScreenshotId(screenshotId);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedScreenshotId(null);
  };

  return (
    <>
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-neutral-200">
          <Tabs defaultValue="capture" className="w-full">
            <TabsList className="flex">
              <TabsTrigger
                value="capture"
                className="px-4 py-3 data-[state=active]:text-primary-400 data-[state=active]:border-b-2 data-[state=active]:border-primary-400 data-[state=active]:font-medium"
              >
                Screen Capture
              </TabsTrigger>
              <TabsTrigger
                value="agent-config"
                className="px-4 py-3 data-[state=active]:text-primary-400 data-[state=active]:border-b-2 data-[state=active]:border-primary-400 data-[state=active]:font-medium"
                onClick={() => setLocation("/agent-config")}
              >
                Agent Configuration
              </TabsTrigger>
              <TabsTrigger
                value="documentation"
                className={`px-4 py-3 ${
                  isDocumentationHighlighted && location !== '/documentation'
                  ? 'text-green-700 border-b-2 border-green-500 font-medium bg-green-50'
                  : 'data-[state=active]:text-primary-400 data-[state=active]:border-b-2 data-[state=active]:border-primary-400 data-[state=active]:font-medium'
                }`}
                onClick={() => setLocation("/documentation")}
              >
                Documentation
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <CaptureControls />

        {/* Content Area with Live View and Gallery */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <LiveView />
          <ScreenshotGallery onEdit={openEditModal} />
        </div>
      </div>

      <EditDescriptionModal 
        isOpen={isEditModalOpen} 
        onClose={closeEditModal}
        screenshotId={selectedScreenshotId}
      />
    </>
  );
}
