import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSave, task, defaultQuadrant }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    important: false,
    urgent: false,
    done: false
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate || '',
        priority: task.priority || 'medium',
        important: task.important || false,
        urgent: task.urgent || false,
        done: task.done || false
      });
    } else if (defaultQuadrant) {
      setFormData(prev => ({
        ...prev,
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        done: false,
        important: defaultQuadrant.important,
        urgent: defaultQuadrant.urgent
      }));
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        important: false,
        urgent: false,
        done: false
      });
    }
  }, [task, defaultQuadrant, isOpen]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        setFormData(prev => ({ ...prev, urgent: !prev.urgent }));
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        setFormData(prev => ({ ...prev, important: !prev.important }));
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSave({
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim()
    });
    onClose();
  };

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
          rounded-xl w-full max-w-md
          shadow-xl dark:shadow-2xl
          overflow-hidden
        " 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 space-y-4">
            {/* Title */}
            <div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Task title"
                required
                autoFocus
                className="
                  w-full px-3 py-2.5
                  bg-slate-50 dark:bg-white/[0.04]
                  border border-slate-200 dark:border-white/[0.08]
                  rounded-lg text-sm
                  text-slate-900 dark:text-white
                  placeholder-slate-400 dark:placeholder-white/30
                  focus:outline-none focus:border-slate-400 dark:focus:border-white/20
                  transition-colors
                "
              />
            </div>

            {/* Description */}
            <div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description (optional)"
                rows={2}
                className="
                  w-full px-3 py-2.5
                  bg-slate-50 dark:bg-white/[0.04]
                  border border-slate-200 dark:border-white/[0.08]
                  rounded-lg text-sm
                  text-slate-900 dark:text-white
                  placeholder-slate-400 dark:placeholder-white/30
                  focus:outline-none focus:border-slate-400 dark:focus:border-white/20
                  transition-colors resize-none
                "
              />
            </div>

            {/* Due Date & Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="
                    w-full px-3 py-2
                    bg-slate-50 dark:bg-white/[0.04]
                    border border-slate-200 dark:border-white/[0.08]
                    rounded-lg text-sm
                    text-slate-900 dark:text-white
                    focus:outline-none focus:border-slate-400 dark:focus:border-white/20
                    transition-colors
                  "
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="
                    w-full px-3 py-2
                    bg-slate-50 dark:bg-white/[0.04]
                    border border-slate-200 dark:border-white/[0.08]
                    rounded-lg text-sm
                    text-slate-900 dark:text-white
                    focus:outline-none focus:border-slate-400 dark:focus:border-white/20
                    transition-colors cursor-pointer
                  "
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Important / Urgent checkboxes */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="important"
                  checked={formData.important}
                  onChange={handleChange}
                  className="w-4 h-4 accent-slate-900 dark:accent-white rounded cursor-pointer"
                />
                <span className="text-sm text-slate-700 dark:text-white/70">Important</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="urgent"
                  checked={formData.urgent}
                  onChange={handleChange}
                  className="w-4 h-4 accent-slate-900 dark:accent-white rounded cursor-pointer"
                />
                <span className="text-sm text-slate-700 dark:text-white/70">Urgent</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-5 py-3 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06]">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="
                px-4 py-2 text-sm font-medium rounded-lg transition-colors
                bg-slate-900 text-white hover:bg-slate-800
                dark:bg-white dark:text-slate-900 dark:hover:bg-white/90
              "
            >
              {task ? 'Save' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
