import React, { MouseEventHandler, useContext, useState } from "react";
import { track } from "@vercel/analytics";

import {
  ImageIcon,
  LinkIcon,
  ChevronDownIcon,
  CopyClipboardIcon as ClipboardIcon,
  ArrowsExpandIcon as ArrowsExpandingIcon,
  VideoIcon,
} from "@raycast/icons";

import { FrameContext } from "@/store/FrameContextStore";
import { derivedFlashMessageAtom, flashShownAtom } from "@/store/flash";
import { fileNameAtom, slidesAtom, showVideoPreviewAtom, windowWidthAtom } from "@/store";
import download from "@/utils/download";
import { toPng, toSvg, toBlob } from "@/lib/image";

import useHotkeys from "@/hooks/useHotkeys";
import usePngClipboardSupported from "@/hooks/usePngClipboardSupported";
import { useAtom, useAtomValue } from "jotai";
import {
  EXPORT_SIZE_OPTIONS,
  SIZE_LABELS,
  exportSizeAtom,
} from "@/store/image";
import { autoDetectLanguageAtom, selectedLanguageAtom } from "@/store/code";
import { LANGUAGES } from "@/utils/languages";
import { themeAtom, darkModeAtom } from "@/store/themes";
import { paddingAtom } from "@/store/padding";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DownloadIcon } from "@raycast/icons";
import { Kbd, Kbds } from "@/components/ui/kbd";

