"use client";

import React, { useEffect, useState } from "react";
import { ShortcutsModal } from "./shotcuts";
import { ExportModal } from "./ExportModal";

export const Modals = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <ShortcutsModal />
      <ExportModal />
    </>
  );
};
