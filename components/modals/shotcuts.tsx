"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Shortcut } from "@/components/ui/kbd";
import { siteConfig } from "@/lib/site";
import useModal from "@/store/modal";
import Link from "next/link";
import { Icons } from "../icons";

export const ShortcutsModal = () => {
  const { type, isOpen, onClose } = useModal();
  const isModalOpen = type === "shortcuts" && isOpen;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden border-neutral-800 bg-neutral-950 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-150">
          <div className="p-10 border-r border-neutral-800 flex flex-col h-full bg-neutral-900/30">
            <div className="flex-1 space-y-10">
              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">
                  About
                </h3>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-white tracking-tight leading-none">
                    {siteConfig.name}
                  </h2>
                  <p className="text-[15px] leading-relaxed text-neutral-400 font-medium">
                    {siteConfig.description}. Pick a theme, customize the
                    background, and share beautiful snippets with the world.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-4">
                  Contribute
                </h3>
                <div className="space-y-4">
                  <p className="text-[14px] leading-relaxed text-neutral-400">
                    This project is open-source and built for the community. If
                    you love it, consider contributing on GitHub or sharing your
                    creations.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link
                      href={siteConfig.links.github}
                      target="_blank"
                      className="group inline-flex items-center gap-3 text-[14px] text-white/70 hover:text-white transition-colors"
                    >
                      <div className="p-2 bg-neutral-800 rounded-lg group-hover:bg-neutral-700 transition-colors">
                        <Icons.github className="size-4" />
                      </div>
                      <span>Star on GitHub</span>
                    </Link>
                  </div>
                </div>
              </section>
            </div>

            <div className="pt-8 mt-10 border-t border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[13px] font-medium text-neutral-500">
                  Built by
                </span>
                <Link
                  href={siteConfig.links.author.authorSite}
                  target="_blank"
                  className="text-[13px] font-bold text-white hover:text-neutral-300 transition-colors"
                >
                  {siteConfig.links.author.name}
                </Link>
              </div>
              <div className="flex items-center gap-5">
                <Link
                  href={siteConfig.links.github}
                  target="_blank"
                  className="text-neutral-500 hover:text-white transition-all transform hover:scale-110"
                >
                  <Icons.github className="size-5" />
                </Link>
                <Link
                  href={siteConfig.links.x}
                  target="_blank"
                  className="text-neutral-500 hover:text-white transition-all transform hover:scale-110"
                >
                  <Icons.twitter className="size-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side: Shortcuts */}
          <div className="p-10 flex flex-col h-full bg-neutral-950">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-8">
              Keyboard Shortcuts
            </h3>

            <div className="flex-1 space-y-8 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-800">
              <div>
                <h4 className="text-xs font-bold text-neutral-600 uppercase mb-4 tracking-wider">
                  General
                </h4>
                <div className="space-y-3">
                  <Shortcut keys={["Shift", "N"]}>New Slide</Shortcut>
                  <Shortcut keys={["F5"]}>Present Mode</Shortcut>
                  <Shortcut keys={["?"]}>Toggle Shortcuts</Shortcut>
                  <Shortcut keys={["Ctrl", "K"]}>Search Shortcuts</Shortcut>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-neutral-600 uppercase mb-4 tracking-wider">
                  Editor
                </h4>
                <div className="space-y-3">
                  <Shortcut keys={["F"]}>Focus text editor</Shortcut>
                  <Shortcut keys={["Esc"]}>Unfocus text editor</Shortcut>
                  <Shortcut keys={["Shift", "Alt", "F"]}>Format code</Shortcut>
                  <Shortcut keys={["→"]}>Next slide</Shortcut>
                  <Shortcut keys={["←"]}>Previous slide</Shortcut>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-neutral-600 uppercase mb-4 tracking-wider">
                  Customization
                </h4>
                <div className="space-y-3">
                  <Shortcut keys={["C"]}>Change Theme</Shortcut>
                  <Shortcut keys={["B"]}>Toggle Background</Shortcut>
                  <Shortcut keys={["D"]}>Toggle Dark Mode</Shortcut>
                  <Shortcut keys={["L"]}>Select Language</Shortcut>
                  {/* <Shortcut keys={["P"]}>Change Padding</Shortcut>
                  <Shortcut keys={["N"]}>Toggle Line Numbers</Shortcut> */}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800">
              <p className="text-[13px] text-neutral-500 leading-relaxed italic">
                Pro tip: Use these shortcuts to speed up your workflow and
                create slides effortlessly.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
