import { useLocation } from "wouter";

export default function MobileNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around py-2">
      <button 
        className="p-2 flex flex-col items-center"
        onClick={() => setLocation("/")}
      >
        <span className={`material-icons ${location === "/" ? "text-primary-400" : "text-neutral-500"}`}>
          screenshot_monitor
        </span>
        <span className="text-xs text-neutral-600 mt-1">Capture</span>
      </button>
      <button 
        className="p-2 flex flex-col items-center"
        onClick={() => setLocation("/agent-config")}
      >
        <span className={`material-icons ${location === "/agent-config" ? "text-primary-400" : "text-neutral-500"}`}>
          smart_toy
        </span>
        <span className="text-xs text-neutral-600 mt-1">AI Agents</span>
      </button>
      <button 
        className="p-2 flex flex-col items-center"
        onClick={() => setLocation("/documentation")}
      >
        <span className={`material-icons ${location === "/documentation" ? "text-primary-400" : "text-neutral-500"}`}>
          description
        </span>
        <span className="text-xs text-neutral-600 mt-1">Docs</span>
      </button>
      <button className="p-2 flex flex-col items-center">
        <span className="material-icons text-neutral-500">settings</span>
        <span className="text-xs text-neutral-600 mt-1">Settings</span>
      </button>
    </div>
  );
}
