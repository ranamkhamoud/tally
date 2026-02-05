import React, { useState, useEffect } from 'react';
import { X, Key, Copy, RefreshCw, Check, ExternalLink } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function ApiSettingsModal({ isOpen, onClose, userId, onOpenDocs }) {
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // Convex query and mutations
  const apiKey = useQuery(api.apiKeys.getApiKey);
  const createApiKey = useMutation(api.apiKeys.createApiKey);
  const regenerateApiKey = useMutation(api.apiKeys.regenerateApiKey);

  const loading = apiKey === undefined;

  // Create API key if it doesn't exist when modal opens
  useEffect(() => {
    if (isOpen && userId && apiKey === null) {
      createApiKey();
    }
  }, [isOpen, userId, apiKey, createApiKey]);

  async function handleRegenerate() {
    if (!confirm('Are you sure? This will invalidate your current API key.')) return;
    
    setRegenerating(true);
    try {
      await regenerateApiKey();
      setShowKey(true);
    } catch (error) {
      console.error('Error regenerating API key:', error);
    }
    setRegenerating(false);
  }

  function handleCopy() {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (!isOpen) return null;

  const maskedKey = apiKey ? `${apiKey.slice(0, 6)}${'*'.repeat(24)}${apiKey.slice(-4)}` : '';

  return (
    <div 
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" 
      onClick={onClose}
    >
      <div 
        className="
          bg-white dark:bg-[#1e1e1e]
          border border-slate-200 dark:border-white/[0.08]
          rounded-xl w-full max-w-lg
          shadow-xl dark:shadow-2xl
          overflow-hidden
        " 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-slate-600 dark:text-white/70" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              API Settings
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
              Your API Key
            </label>
            {loading ? (
              <div className="h-10 bg-slate-100 dark:bg-white/[0.04] rounded-lg animate-pulse" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg font-mono text-sm text-slate-700 dark:text-white/80 overflow-hidden">
                  <span className="select-all">{showKey ? apiKey : maskedKey}</span>
                </div>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08] rounded-lg transition-colors"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={handleCopy}
                  className="p-2 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08] rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Regenerate button */}
          <button
            onClick={handleRegenerate}
            disabled={regenerating || loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            Regenerate API Key
          </button>

          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06]">
            <p className="text-xs text-slate-500 dark:text-white/50 mb-3">
              Include your API key in the Authorization header:
            </p>
            <code className="block p-2 bg-slate-50 dark:bg-white/[0.04] rounded text-xs font-mono text-slate-600 dark:text-white/70">
              Authorization: Bearer {'<your-api-key>'}
            </code>
          </div>
        </div>

        <div className="flex justify-between items-center px-5 py-3 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06]">
          <button 
            onClick={() => { onClose(); onOpenDocs?.(); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Full Docs
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-white/60 dark:hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
