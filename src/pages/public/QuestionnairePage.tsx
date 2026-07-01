import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Heart, Wallet, MapPin, GraduationCap, ChevronRight, ChevronLeft, Sparkles, CheckCircle, Lock, ArrowRight } from 'lucide-react';
import CollegeCard from '@/components/cards/CollegeCard';
import { STREAMS, INTERESTS, BUDGET_RANGES, LOCATIONS, STUDY_LEVELS } from '@/constants';
import { recommendationService } from '@/services/api/recommendationService';
import { geminiService } from '@/services/geminiService';
import { useAuthStore } from '@/context/authStore';

interface Answers { stream: string; interests: string[]; budget: string; location: string; level: string; }

const steps = [
  { id: 'stream',    title: 'Preferred Stream',    subtitle: 'Which field excites you the most?',              icon: <BookOpen size={22} /> },
  { id: 'interests', title: 'Your Interests',       subtitle: 'What matters to you? (select all that apply)',   icon: <Heart size={22} /> },
  { id: 'budget',    title: 'Budget Range',          subtitle: 'What is your preferred fee range per year?',     icon: <Wallet size={22} /> },
  { id: 'location',  title: 'Preferred Location',   subtitle: 'Which region would you like to study in?',       icon: <MapPin size={22} /> },
  { id: 'level',     title: 'Study Level',           subtitle: 'Which level of study are you targeting?',        icon: <GraduationCap size={22} /> },
];

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ stream: '', interests: [], budget: '', location: '', level: '' });
  const [results, setResults] = useState<any[]>([]);
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const progress = ((step + 1) / steps.length) * 100;

  const handleSelect = (field: string, value: string) => {
    if (field === 'interests') {
      setAnswers(p => ({ ...p, interests: p.interests.includes(value) ? p.interests.filter(i => i !== value) : [...p.interests, value] }));
    } else {
      setAnswers(p => ({ ...p, [field]: value }));
    }
  };

  const canProceed = () => {
    const f = steps[step].id;
    return f === 'interests' ? answers.interests.length > 0 : (answers as any)[f] !== '';
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const [recs, ai] = await Promise.all([
        recommendationService.getByPreferences(answers),
        geminiService.getOnboardingSuggestion(answers),
      ]);
      setResults(recs);
      setAiInsight(ai.text || 'Based on your preferences, here are your top college matches.');
      setShowResults(true);
    } catch {
      setResults([]);
      setAiInsight('Here are some top colleges based on your choices.');
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const getOptions = () => {
    switch (steps[step].id) {
      case 'stream':    return STREAMS;
      case 'interests': return INTERESTS;
      case 'budget':    return BUDGET_RANGES.map(b => b.label);
      case 'location':  return LOCATIONS;
      case 'level':     return STUDY_LEVELS;
      default:          return [];
    }
  };

  const isSelected = (value: string) => {
    const f = steps[step].id;
    return f === 'interests' ? answers.interests.includes(value) : (answers as any)[f] === value;
  };

  // Auth gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#060612] px-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 flex items-center justify-center mx-auto mb-6 border border-[#6b5fff]/12">
            <Lock className="w-9 h-9 text-[#6b5fff]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 font-display">Sign in to get started</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Create a free account to take the AI questionnaire and get personalised college recommendations matched to your profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/register')} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white font-semibold shadow-lg shadow-[#6b5fff]/25 hover:-translate-y-px transition-all">
              Create Free Account <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/login')} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-[#1c1c35] text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              Sign In
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-[#fafafa] dark:bg-[#060612]">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6b5fff] to-[#8b5cf6] flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#6b5fff]/25">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 font-display">Your Recommendations</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">{aiInsight}</p>
          </motion.div>

          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No specific matches found. Try different preferences.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {results.map((c, i) => <CollegeCard key={c.id} college={c} index={i} matchScore={c.matchScore} />)}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => { setShowResults(false); setStep(0); setAnswers({ stream: '', interests: [], budget: '', location: '', level: '' }); }}
              className="px-6 py-3 rounded-xl border border-gray-200 dark:border-[#1c1c35] text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              Retake Questionnaire
            </button>
            <button onClick={() => navigate('/search')} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white text-sm font-semibold shadow-md shadow-[#6b5fff]/20 hover:-translate-y-px transition-all">
              Explore All Colleges
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Questionnaire screen
  return (
    <div className="min-h-screen pt-20 bg-[#fafafa] dark:bg-[#060612] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-2.5">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-[#1a1a2e] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          {/* Step dots */}
          <div className="flex items-center justify-between mt-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${i < step + 1 ? 'bg-[#6b5fff]' : 'bg-gray-200 dark:bg-[#1a1a2e]'}`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="bg-white dark:bg-[#0e0e20] rounded-3xl border border-gray-100 dark:border-[#1c1c35] p-8 shadow-xl shadow-black/4"
          >
            {/* Step header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6b5fff] to-[#8b5cf6] flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-[#6b5fff]/25">
                {steps[step].icon}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1.5 font-display">{steps[step].title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{steps[step].subtitle}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2.5 mb-8">
              {getOptions().map(option => (
                <button
                  key={option}
                  onClick={() => handleSelect(steps[step].id, option)}
                  className={`relative p-3.5 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                    isSelected(option)
                      ? 'border-[#6b5fff] bg-[#6b5fff]/6 dark:bg-[#6b5fff]/10 text-[#6b5fff] dark:text-[#a89fff]'
                      : 'border-gray-200 dark:border-[#1c1c35] text-gray-700 dark:text-gray-300 hover:border-[#6b5fff]/40 hover:bg-[#6b5fff]/3'
                  }`}
                >
                  {isSelected(option) && (
                    <CheckCircle size={14} className="absolute top-2.5 right-2.5 text-[#6b5fff]" />
                  )}
                  {option}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-gray-200 dark:border-[#1c1c35] text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-[#6b5fff]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={15} /> Back
              </button>

              {step < steps.length - 1 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={!canProceed()}
                  className="flex items-center gap-1.5 h-10 px-6 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white text-sm font-semibold shadow-md shadow-[#6b5fff]/20 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px transition-all"
                >
                  Continue <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || loading}
                  className="flex items-center gap-2 h-10 px-6 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white text-sm font-semibold shadow-md shadow-[#6b5fff]/20 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px transition-all"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <Sparkles size={15} />}
                  {loading ? 'Finding matches...' : 'Get My Recommendations'}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
