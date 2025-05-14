import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface TabbedDialogProps {
  trigger: React.ReactNode;
  title: string;
  tabTitle: string;
  helpContent?: React.ReactNode;
  children: React.ReactNode;

  // Optional top-right
  topRightButtonText?: string;
  onTopRightButtonClick?: () => void;
  topRightSlot?: React.ReactNode;

  // Bottom-right “Close/Submit” button
  bottomRightButtonText?: string;
  onBottomRightButtonClick?: () => void;
}

export function TabbedDialog({
  trigger,
  title,
  tabTitle,
  helpContent,
  children,

  // Top-right
  topRightButtonText = "Action",
  onTopRightButtonClick,
  topRightSlot,

  // Bottom-right
  bottomRightButtonText = "Submit",
  onBottomRightButtonClick,
}: TabbedDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("content");

  // Internal close handler that calls the user callback if provided
  const handleBottomRightClick = () => {
    if (onBottomRightButtonClick) {
      onBottomRightButtonClick();
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[1500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          <div className="mt-4 mb-4">
            <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="inline-flex w-auto">
                <TabsTrigger value="content">{tabTitle}</TabsTrigger>
                <TabsTrigger value="help">Help & Instructions</TabsTrigger>
              </TabsList>
            </Tabs>
            <Separator />
          </div>

          <div className="flex justify-between items-center mb-4 h-8">
            {activeTab === "content" ? (
              <>
                <h3 className="text-base font-medium">{tabTitle}</h3>
                {topRightSlot ? (
                  topRightSlot
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onTopRightButtonClick}
                  >
                    {topRightButtonText}
                  </Button>
                )}
              </>
            ) : (
              <h3 className="text-base font-medium">Help & Instructions</h3>
            )}
          </div>

          <div className="flex-1 min-h-[500px] h-[500px] overflow-y-auto">
            {activeTab === "content" ? (
              <div className="space-y-4">{children}</div>
            ) : (
              <div className="space-y-4">
                {helpContent ?? (
                  <div className="text-sm text-muted-foreground">
                    <p>This section provides guidance on how to use this feature.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Read through the instructions carefully</li>
                      <li>Follow the steps in the order provided</li>
                      <li>Refer back to this tab if you need assistance</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {activeTab === "content" && (
            <div className="flex justify-end mt-6">
              <Button onClick={handleBottomRightClick}>
                {bottomRightButtonText}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