const ExportButton: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isRenderingVideo, setIsRenderingVideo] = useState(false);
  const pngClipboardSupported = usePngClipboardSupported();
  const frameContext = useContext(FrameContext);
  const [, setFlashMessage] = useAtom(derivedFlashMessageAtom);
  const [, setFlashShown] = useAtom(flashShownAtom);
  const customFileName = useAtomValue(fileNameAtom);
  const fileName = customFileName.replaceAll(" ", "-") || "ray-so-export";
  const [exportSize, setExportSize] = useAtom(exportSizeAtom);
  const selectedLanguage = useAtomValue(selectedLanguageAtom);
  const autoDetectLanguage = useAtomValue(autoDetectLanguageAtom);
  const showVideo = useAtomValue(showVideoPreviewAtom);
  const slides = useAtomValue(slidesAtom);
  const theme = useAtomValue(themeAtom);
  const darkMode = useAtomValue(darkModeAtom);
  const language = useAtomValue(selectedLanguageAtom);
  const padding = useAtomValue(paddingAtom);
  const windowWidth = useAtomValue(windowWidthAtom);

  const savePng = async () => {
    if (!frameContext?.current) {
      throw new Error("Couldn't find a frame to export");
    }

    setFlashMessage({ icon: <ImageIcon />, message: "Exporting PNG" });

    const dataUrl = await toPng(frameContext.current, {
      pixelRatio: exportSize,
    });

    download(dataUrl, `${fileName}.png`);

    setFlashShown(false);
  };

  const copyPng = async () => {
    setFlashMessage({ icon: <ClipboardIcon />, message: "Copying PNG" });
    if (!frameContext?.current) {
      throw new Error("Couldn't find a frame to export");
    }

    const clipboardItem = new ClipboardItem({
      "image/png": toBlob(frameContext.current, {
        pixelRatio: exportSize,
      }).then((blob) => {
        if (!blob) {
          throw new Error("expected toBlob to return a blob");
        }
        return blob;
      }),
    });

    await navigator.clipboard.write([clipboardItem]);

    setFlashMessage({
      icon: <ClipboardIcon />,
      message: "PNG Copied to clipboard!",
      timeout: 2000,
    });
  };

  const saveSvg = async () => {
    if (!frameContext?.current) {
      throw new Error("Couldn't find a frame to export");
    }

    setFlashMessage({ icon: <ImageIcon />, message: "Exporting SVG" });

    const dataUrl = await toSvg(frameContext.current);
    download(dataUrl, `${fileName}.svg`);

    setFlashShown(false);
  };

  const saveVideo = async () => {
    console.log("username");
    if (isRenderingVideo) return;
    setIsRenderingVideo(true);
    setFlashMessage({
      icon: <VideoIcon />,
      message: "Rendering video… this may take a minute",
    });

    try {
      const response = await fetch("/api/render-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides, theme, darkMode, language, padding, windowWidth }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.mp4`;
      a.click();
      URL.revokeObjectURL(url);

      setFlashMessage({
        icon: <VideoIcon />,
        message: "Video exported!",
        timeout: 2000,
      });
    } catch (err) {
      console.error("[ExportButton] Video render failed:", err);
      setFlashMessage({
        icon: <VideoIcon />,
        message: `Export failed: ${String(err)}`,
        timeout: 4000,
      });
    } finally {
      setIsRenderingVideo(false);
      setFlashShown(false);
    }
  };

  const dropdownHandler = (handler: () => void) => {
    return (event: Event | any) => {
      event.preventDefault();
      handler();
      setDropdownOpen(false);
    };
  };

  const handleExportClick: MouseEventHandler = (event) => {
    event.preventDefault();

    const params = new URLSearchParams(window.location.hash.replace("#", "?"));
    track("Export", {
      theme: params.get("theme") || "candy",
      background: params.get("background") || "true",
      darkMode: params.get("darkMode") || "true",
      padding: params.get("padding") || "64",
      language:
        Object.keys(LANGUAGES).find(
          (key) => LANGUAGES[key].name === selectedLanguage?.name,
        ) || "auto",
      autoDetectLanguage: autoDetectLanguage.toString(),
      title: params.get("title") || "untitled",
      width: params.get("width") || "auto",
      size: SIZE_LABELS[exportSize],
    });
    savePng();
  };

  const copyUrl = async () => {
    setFlashMessage({ icon: <ClipboardIcon />, message: "Copying URL" });

    const url = window.location.toString();
    let urlToCopy = url;

    const encodedUrl = encodeURIComponent(url);
    const response = await fetch(
      `/api/shorten-url?url=${encodedUrl}&ref=codeImage`,
    ).then((res) => res.json());

    if (response.link) {
      urlToCopy = response.link;
    }

    navigator.clipboard.writeText(urlToCopy);

    setFlashMessage({
      icon: <ClipboardIcon />,
      message: "URL Copied to clipboard!",
      timeout: 2000,
    });
  };

  useHotkeys("ctrl+k,cmd+k", (event) => {
    event.preventDefault();
    setDropdownOpen((open) => !open);
  });

  useHotkeys("ctrl+s,cmd+s", (event) => {
    event.preventDefault();
    savePng();
  });

  useHotkeys("ctrl+c,cmd+c", (event) => {
    if (pngClipboardSupported) {
      event.preventDefault();
      copyPng();
    }
  });

  useHotkeys("ctrl+shift+c,cmd+shift+c", (event) => {
    event.preventDefault();
    copyUrl();
  });

  useHotkeys("ctrl+shift+s,cmd+shift+s", (event) => {
    event.preventDefault();
    saveSvg();
  });

  return (
    <ButtonGroup>
      <Button
        onClick={handleExportClick}
        variant="primary"
        aria-label="Export as PNG"
      >
        <DownloadIcon className="w-4 h-4" />
        Export <span className="hidden md:inline-block">Image</span>
      </Button>
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={(open) => setDropdownOpen(open)}
      >
        <DropdownMenuTrigger className="size-9 border flex items-center justify-center">
          <ChevronDownIcon className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem onClick={dropdownHandler(savePng)}>
            <ImageIcon /> Save PNG{"\ "}
            <Kbds>
              <Kbd>⌘</Kbd>
              <Kbd>S</Kbd>
            </Kbds>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={dropdownHandler(saveSvg)}>
            <ImageIcon /> Save SVG
            <Kbds>
              <Kbd>⌘</Kbd>
              <Kbd>⇧</Kbd>
              <Kbd>S</Kbd>
            </Kbds>
          </DropdownMenuItem>
          {pngClipboardSupported && (
            <DropdownMenuItem onClick={dropdownHandler(copyPng)}>
              <ClipboardIcon /> Copy Image
              <Kbds>
                <Kbd>⌘</Kbd>
                <Kbd>C</Kbd>
              </Kbds>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={dropdownHandler(copyUrl)}>
            <LinkIcon /> Copy URL
            <Kbds>
              <Kbd>⌘</Kbd>
              <Kbd>⇧</Kbd>
              <Kbd>C</Kbd>
            </Kbds>
          </DropdownMenuItem>
          {showVideo && (
            <DropdownMenuItem
              onClick={dropdownHandler(saveVideo)}
              disabled={isRenderingVideo}
            >
              <VideoIcon /> {isRenderingVideo ? "Rendering…" : "Export Video"}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ArrowsExpandingIcon /> Size
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent sideOffset={8}>
              <DropdownMenuRadioGroup value={exportSize.toString()}>
                {EXPORT_SIZE_OPTIONS.map((size) => (
                  <DropdownMenuRadioItem
                    key={size}
                    value={size.toString()}
                    onSelect={() => setExportSize(size)}
                  >
                    {SIZE_LABELS[size]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
};

export default ExportButton;
