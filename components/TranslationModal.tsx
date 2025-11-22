
import React, { useState } from 'react';
import { Dish, DishTranslation } from '../types';
import { X, Volume2, Globe, BookOpen, MapPin, Copy, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../services/translationService';

interface TranslationModalProps {
    isOpen: boolean;
    onClose: () => void;
    dish: Dish;
    targetLanguage: string;
}

const TranslationModal: React.FC<TranslationModalProps> = ({ isOpen, onClose, dish, targetLanguage }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    if (!isOpen || !dish.translation) return null;

    const translation = dish.translation;
    const originalLang = SUPPORTED_LANGUAGES.find(l => l.code === translation.detectedLanguage);
    const targetLang = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage);

    const handleCopyTranslation = () => {
        const text = `${translation.translatedName}\nPronunciation: ${translation.simplifiedPronunciation}\n\n${translation.culturalContext}`;
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handlePlayPronunciation = () => {
        if ('speechSynthesis' in window) {
            setIsPlayingAudio(true);
            const utterance = new SpeechSynthesisUtterance(dish.originalName || dish.name);
            utterance.lang = translation.detectedLanguage || 'en';
            utterance.rate = 0.8;
            utterance.onend = () => setIsPlayingAudio(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border-t sm:border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl md:max-w-3xl shadow-2xl flex flex-col h-full sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300 safe-bottom">

                {/* Header */}
                <div className="relative safe-top bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-4 sm:p-6 border-b border-slate-800">
                    <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe className="w-5 h-5 text-blue-400" />
                                <h2 className="text-lg sm:text-xl font-bold text-white">Translation & Cultural Context</h2>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400">Discover the story behind this dish</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="touch-target p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors active:scale-95 shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">

                    {/* Original & Translated Names */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Original */}
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <div className="flex items-center gap-2 mb-2">
                                {originalLang && <span className="text-2xl">{originalLang.flag}</span>}
                                <span className="text-xs text-slate-400 font-semibold uppercase">Original</span>
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-white font-serif">{dish.originalName || dish.name}</p>
                            {originalLang && (
                                <p className="text-xs text-slate-500 mt-1">{originalLang.name}</p>
                            )}
                        </div>

                        {/* Translated */}
                        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 rounded-xl border border-blue-700/30">
                            <div className="flex items-center gap-2 mb-2">
                                {targetLang && <span className="text-2xl">{targetLang.flag}</span>}
                                <span className="text-xs text-blue-400 font-semibold uppercase">Translation</span>
                            </div>
                            <p className="text-xl sm:text-2xl font-bold text-white font-serif">{translation.translatedName}</p>
                            {targetLang && (
                                <p className="text-xs text-blue-300/70 mt-1">{targetLang.name}</p>
                            )}
                        </div>
                    </div>

                    {/* Pronunciation */}
                    <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wide flex items-center gap-2">
                                <Volume2 className="w-4 h-4" />
                                Pronunciation
                            </h3>
                            <button
                                onClick={handlePlayPronunciation}
                                disabled={isPlayingAudio}
                                className="touch-target px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                            >
                                <Volume2 className="w-3.5 h-3.5" />
                                {isPlayingAudio ? 'Playing...' : 'Listen'}
                            </button>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Simple:</p>
                                <p className="text-lg sm:text-xl font-mono text-orange-300">{translation.simplifiedPronunciation}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-1">IPA (International Phonetic Alphabet):</p>
                                <p className="text-sm sm:text-base font-mono text-slate-400">{translation.pronunciation}</p>
                            </div>
                        </div>
                    </div>

                    {/* Cultural Context */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-4 rounded-xl border border-purple-700/30">
                        <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wide flex items-center gap-2 mb-3">
                            <BookOpen className="w-4 h-4" />
                            Cultural Context
                        </h3>
                        <div className="flex items-start gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-purple-300 font-semibold">Origin: {translation.originCountry}</p>
                        </div>
                        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">{translation.culturalContext}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleCopyTranslation}
                            className="flex-1 touch-target px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-2"
                        >
                            {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            {isCopied ? 'Copied!' : 'Copy Translation'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TranslationModal;
