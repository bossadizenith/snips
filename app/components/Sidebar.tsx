'use client'

import { useSnipsStore, Slide } from '@/app/store/useStore'
import { Trash2, GripVertical } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function Sidebar() {
  const { slides, currentSlideIndex, setCurrentSlideIndex, removeSlide } = useSnipsStore()

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black h-[calc(100vh-64px)] overflow-y-auto flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Slides ({slides.length})</h2>
      </div>

      <div className="flex flex-col gap-2">
        {slides.map((slide: Slide, index: number) => (
          <div
            key={slide.id}
            onClick={() => setCurrentSlideIndex(index)}
            className={cn(
              "group relative flex flex-col gap-2 p-3 rounded-lg border cursor-pointer transition-all",
              currentSlideIndex === index 
                ? "bg-zinc-50 border-black dark:bg-zinc-900 dark:border-white shadow-sm"
                : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900"
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-xs font-bold",
                currentSlideIndex === index ? "text-black dark:text-white" : "text-zinc-400"
              )}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeSlide(slide.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            <div className="h-20 w-full bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
               <span className="text-[10px] text-zinc-400 font-mono overflow-hidden whitespace-nowrap px-2">
                 {slide.code.slice(0, 30)}...
               </span>
            </div>
            
            <p className={cn(
              "text-xs font-medium truncate",
              currentSlideIndex === index ? "text-black dark:text-white" : "text-zinc-500"
            )}>
              {slide.title}
            </p>
          </div>
        ))}
      </div>
    </aside>
  )
}
