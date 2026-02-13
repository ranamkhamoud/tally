import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, Pencil, Trash2, Archive } from 'lucide-react';

export default function TaskCard({ task, onToggleDone, onEdit, onDelete, onArchive, readOnly = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today && !task.done;
  };

  const priorityConfig = {
    high: { label: 'H', color: 'text-red-500 dark:text-red-400' },
    medium: { label: 'M', color: 'text-amber-500 dark:text-amber-400' },
    low: { label: 'L', color: 'text-green-500 dark:text-green-400' }
  };

  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group/card
        bg-slate-50/80 dark:bg-white/[0.04]
        border border-slate-200/60 dark:border-white/[0.06]
        rounded-lg px-3 py-2.5 cursor-grab active:cursor-grabbing
        transition-all duration-150
        hover:bg-slate-100/80 dark:hover:bg-white/[0.07]
        hover:border-slate-300/60 dark:hover:border-white/[0.10]
        ${isDragging ? 'opacity-30' : ''}
        ${task.done && !isDragging ? 'opacity-50' : ''}
      `}
    >
      {/* Title row */}
      <div className="flex items-start gap-2.5">
        {!readOnly && (
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => onToggleDone(task.id)}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 mt-0.5 accent-slate-900 dark:accent-white border-slate-300 dark:border-white/30 rounded cursor-pointer flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p
            className={`
              text-sm font-medium leading-snug
              ${task.done ? 'line-through text-slate-400 dark:text-white/30' : 'text-slate-800 dark:text-white/90'}
            `}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="hidden sm:block text-xs text-slate-500 dark:text-white/50 mt-0.5 line-clamp-1">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Meta + actions */}
      <div className={`mt-2 ${readOnly ? 'pl-0' : 'pl-6'} flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2`}>
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {task.priority && (
            <span className={`text-[10px] font-bold uppercase tracking-wide ${priority.color}`}>
              {priority.label}
            </span>
          )}

          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] ${
                isOverdue(task.dueDate)
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-slate-400 dark:text-white/40'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Actions - visible on hover (desktop) or always (mobile) */}
        {!readOnly && (
          <div className="flex flex-nowrap justify-end sm:ml-auto gap-0.5 opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              className="p-1.5 sm:p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/40 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10 rounded transition-all hover:scale-110 active:scale-95"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onArchive(task.id); }}
              className="p-1.5 sm:p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/40 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10 rounded transition-all hover:scale-110 active:scale-95"
              title="Archive"
            >
              <Archive className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="p-1.5 sm:p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 dark:text-white/40 dark:hover:text-red-400 dark:hover:bg-red-500/10 rounded transition-all hover:scale-110 active:scale-95"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
