import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Award,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info,
  ChevronRight,
  Trophy
} from 'lucide-react';
import { api } from '../services/api';
import { Scenario, ScenarioAttemptResult } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';

export const SimulatorPage: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [attemptResult, setAttemptResult] = useState<ScenarioAttemptResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completedScenarios, setCompletedScenarios] = useState<Record<string, ScenarioAttemptResult>>({});
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api.getScenarios()
      .then((data) => {
        setScenarios(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const currentScenario = scenarios[currentIndex];

  const handleSelectOption = (optId: string) => {
    if (attemptResult) return; // Locked once answered
    setSelectedOption(optId);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !currentScenario) return;
    setIsSubmitting(true);
    try {
      const res = await api.submitScenarioAttempt(currentScenario.id, selectedOption);
      setAttemptResult(res);
      setCompletedScenarios(prev => ({ ...prev, [currentScenario.id]: res }));
      if (res.is_correct) {
        setScore(prev => prev + 100);
      }
    } catch {
      // Fallback local evaluation if offline
      const opt = currentScenario.options.find(o => o.id === selectedOption);
      if (opt) {
        const fallbackRes: ScenarioAttemptResult = {
          scenario_id: currentScenario.id,
          selected_option_id: selectedOption,
          is_correct: opt.is_safest,
          score: opt.is_safest ? 100 : 0,
          explanation: opt.explanation,
          learning_takeaway: currentScenario.learning_takeaway,
        };
        setAttemptResult(fallbackRes);
        setCompletedScenarios(prev => ({ ...prev, [currentScenario.id]: fallbackRes }));
        if (opt.is_safest) setScore(prev => prev + 100);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < scenarios.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setAttemptResult(null);
    } else {
      setShowSummary(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setAttemptResult(null);
    setCompletedScenarios({});
    setScore(0);
    setShowSummary(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <EmptyState
          title="No Simulation Scenarios Available"
          description="We could not load educational scenarios right now. Please verify the backend connection."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
            <Gamepad2 className="w-4 h-4" />
            <span>Interactive Cyber Defense Lab</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
              Score: <strong className="text-cyan-400">{score}</strong> pts
            </span>
            <button
              onClick={handleRestart}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              title="Restart Simulator"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Scam Awareness Simulator</h1>
        <p className="text-sm text-slate-400">
          Step into realistic threat scenarios. Evaluate deceptive messages, choose your defensive action, and learn the psychological hooks fraudsters exploit.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Scenario {currentIndex + 1} of {scenarios.length}</span>
          <span>{Math.round(((currentIndex) / scenarios.length) * 100)}% Complete</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / scenarios.length) * 100}%` }}
          />
        </div>
      </div>

      {showSummary ? (
        /* Summary Scorecard Screen */
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/60 text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="p-4 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 w-fit mx-auto">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">Simulation Completed!</h2>
            <p className="text-sm text-slate-400">
              You scored <strong className="text-cyan-300">{score}</strong> points out of {scenarios.length * 100} maximum points.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Total Scenarios</span>
              <span className="text-xl font-bold text-white">{scenarios.length}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Accuracy Rate</span>
              <span className="text-xl font-bold text-cyan-400">
                {Math.round((score / (scenarios.length * 100)) * 100)}%
              </span>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Simulator
            </button>
          </div>
        </div>
      ) : (
        /* Active Scenario Card */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
            {/* Meta Tags */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-cyan-400 border border-slate-700">
                  {currentScenario.category}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-850 text-slate-400">
                  Difficulty: {currentScenario.difficulty}
                </span>
              </div>
              <span className="text-xs text-amber-400/90 font-mono bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                Fictional Simulation Example
              </span>
            </div>

            <h3 className="text-lg font-bold text-white">{currentScenario.title}</h3>

            {/* Fictional Message Envelope */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 pb-2 border-b border-slate-900">
                From: <span className="text-slate-200 font-mono">{currentScenario.fictional_sender}</span>
              </div>
              <p className="text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                &ldquo;{currentScenario.fictional_message}&rdquo;
              </p>
            </div>

            {/* Question Prompt */}
            <div className="pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                Select the Safest Next Action:
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {currentScenario.options.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  let borderStyle = 'border-slate-800 hover:border-slate-700 bg-slate-950';

                  if (attemptResult) {
                    if (opt.is_safest) {
                      borderStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200';
                    } else if (isSelected && !opt.is_safest) {
                      borderStyle = 'border-red-500 bg-red-950/40 text-red-200';
                    } else {
                      borderStyle = 'border-slate-800/50 opacity-40 bg-slate-950';
                    }
                  } else if (isSelected) {
                    borderStyle = 'border-cyan-500 bg-cyan-950/50 text-white';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!!attemptResult}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${borderStyle}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {attemptResult && opt.is_safest ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : attemptResult && isSelected && !opt.is_safest ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-cyan-400 bg-cyan-500' : 'border-slate-600'}`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        )}
                      </div>
                      <span className="leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Answer Feedback / Explanation */}
            {attemptResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in duration-200 ${
                attemptResult.is_correct
                  ? 'border-emerald-700/60 bg-emerald-950/30 text-emerald-200'
                  : 'border-red-700/60 bg-red-950/30 text-red-200'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {attemptResult.is_correct ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>Safest Choice Selected! (+100 pts)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <span>High Risk Action Selected</span>
                    </>
                  )}
                </div>
                <p className="leading-relaxed text-slate-300">
                  {attemptResult.explanation}
                </p>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-start gap-1.5">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Key Takeaway:</strong> {attemptResult.learning_takeaway}</span>
                </div>
              </div>
            )}

            {/* Submit / Next Button */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              {!attemptResult ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption || isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-md disabled:opacity-50"
                >
                  Confirm Choice
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2"
                >
                  {currentIndex + 1 < scenarios.length ? 'Next Scenario' : 'View Summary'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
