import React from "react";
import { useForm } from "react-hook-form";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useAiChat } from "@/contexts/AiChatContext";
import { useSidebar } from "@/components/ui/sidebar";

type ChatFormValues = {
  prompt: string;
};

export function AiChatBar() {
  const form = useForm<ChatFormValues>({ defaultValues: { prompt: "" } });
  const { isStreaming, handleSend, handleCancel } = useAiChat();
  const { isOffCanvas, state } = useSidebar();
  // state = "expanded" | "collapsed"; isOffCanvas = true/false

  const promptText = form.watch("prompt");
  const isDisabled = !promptText.trim() && !isStreaming;

  // Handle submission
  async function onSubmit(values: ChatFormValues) {
    if (!values.prompt.trim()) return;
    await handleSend(values.prompt);
    form.reset({ prompt: "" });
  }


  return (
    <div className="flex items-center justify-center">
      <div
        className={`
          relative
          bottom-10 
          z-50
          border 
          border-border 
          rounded-xl 
          bg-background 
          shadow 
          p-4
          pt-0

          /* 
            Use responsive widths so it grows on bigger screens:
            - w-full (base) => so it can fill the container
            - max-w-[90%] for small screens
            - sm:max-w-sm  => 640px
            - md:max-w-md => 768px
            - lg:max-w-lg => 1024px
            - xl:max-w-2xl => 1280px
            etc. Tweak as desired.
          */
          w-full 
          max-w-[90%]
          2xs:max-w-sm
          xs:max-w-md
          sm:max-w-lg
          md:max-w-xl
          lg:max-w-2xl
          xl:max-w-3xl
          2xl:max-w-4xl
        `}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2 items-end">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="sr-only">Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isStreaming}
                      placeholder="Ask anything..."
                      className="
                        resize-none
                        border-0
                        focus:ring-0
                        focus-visible:ring-0
                        bg-transparent
                      "
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type={isStreaming ? "button" : "submit"}
              variant="default"
              disabled={isDisabled}
              onClick={isStreaming ? handleCancel : undefined}
              className="h-10 w-10 p-0"
            >
              {isStreaming ? (
                <Square className="h-5 w-5 text-background" />
              ) : (
                <ArrowUp className="h-5 w-5 text-background" />
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

