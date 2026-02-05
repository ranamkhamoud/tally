import React, { useEffect, useState } from 'react';
import { X, MessageSquare, Tag } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, onSubmit, userEmail }) {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setMessage('');
    setCategory('general');
    setError('');
    setSent(false);
    setLoading(false);
  }, [isOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setError('');
      setLoading(true);
      await onSubmit({
        message: message.trim(),
        category,
      });
      setSent(true);
      setTimeout(() => onClose(), 700);
    } catch (err) {
      setError('Failed to send feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white/95 dark:bg-white/[0.06] backdrop-blur-xl border border-slate-900/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/70 dark:border-white/10">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-slate-500 dark:text-white/70" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Feedback</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-white rounded-lg transition-colors"
            aria-label="Close"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {userEmail && (
              <p className="text-xs text-slate-500 dark:text-white/60">
                Sending as <span className="font-medium text-slate-900 dark:text-white">{userEmail}</span>
              </p>
            )}

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 border border-red-100 dark:border-red-500/20">
                {error}
              </div>
            )}

            {sent && (
              <div className="px-4 py-3 rounded-lg text-sm bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-500/20">
                Thanks — your feedback was sent.
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-slate-900 dark:text-white">
                Category
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/70 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/10 rounded-lg focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-200 dark:focus-within:border-white/20 dark:focus-within:ring-white/10 transition-all">
                <Tag size={18} className="text-slate-400 dark:text-white/60 flex-shrink-0" />
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 outline-none text-sm text-slate-900 dark:text-white bg-transparent cursor-pointer"
                >
                  <option value="general">General</option>
                  <option value="bug">Bug</option>
                  <option value="feature">Feature request</option>
                  <option value="ui">UI / Design</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium text-slate-900 dark:text-white">
                Message
              </label>
              <div className="flex items-start gap-3 px-4 py-3 bg-slate-50/70 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/10 rounded-lg focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-200 dark:focus-within:border-white/20 dark:focus-within:ring-white/10 transition-all">
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what we can improve..."
                  rows={5}
                  className="flex-1 outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 resize-vertical bg-transparent"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-white/50">
                Please avoid sharing passwords or sensitive data.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200/70 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-white/80 dark:hover:bg-white/10 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-white/90 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading || !message.trim()}
            >
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

