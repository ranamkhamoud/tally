import React from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import Quadrant from './Quadrant';
import TaskCard from './TaskCard';
import useMatrixDnd from './useMatrixDnd';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const INITIAL_TASKS = [
  { id: 'todo-1', title: 'Re-enable archive & trash navigation buttons', description: 'Bottom-left nav icons are commented out in EisenhowerMatrix.js', priority: 'high', important: true, urgent: true, done: false },

  { id: 'todo-2', title: 'Preserve sort order when restoring tasks', description: 'Restored tasks should keep their sortOrder so they return to the correct position', priority: 'medium', important: true, urgent: false, done: false },

  { id: 'todo-3', title: 'Add confirmation dialog before emptying trash', description: '', priority: 'low', important: false, urgent: true, done: false },

  { id: 'todo-4', title: 'Empty trash tasks older than 30 days', description: 'Server-side scheduled job to permanently delete expired trash items', priority: 'low', important: false, urgent: false, done: false },
];

const noop = () => {};

export default function TodosMatrix() {
  const { theme, toggleTheme } = useTheme();

  const {
    items,
    activeTask,
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useMatrixDnd({
    initialItems: {
      'do-first': INITIAL_TASKS.filter(t => t.important && t.urgent),
      'schedule': INITIAL_TASKS.filter(t => t.important && !t.urgent),
      'delegate': INITIAL_TASKS.filter(t => !t.important && t.urgent),
      'eliminate': INITIAL_TASKS.filter(t => !t.important && !t.urgent),
    },
  });

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-white text-slate-900 dark:bg-[#1a1a1a] dark:text-white">
      <header className="fixed top-0 left-0 right-0 z-50 p-6 pointer-events-none">
        <div className="flex items-start justify-between">
          <div />
          <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
            <button
              onClick={toggleTheme}
              className="text-slate-900/90 hover:text-slate-900 dark:text-white/90 dark:hover:text-white transition-all hover:scale-110 active:scale-95"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-6 h-6 sm:w-7 sm:h-7" /> : <Moon className="w-6 h-6 sm:w-7 sm:h-7" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        <div className="h-full min-h-0 overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 mx-auto w-full px-4 sm:px-6 pt-16 sm:pt-14 pb-16 sm:pb-20 flex flex-col">
            <DndContext
              sensors={sensors}
              collisionDetection={collisionDetection}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="mx-auto w-full max-w-6xl flex-1 min-h-0 overflow-hidden flex flex-col">
                <div className="grid grid-cols-[48px,1fr] sm:grid-cols-[64px,1fr] md:grid-cols-[72px,1fr] grid-rows-[44px,1fr] sm:grid-rows-[56px,1fr] md:grid-rows-[64px,1fr] flex-1 min-h-0 gap-x-3 gap-y-3 sm:gap-x-5 sm:gap-y-5 md:gap-x-6 md:gap-y-6">
                  <div />
                  <div className="grid grid-cols-2 items-end">
                    <div className="text-center text-lg sm:text-2xl md:text-3xl font-medium tracking-tight text-slate-900 dark:text-white">Urgent</div>
                    <div className="text-center text-lg sm:text-2xl md:text-3xl font-medium tracking-tight text-slate-900 dark:text-white">Not Urgent</div>
                  </div>
                  <div className="grid grid-rows-2 items-center justify-center">
                    <div className="-rotate-90 text-lg sm:text-2xl md:text-3xl font-medium tracking-tight text-slate-900 dark:text-white">Important</div>
                    <div className="-rotate-90 text-lg sm:text-2xl md:text-3xl font-medium tracking-tight text-slate-900 dark:text-white">Not Important</div>
                  </div>
                  <div className="relative h-full min-h-0 overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-900/30 dark:bg-white/30" />
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-900/30 dark:bg-white/30" />
                    </div>
                    <div className="grid grid-cols-2 grid-rows-2 h-full min-h-0">
                      {['do-first', 'schedule', 'delegate', 'eliminate'].map(qId => (
                        <Quadrant
                          key={qId}
                          id={qId}
                          tasks={items[qId]}
                          onToggleDone={noop}
                          onEditTask={noop}
                          onDeleteTask={noop}
                          onArchiveTask={noop}
                          readOnly
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <DragOverlay dropAnimation={null}>
                {activeTask ? (
                  <div className="shadow-xl rounded-lg">
                    <TaskCard task={activeTask} onToggleDone={noop} onEdit={noop} onArchive={noop} onDelete={noop} readOnly />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
}
