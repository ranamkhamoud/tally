import React from 'react';
import { X, Keyboard } from 'lucide-react';

const shortcuts = [
  { key: 'N', description: 'Create new task' },
  { key: 'A', description: 'Show all active tasks' },
  { key: 'D', description: 'Show all done tasks' },
  { key: '⌘ U', description: 'Toggle Urgent (in task modal)' },
  { key: '⌘ I', description: 'Toggle Important (in task modal)' },
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: 'Esc', description: 'Close modal' },
];

export default function InfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" 
      onClick={onClose}
    >
      <div 
        className="
          bg-white dark:bg-[#1e1e1e]
          border border-slate-200 dark:border-white/[0.08]
          rounded-xl w-full max-w-sm
          shadow-xl dark:shadow-2xl
          overflow-hidden
        " 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-slate-600 dark:text-white/70" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="px-5 py-4 space-y-3">
          {shortcuts.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-white/70">{description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white/80 rounded border border-slate-200 dark:border-white/10">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06]">
          <p className="text-xs text-slate-500 dark:text-white/50 text-center">
            Press any key to close
          </p>
        </div>
      </div>
    </div>
  );
}
