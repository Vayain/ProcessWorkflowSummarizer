import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="material-icons text-primary-400 mr-2">video_camera_back</span>
          <h1 className="text-xl font-semibold text-neutral-700">ScreenCaptureSummarizer</h1>
        </div>
        
        <div className="hidden md:flex space-x-1">
          <Link href="/">
            <a className="px-3 py-1 rounded-md hover:bg-neutral-100 text-neutral-700 font-medium">Screen Capture</a>
          </Link>
          <Link href="/agent-config">
            <a className="px-3 py-1 rounded-md hover:bg-neutral-100 text-neutral-700 font-medium">Agent Configuration</a>
          </Link>
          <Link href="/documentation">
            <a className="px-3 py-1 rounded-md hover:bg-neutral-100 text-neutral-700 font-medium">Documentation</a>
          </Link>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-full hover:bg-neutral-100">
          <span className="material-icons text-neutral-500">help_outline</span>
        </button>
        
        <button className="p-2 rounded-full hover:bg-neutral-100">
          <span className="material-icons text-neutral-500">notifications_none</span>
        </button>
        
        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
          US
        </div>
      </div>
    </header>
  );
}
