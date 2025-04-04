import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AgentConfig from "@/pages/agent-config";
import Documentation from "@/pages/documentation";
import Header from "@/components/header";
import TopNavigation from "@/components/top-navigation";
import MobileNavigation from "@/components/mobile-navigation";
import { ScreenshotProvider, useScreenshotContext } from "@/lib/context/screenshot-context";
import { WorkflowProvider } from "@/lib/context/workflow-context";
import CreateSessionModal from "@/components/create-session-modal";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/agent-config" component={AgentConfig} />
      <Route path="/documentation" component={Documentation} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Component that uses the context
function AppContent() {
  const { isSessionModalOpen, setIsSessionModalOpen, handleSessionCreated } = useScreenshotContext();

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />
        <TopNavigation />
        <div className="flex-1 flex">
          <Router />
        </div>
        <MobileNavigation />
      </div>
      <CreateSessionModal 
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSessionCreated={handleSessionCreated}
      />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ScreenshotProvider>
        <WorkflowProvider>
          <AppContent />
        </WorkflowProvider>
      </ScreenshotProvider>
    </QueryClientProvider>
  );
}

export default App;
