import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import React from "react";

type Props = {
  open: boolean;
  word: string | null;
  onConfirm: () => void;
  onRetry: () => void;
  onDismiss: () => void;
};

export default function ConfirmWordDialog({ open, word, onConfirm, onRetry, onDismiss }: Props) {
  return React.createElement(
    AlertDialog,
    {
      open,
      onOpenChange: (isOpen: boolean) => {
        if (!isOpen) onDismiss();
      },
    },
    React.createElement(
      AlertDialogContent,
      null,
      React.createElement(
        AlertDialogHeader,
        null,
        React.createElement(AlertDialogTitle, null, "Was this the right word?"),
        React.createElement(AlertDialogDescription, null, "We read your sign as:")
      ),
      React.createElement("p", { className: "py-2 text-center text-5xl font-bold" }, word),
      React.createElement(
        AlertDialogFooter,
        null,
        React.createElement(
          Button,
          { variant: "outline", onClick: onRetry },
          "No, try again"
        ),
        React.createElement(Button, { onClick: onConfirm }, "Yes, speak it")
      )
    )
  );
}

