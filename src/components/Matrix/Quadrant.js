import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { ChevronDown } from 'lucide-react';

const quadrantConfig = {
  'do-first': {
    title: 'Do',
    subtitle: 'Important & Urgent',
    emptyMessage: 'Do it now!',
  },
  'schedule': {
    title: 'Decide',
    subtitle: 'Important & Not Urgent',
    emptyMessage: 'Schedule a time to do it.',
  },
  'delegate': {
    title: 'Delegate',
    subtitle: 'Not Important & Urgent',
    emptyMessage: 'Who can do it for you?',
  },
  'eliminate': {
    title: 'Delete',
    subtitle: 'Not Important & Not Urgent',
    emptyMessage: 'Stop doing it.',
  }
};

export default function Quadrant({ 
  id, 
  tasks, 
  onToggleDone, 
  onEditTask, 
  onDeleteTask,
  onArchiveTask,
  globalFilter,
  onClearGlobalFilter,
  readOnly = false
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: id
  });

  const config = quadrantConfig[id];
  const [localTab, setLocalTab] = useState('active');
  const scrollRef = useRef(null);
  const [canScroll, setCanScroll] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const activeTab = globalFilter || localTab;

  const handleTabClick = (tab) => {
    if (globalFilter) {
      onClearGlobalFilter?.();
    }
    setLocalTab(tab);
  };

  const activeTasks = tasks.filter(t => !t.done);
  const completedTasks = tasks.filter(t => t.done);
  const displayedTasks = readOnly ? tasks : (activeTab === 'active' ? activeTasks : completedTasks);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const hasOverflow = el.scrollHeight > el.clientHeight;
      setCanScroll(hasOverflow);
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 10;
      setIsAtBottom(atBottom);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      const resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(el);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        resizeObserver.disconnect();
      };
    }
  }, [checkScroll, displayedTasks]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div 
      ref={setNodeRef}
      className={`group flex flex-col h-full min-h-0 overflow-hidden p-1.5 sm:p-2 md:p-3 ${isOver ? 'bg-slate-900/[0.04] dark:bg-white/[0.04]' : ''}`}
    >
      {/* Tabs */}
      {!readOnly && (
        <div className="flex items-center gap-1 mb-1.5 px-0.5">
          <button
            onClick={() => handleTabClick('active')}
            className={`
              px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded transition-colors
              ${activeTab === 'active' 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                : 'text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white/70'}
            `}
          >
            Active {activeTasks.length > 0 && `(${activeTasks.length})`}
          </button>
          <button
            onClick={() => handleTabClick('completed')}
            className={`
              px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded transition-colors
              ${activeTab === 'completed' 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                : 'text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white/70'}
            `}
          >
            Done {completedTasks.length > 0 && `(${completedTasks.length})`}
          </button>
        </div>
      )}

      {/* Task list with scroll indicator */}
      <div className="relative flex-1 min-h-0">
        <SortableContext 
          items={displayedTasks.map(t => t.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div 
            ref={scrollRef}
            className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin pr-1"
          >
            {displayedTasks.length === 0 ? (
              <div
                className={`
                  flex items-center justify-center h-full text-center font-medium text-slate-900/40 dark:text-white/40
                  text-sm sm:text-base md:text-lg
                  px-2
                  ${isOver ? 'opacity-100' : ''}
                `}
              >
                <span className="max-w-[14ch] sm:max-w-none">
                  {activeTab === 'completed' ? 'No completed tasks' : config?.emptyMessage ?? ''}
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {displayedTasks.map(task => (
                  <div key={task.id} className="group">
                    <TaskCard
                      task={task}
                      onToggleDone={onToggleDone}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onArchive={onArchiveTask}
                      readOnly={readOnly}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </SortableContext>

        {canScroll && !isAtBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-0 left-0 right-1 h-8 flex items-end justify-center pb-1 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#1a1a1a] dark:via-[#1a1a1a]/80 cursor-pointer transition-opacity hover:opacity-80"
            aria-label="Scroll down"
          >
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-white/40" />
          </button>
        )}
      </div>
    </div>
  );
}
