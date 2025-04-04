import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center">
      <div className="flex items-center">
        <span className="material-icons text-primary-400 mr-2">video_camera_back</span>
        <h1 className="text-xl font-semibold text-neutral-700">ScreenCaptureSummarizer</h1>
      </div>
    </header>
  );
}
