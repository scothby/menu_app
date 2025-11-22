
import React, { useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../services/translationService';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
    currentLanguage: string;
    onLanguageChange: (languageCode: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

    return (
        <div className="relative">
            {/* Trigger Button - Compact: only globe icon and language code */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 px-1 py-1 hover:bg-slate-800/50 rounded transition-colors"
                title="Change Language"
            >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase">{currentLang.code}</span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2 border-b border-slate-800">
                            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide px-2">Select Language</p>
                        </div>

                        <div className="max-h-80 overflow-y-auto custom-scrollbar p-1">
                            {SUPPORTED_LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        onLanguageChange(lang.code);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-left ${currentLanguage === lang.code
                                            ? 'bg-blue-600/20 text-blue-300'
                                            : 'hover:bg-slate-800 text-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-xl">{lang.flag}</span>
                                        <span className="text-sm font-medium">{lang.name}</span>
                                    </div>
                                    {currentLanguage === lang.code && (
                                        <Check className="w-4 h-4 text-blue-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSelector;
