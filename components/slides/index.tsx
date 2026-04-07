"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { initializeSlidesAtom } from "@/store/slide";
import useModal from "@/store/modal";
import { useSetAtom } from "jotai";
import classNames from "classnames";
import { Info, Layers, Settings } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { SlidesPanel } from "./SlidesPanel";
import styles from "./slides.module.css";

type SidebarTab = "slides" | "settings";

export const Slides = () => {
  const [activeTab, setActiveTab] = useState<SidebarTab>("slides");
  const initializeSlides = useSetAtom(initializeSlidesAtom);
  const { onOpen } = useModal();

  useEffect(() => {
    initializeSlides();
  }, [initializeSlides]);

  return (
    <aside className="h-screen w-(--sidebar-width) border-l border-gray-2 p-4 flex flex-col bg-sidebar shrink-0 overflow-hidden">
      {/* Tab Switcher */}
      <div className={styles.tabSwitcher}>
        <button
          type="button"
          className={classNames(styles.tab, {
            [styles.tabActive]: activeTab === "slides",
          })}
          onClick={() => setActiveTab("slides")}
        >
          <Layers className="size-3.5" />
          Slides
        </button>
        <button
          type="button"
          className={classNames(styles.tab, {
            [styles.tabActive]: activeTab === "settings",
          })}
          onClick={() => setActiveTab("settings")}
          disabled
        >
          <Settings className="size-3.5" />
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === "slides" && <SlidesPanel />}
        {activeTab === "settings" && (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            Coming soon
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-2 mt-3">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => onOpen("shortcuts")}
        >
          <Info className="text-muted-foreground" />
        </Button>
        <Link href={siteConfig.links.github} target="_blank">
          <Icons.github className="size-6 text-muted-foreground" />
        </Link>
      </div>
    </aside>
  );
};
