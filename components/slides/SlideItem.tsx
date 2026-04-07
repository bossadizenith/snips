"use client";

import type { Slide } from "@/store";
import {
  deleteSlideAtom,
  duplicateSlideAtom,
  renameSlideAtom,
  selectSlideAtom,
} from "@/store/slide";
import { useSetAtom } from "jotai";
import { Copy, GripVertical, Pencil, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import styles from "./slides.module.css";
import classNames from "classnames";

interface SlideItemProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  isDragging: boolean;
  totalSlides: number;
  dragControls: {
    onPointerDown: (e: React.PointerEvent) => void;
  };
}

export const SlideItem: React.FC<SlideItemProps> = ({
  slide,
  index,
  isActive,
  isDragging,
  totalSlides,
  dragControls,
}) => {
  const selectSlide = useSetAtom(selectSlideAtom);
  const deleteSlide = useSetAtom(deleteSlideAtom);
  const duplicateSlide = useSetAtom(duplicateSlideAtom);
  const renameSlide = useSetAtom(renameSlideAtom);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(slide.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const startRename = useCallback(() => {
    setRenameValue(slide.title);
    setIsRenaming(true);
  }, [slide.title]);

  const commitRename = useCallback(() => {
    setIsRenaming(false);
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== slide.title) {
      renameSlide({ slideId: slide.id, title: trimmed });
    }
  }, [renameValue, slide.id, slide.title, renameSlide]);

  const cancelRename = useCallback(() => {
    setIsRenaming(false);
    setRenameValue(slide.title);
  }, [slide.title]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitRename();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelRename();
    }
  };

  const handleClick = () => {
    if (!isRenaming) {
      selectSlide(slide.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    startRename();
  };

  const canDelete = totalSlides > 1;

  const itemContent = (
    <div
      className={classNames(styles.slideItem, {
        [styles.slideItemActive]: isActive,
        [styles.slideItemDragging]: isDragging,
      })}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className={styles.dragHandle}
        onPointerDown={dragControls.onPointerDown}
      >
        <GripVertical className="size-3" />
      </div>

      <span className={styles.slideIndex}>{index + 1}</span>

      {isRenaming ? (
        <input
          ref={inputRef}
          className={styles.renameInput}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitRename}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className={styles.slideTitle}>
          {slide.title || `Slide ${index + 1}`}
        </span>
      )}
    </div>
  );

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger
        render={(props) => (
          <div
            {...props}
            onContextMenu={(e) => {
              e.preventDefault();
              setMenuOpen(true);
            }}
          />
        )}
      >
        {itemContent}
      </DropdownMenuTrigger>

      <DropdownMenuContent side="left" sideOffset={8} align="start">
        <DropdownMenuItem
          onClick={() => {
            startRename();
            setMenuOpen(false);
          }}
        >
          <Pencil className="size-3.5" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            duplicateSlide(slide.id);
            setMenuOpen(false);
          }}
        >
          <Copy className="size-3.5" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={!canDelete}
          onClick={() => {
            if (canDelete) {
              deleteSlide(slide.id);
              setMenuOpen(false);
            }
          }}
        >
          <Trash2 className="size-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
