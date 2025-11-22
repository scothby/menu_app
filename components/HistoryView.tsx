
import React from 'react';
import { HistorySession } from '../types';
import { Clock, Trash2, ChevronRight, Utensils, Activity, Calendar, ArrowLeft } from 'lucide-react';

interface HistoryViewProps {
  sessions: HistorySession[];
  onSelectSession: (session: HistorySession) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onBack: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ sessions, onSelectSession, onDeleteSession, onBack }) => {
  
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(new Date(timestamp));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 pb-24">
      <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-2 bg-slate-900 rounded-full hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Foodie Passport
            </h2>
            <p className="text-slate-400 text-sm">Your culinary history</p>
          </div>
        </div>

        {/* List */}
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
            <Clock className="w-20 h-20 mb-4 text-slate-700" />
            <h3 className="text-xl font-bold text-slate-500">No History Yet</h3>
            <p className="text-slate-600">Scan a menu to start your journey.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div 
                key={session.id}
                onClick={() => onSelectSession(session)}
                className="group bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                    session.mode === 'VISUALIZER' 
                      ? 'bg-orange-900/20 border-orange-800 text-orange-500' 
                      : 'bg-emerald-900/20 border-emerald-800 text-emerald-500'
                  }`}>
                    {session.mode === 'VISUALIZER' ? <Utensils className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-slate-200 group-hover:text-white transition-colors">
                      {session.summary}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center text-xs text-slate-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(session.timestamp)}
                      </span>
                      <span className="text-xs text-slate-600 px-2 py-0.5 bg-slate-950 rounded-full border border-slate-800">
                        {session.items.length} items
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-900/10 rounded-full transition-colors z-10"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
