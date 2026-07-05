import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Megaphone, X as XIcon } from 'lucide-react';
import { audio } from './AudioEngine';
import { appConfig } from '../config';
import { SOCIAL_TASK_DEFS, completeSocialTask, loadSocialTasks } from '../socialTasks';

function buildPostCaIntent() {
  const ca = appConfig.token.contractAddress;
  const text = `$BALLS CA: ${ca}\n\nPlay the idle game 👉 https://www.bullballs.fun`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

function buildShillIntent() {
  const text = `Rescue the degens from Pumpfun Purgatory 🐂⚾\n\nPlay BULL BALLS 👉 https://www.bullballs.fun\n\n${appConfig.token.symbol} ${appConfig.token.contractAddress}`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

export default function SocialTasksPanel({ onBonusChange }) {
  const [tasksState, setTasksState] = useState(() => loadSocialTasks());
  const [draftUrls, setDraftUrls] = useState({});
  const [errors, setErrors] = useState({});
  const [copiedCa, setCopiedCa] = useState(false);
  const [dismissed, setDismissed] = useState({});

  const tokenCa = appConfig.token.contractAddress;
  const allDone = SOCIAL_TASK_DEFS.every((task) => tasksState.completed[task.id]);

  const handleCopyCa = async () => {
    await navigator.clipboard.writeText(tokenCa);
    setCopiedCa(true);
    audio.playCoin();
    setTimeout(() => setCopiedCa(false), 2000);
  };

  const handleVerify = (taskId) => {
    audio.playTap();
    const url = draftUrls[taskId] || '';
    const result = completeSocialTask(taskId, url);

    if (!result.ok) {
      setErrors((prev) => ({ ...prev, [taskId]: result.error }));
      audio.playExplosion();
      return;
    }

    const nextState = loadSocialTasks();
    setTasksState(nextState);
    setErrors((prev) => ({ ...prev, [taskId]: '' }));
    setDraftUrls((prev) => ({ ...prev, [taskId]: '' }));
    audio.playPowerup();
    onBonusChange?.(result.bonusRate);
  };

  if (allDone) {
    return (
      <div className="retro-panel retro-panel-green bg-[#0a0a0c]/95 border-4 border-gray-700 rounded p-4 mb-6">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-retro-green" />
          <span className="font-arcade text-[10px] text-retro-green uppercase tracking-wider">
            Social boosts active — max USD rate bonus applied
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2 px-1">
        <Megaphone className="w-4 h-4 text-retro-pink" />
        <span className="font-arcade text-[10px] text-gray-500 uppercase tracking-wider">
          Shill Tasks — small USD rate boost
        </span>
      </div>

      {SOCIAL_TASK_DEFS.map((task) => {
        if (dismissed[task.id]) return null;

        const completed = Boolean(tasksState.completed[task.id]);
        const postIntent = task.id === 'post_ca' ? buildPostCaIntent() : buildShillIntent();

        return (
          <div
            key={task.id}
            className="retro-panel retro-panel-pink bg-[#121216]/95 border-4 border-gray-700 rounded p-4 relative"
          >
            <button
              type="button"
              onClick={() => setDismissed((prev) => ({ ...prev, [task.id]: true }))}
              className="absolute top-3 right-3 text-gray-600 hover:text-retro-pink transition-colors"
              aria-label="Dismiss task"
            >
              <XIcon className="w-4 h-4" />
            </button>

            <h3 className="font-arcade text-[11px] text-white uppercase tracking-wide pr-8">
              {task.title}
            </h3>
            <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
              {task.description}{' '}
              <span className="text-retro-green font-arcade">{task.bonusLabel}</span>
            </p>

            {task.id === 'post_ca' && (
              <div className="mt-3 bg-black/50 border border-gray-800 rounded p-3 flex items-center gap-2">
                <code className="flex-1 font-mono text-[9px] text-retro-green break-all">{tokenCa}</code>
                <button
                  type="button"
                  onClick={handleCopyCa}
                  className="text-gray-500 hover:text-retro-blue shrink-0"
                  title="Copy contract address"
                >
                  {copiedCa ? <Check className="w-3.5 h-3.5 text-retro-green" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {task.id === 'post_shill' && (
              <div className="mt-3 bg-black/50 border border-gray-800 rounded p-3">
                <a
                  href="https://www.bullballs.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] text-retro-blue hover:text-retro-green break-all"
                >
                  https://www.bullballs.fun
                </a>
              </div>
            )}

            {completed ? (
              <div className="mt-3 flex items-center gap-2 text-[9px] font-arcade text-retro-green">
                <Check className="w-3.5 h-3.5" />
                VERIFIED · {task.bonusLabel} active
              </div>
            ) : (
              <>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={draftUrls[task.id] || ''}
                    onChange={(e) => {
                      setDraftUrls((prev) => ({ ...prev, [task.id]: e.target.value }));
                      setErrors((prev) => ({ ...prev, [task.id]: '' }));
                    }}
                    placeholder="https://x.com/yourhandle/status/123..."
                    className="flex-1 bg-black/60 border-2 border-gray-800 rounded px-3 py-2 font-mono text-[10px] text-gray-300 placeholder:text-gray-600 focus:border-retro-pink focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerify(task.id)}
                    className="retro-btn btn-green text-[10px] py-2 px-4 !translate-y-0 shrink-0"
                  >
                    VERIFY
                  </button>
                </div>

                {errors[task.id] && (
                  <p className="mt-2 text-[9px] font-arcade text-retro-red">{errors[task.id]}</p>
                )}

                <a
                  href={postIntent}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-[9px] font-arcade text-retro-blue hover:text-retro-green uppercase"
                >
                  Post on X
                  <ExternalLink className="w-3 h-3" />
                </a>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
