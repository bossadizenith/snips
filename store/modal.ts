import { atom, useAtom } from "jotai";
import type { ModalTypes } from "@/lib/types";

type ModalState = {
  type: ModalTypes | null;
  isOpen: boolean;
  data: any;
};

const modalAtom = atom<ModalState>({
  type: null,
  isOpen: false,
  data: null,
});

export const useModal = () => {
  const [modal, setModal] = useAtom(modalAtom);

  const onOpen = (type: ModalTypes, data: any = null) => {
    setModal({
      type,
      isOpen: true,
      data,
    });
  };

  const onClose = () => {
    setModal({
      type: null,
      isOpen: false,
      data: null,
    });
  };

  return {
    type: modal.type,
    isOpen: modal.isOpen,
    data: modal.data,
    onOpen,
    onClose,
  };
};

export default useModal;
