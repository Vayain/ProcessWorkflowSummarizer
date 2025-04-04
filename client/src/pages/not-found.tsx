import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            The page you're looking for doesn't exist in ScreenCaptureSummarizer.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            <a href="/" className="text-primary-500 hover:text-primary-600">
              Return to the home page
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
