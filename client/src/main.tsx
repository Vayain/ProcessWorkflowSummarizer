import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set title
document.title = "SCS";

// Add meta tags for better mobile experience
const viewport = document.querySelector('meta[name="viewport"]');
if (!viewport) {
  const metaTag = document.createElement('meta');
  metaTag.name = 'viewport';
  metaTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1';
  document.head.appendChild(metaTag);
}

// Add material icons
const link = document.createElement('link');
link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
link.rel = "stylesheet";
document.head.appendChild(link);

// Add Inter font
const fontLink = document.createElement('link');
fontLink.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
