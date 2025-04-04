import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useScreenshotContext } from "@/lib/context/screenshot-context";

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: (sessionId: number) => void;
}

export default function CreateSessionModal({
  isOpen,
  onClose,
  onSessionCreated,
}: CreateSessionModalProps) {
  const [sessionName, setSessionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { captureInterval, captureArea } = useScreenshotContext();

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      toast({
        title: "Session Name Required",
        description: "Please enter a name for your session.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sessionName,
          captureInterval,
          captureArea,
        }),
      });
      
      if (response.ok) {
        const newSession = await response.json();
        onSessionCreated(newSession.id);
        toast({
          title: "Session Created",
          description: `Session "${sessionName}" has been created successfully.`,
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: "Failed to create session. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Give your session a descriptive name to help you identify it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Website Onboarding Flow"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-sm text-right text-muted-foreground">
              Capture Area
            </div>
            <div className="col-span-3 text-sm">
              {captureArea || "Not selected yet"}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-sm text-right text-muted-foreground">
              Interval
            </div>
            <div className="col-span-3 text-sm">
              Every {captureInterval} seconds
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleCreateSession} 
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}