import React from 'react';
import { Trash2, RotateCcw, AlertCircle } from 'lucide-react';

export default function Trash({ tasks, onRestore, onDeletePermanently, onEmptyTrash }) {
  const getDaysUntilDeletion = (deletedAt) => {
    if (!deletedAt) return 30;
    const deletionDate = new Date(deletedAt);
    deletionDate.setDate(deletionDate.getDate() + 30);
    const daysLeft = Math.ceil((deletionDate - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  if (tasks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-full mb-4">
          <Trash2 size={32} className="text-slate-400 dark:text-white/60" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Trash is empty</h3>
        <p className="text-slate-600 dark:text-white/70">Deleted tasks will be kept here for 30 days</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300 px-3 py-2 rounded-lg text-sm">
          <AlertCircle size={16} />
          <span>Items will be permanently deleted after 30 days</span>
        </div>
        {tasks.length > 0 && (
          <button
            onClick={onEmptyTrash}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
          >
            Empty Trash
          </button>
        )}
      </div>

      <div className="space-y-3">
        {tasks.map(task => {
          const daysLeft = getDaysUntilDeletion(task.deletedAt);
          
          return (
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
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 dark:text-white/50">
                    {task.deletedAt && (
                      <span>Deleted {new Date(task.deletedAt).toLocaleDateString()}</span>
                    )}
                    <span className={daysLeft <= 7 ? 'text-red-600 font-medium' : ''}>
                      {daysLeft === 0 ? 'Deleting today' : `${daysLeft} days left`}
                    </span>
                  </div>
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
                    onClick={() => onDeletePermanently(task.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
