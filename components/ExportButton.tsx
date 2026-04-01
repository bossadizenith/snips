import { DownloadIcon } from "@raycast/icons";
import React from "react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

const ExportButton: React.FC = () => {
  return (
    <ButtonGroup>
      <Button disabled onClick={() => {}} aria-label="Export as PNG">
        <DownloadIcon className="w-4 h-4" />
        Export
      </Button>
    </ButtonGroup>
  );
};

export default ExportButton;
