import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputField {
  id: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}

interface CustomDialogProps {
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  inputs: InputField[];
  buttonText?: string;
  onSubmit: (values: Record<string, string>) => void;
}

export function CustomDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  title,
  description,
  inputs,
  buttonText = "Submit",
  onSubmit,
}: CustomDialogProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initialValues: Record<string, string> = {};
    inputs.forEach((input) => {
      initialValues[input.id] = input.defaultValue ?? "";
    });
    return initialValues;
  });
  const [uncontrolledOpen, setUncontrolledOpen] = useState(controlledOpen ?? false);
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? controlledOpen! : uncontrolledOpen;
  const setOpen = (val: boolean) => {
    if (isControlled) onOpenChange!(val);
    else setUncontrolledOpen(val);
  };
  const handleChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };
  const handleSubmit = () => {
    onSubmit(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {inputs.map((input) => (
            <div key={input.id} className="flex flex-col gap-2">
              <Label htmlFor={input.id} className="text-left">
                {input.label} {input.required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id={input.id}
                type={input.type ?? "text"}
                placeholder={input.placeholder}
                value={values[input.id]}
                onChange={(e) => handleChange(input.id, e.target.value)}
                required={input.required}
              />
            </div>
          ))}
        </div>
        <DialogFooter className="sm:justify-center">
          <Button type="submit" onClick={handleSubmit}>
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

