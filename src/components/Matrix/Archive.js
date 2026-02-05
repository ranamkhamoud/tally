import React from 'react';
import { Archive as ArchiveIcon, RotateCcw, Trash2 } from 'lucide-react';

export default function Archive({ tasks, onRestore, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-full mb-4">
          <ArchiveIcon size={32} className="text-slate-400 dark:text-white/60" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No archived tasks</h3>
        <p className="text-slate-600 dark:text-white/70">Tasks you archive will appear here</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-6">
      <div className="space-y-3">
        {tasks.map(task => (
          <div
            key={task.id}
            className="bg-white/80 dark:bg-white/[0.06] border border-slate-900/10 dark:border-white/10 rounded-lg p-4 hover:bg-white dark:hover:bg-white/[0.10] transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 dark:text-white mb-1 truncate">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-slate-600 dark:text-white/70 line-clamp-2">{task.description}</p>
                )}
                {task.archivedAt && (
                  <p className="text-xs text-slate-400 dark:text-white/50 mt-2">
                    Archived {new Date(task.archivedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => onRestore(task.id)}
                  className="p-2 text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-white/10 rounded-lg transition-colors"
                  title="Restore task"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete permanently"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
