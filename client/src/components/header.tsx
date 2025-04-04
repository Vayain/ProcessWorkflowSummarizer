import { Link } from "wouter";
import logoSvg from "../assets/logo.svg";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-neutral-50 to-neutral-100 border-b border-neutral-200 px-4 py-3 flex items-center">
      <div className="flex items-center">
        <img src={logoSvg} alt="ScreenCaptureSummarizer Logo" className="h-8 w-8 mr-3" />
        <h1 className="text-xl font-semibold text-primary-600">
          ScreenCaptureSummarizer
        </h1>
      </div>
    </header>
  );
}
