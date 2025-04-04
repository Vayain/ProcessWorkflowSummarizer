import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/sidebar";
import CaptureControls from "@/components/capture-controls";
import LiveView from "@/components/live-view";
import ScreenshotGallery from "@/components/screenshot-gallery";
import EditDescriptionModal from "@/components/edit-description-modal";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedScreenshotId, setSelectedScreenshotId] = useState<number | null>(null);

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
