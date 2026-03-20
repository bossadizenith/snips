import React from "react";
import { useAtom } from "jotai";
import { showVideoPreviewAtom } from "@/store";
import { VideoIcon, ImageIcon } from "lucide-react";
import styles from "./Controls.module.css";
import classNames from "classnames";

const VideoToggle: React.FC = () => {
  const [showVideo, setShowVideo] = useAtom(showVideoPreviewAtom);

  return (
    <div className={styles.control}>
      <div className={styles.label}>Mode</div>
      <div className="flex bg-gray-3 rounded-lg p-0.5 border border-white/5">
        <button
          type="button"
          onClick={() => setShowVideo(false)}
          className={classNames(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            !showVideo ? "bg-gray-1 text-white shadow-sm" : "text-gray-9 hover:text-white"
          )}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Static
        </button>
        <button
          type="button"
          onClick={() => setShowVideo(true)}
          className={classNames(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
            showVideo ? "bg-gray-1 text-white shadow-sm" : "text-gray-9 hover:text-white"
          )}
        >
          <VideoIcon className="w-3.5 h-3.5" />
          Video
        </button>
      </div>
    </div>
  );
};

export default VideoToggle;
