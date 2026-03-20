'use client'

import { useSnipsStore } from '@/app/store/useStore'
import { useEffect, useState } from 'react'

export function Editor() {
  const { slides, currentSlideIndex, updateSlide } = useSnipsStore()
  const currentSlide = slides[currentSlideIndex]

  if (!currentSlide) return null

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-black p-6 overflow-hidden">
      <div className="flex flex-col gap-6 h-full max-w-4xl mx-auto w-full">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={currentSlide.title}
            onChange={(e) => updateSlide(currentSlide.id, { title: e.target.value })}
            className="text-4xl font-bold bg-transparent border-none outline-none text-black dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-800"
            placeholder="Untitled Slide"
          />
        </div>

        <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden min-h-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="mx-auto text-[10px] font-mono text-zinc-400 tracking-widest uppercase">
              Editor
            </div>
          </div>
          
          <textarea
            value={currentSlide.code}
            onChange={(e) => updateSlide(currentSlide.id, { code: e.target.value })}
            className="flex-1 p-6 font-mono text-sm resize-none bg-transparent border-none outline-none text-zinc-800 dark:text-zinc-200 leading-relaxed"
            style={{ fontSize: `${useSnipsStore.getState().fontSize}px` }}
            spellCheck={false}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
           <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Notes</label>
           <textarea
             value={currentSlide.notes || ''}
             onChange={(e) => updateSlide(currentSlide.id, { notes: e.target.value })}
             className="w-full h-24 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm italic text-zinc-500 dark:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all resize-none"
             placeholder="Add some notes for this slide..."
           />
        </div>
      </div>
    </div>
  )
}
