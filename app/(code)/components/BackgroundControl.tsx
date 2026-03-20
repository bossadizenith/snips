import { useAtom } from "jotai";
import React from "react";
import { showBackgroundAtom } from "@/store";
import useHotkeys from "@/utils/useHotkeys";
import ControlContainer from "./ControlContainer";
import { Switch } from "@/components/ui/switch";

const BackgroundControl: React.FC = () => {
  const [showBackground, setShowBackground] = useAtom(showBackgroundAtom);

  useHotkeys("b", () => {
    setShowBackground((old) => !old);
  });

  return (
    <ControlContainer title="Background">
      <Switch
        checked={showBackground}
        onCheckedChange={() => setShowBackground((old) => !old)}
      />
    </ControlContainer>
  );
};

export default BackgroundControl;
