import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shortcut } from "@/components/ui/kbd";
import useModal from "@/store/modal";

export const ShortcutsModal = () => {
  const { type, isOpen, onClose } = useModal();
  const isModalOpen = type === "shortcuts" && isOpen;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <Shortcut keys={["Shift", "N"]}>New Slide</Shortcut>
        <Shortcut keys={["F5"]}>Present</Shortcut>
        <Shortcut keys={["Esc (in presentation mode)"]}>Exit</Shortcut>
        <Shortcut keys={["→"]}>Next Slide</Shortcut>
        <Shortcut keys={["←"]}>Previous Slide</Shortcut>
        <Shortcut keys={["Ctrl", "K"]}>Shortcuts</Shortcut>
      </DialogContent>
    </Dialog>
  );
};
