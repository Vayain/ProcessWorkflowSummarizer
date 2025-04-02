import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AgentConfig from "@/pages/agent-config";
import Documentation from "@/pages/documentation";
import Header from "@/components/header";
import MobileNavigation from "@/components/mobile-navigation";
import { ScreenshotProvider } from "@/lib/context/screenshot-context";

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ScreenshotProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 flex">
            <Router />
          </div>
          <MobileNavigation />
        </div>
        <Toaster />
      </ScreenshotProvider>
    </QueryClientProvider>
  );
}

export default App;
