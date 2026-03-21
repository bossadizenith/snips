import { cn } from "@/lib/utils";
import { showVideoPreviewAtom } from "@/store";
import { useAtom } from "jotai";
import { ImageIcon, VideoIcon } from "lucide-react";
import React from "react";
import ControlContainer from "./ControlContainer";

const VideoToggle: React.FC = () => {
  const [showVideo, setShowVideo] = useAtom(showVideoPreviewAtom);

  return (
    <ControlContainer title="Mode">
      <div className="flex bg-gray-3 rounded-lg p-0.5 border border-white/5">
        <button
          type="button"
          onClick={() => setShowVideo(false)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            !showVideo
              ? "bg-gray-1 text-white shadow-sm"
              : "text-gray-9 hover:text-white",
          )}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Static
        </button>
        <button
          type="button"
          onClick={() => setShowVideo(true)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            showVideo
              ? "bg-gray-1 text-white shadow-sm"
              : "text-gray-9 hover:text-white",
          )}
        >
          <VideoIcon className="w-3.5 h-3.5" />
          Video
        </button>
      </div>
    </ControlContainer>
  );
};

export default VideoToggle;
