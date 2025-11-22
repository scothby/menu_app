
import React from 'react';
import { RestaurantDetails } from '../types';
import { MapPin, Star, ExternalLink, Search, Building2 } from 'lucide-react';

interface RestaurantCardProps {
  name: string;
  details: RestaurantDetails | null;
  isLoading: boolean;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ name, details, isLoading }) => {
  // If we aren't loading and have no name, don't show anything (automatic mode only)
  if (!name && !isLoading) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
      
      {/* Detective Background Effect */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="flex items-start gap-3 relative z-10">
        <div className="bg-blue-900/20 p-2.5 rounded-lg border border-blue-800/30 shrink-0">
          {isLoading ? (
             <Search className="w-6 h-6 text-blue-400 animate-pulse" />
          ) : (
             <MapPin className="w-6 h-6 text-blue-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col">
             <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-0.5">Restaurant Detective</span>
             <h3 className="text-lg font-bold text-white font-serif leading-tight flex items-center gap-2">
              {name}
              {details?.rating && (
                <span className="inline-flex items-center gap-1 text-sm bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/20 font-sans">
                  <Star className="w-3 h-3 fill-current" />
                  {details.rating}
                </span>
              )}
            </h3>
          </div>
          
          {isLoading ? (
            <div className="space-y-2 mt-2">
               <div className="h-3 w-3/4 bg-slate-800 rounded animate-pulse" />
               <div className="h-3 w-1/2 bg-slate-800 rounded animate-pulse" />
            </div>
          ) : details ? (
            <div className="mt-2">
               <p className="text-sm text-slate-300 leading-relaxed">
                 {details.summary || "Found on Google Maps."}
               </p>
               {details.mapLink && (
                 <a 
                   href={details.mapLink} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-2 transition-colors bg-blue-900/20 px-2 py-1 rounded border border-blue-800/30"
                 >
                   Open in Maps <ExternalLink className="w-3 h-3" />
                 </a>
               )}
               {!details.summary && !details.mapLink && (
                 <p className="text-xs text-slate-500 mt-1 italic">Location details currently unavailable.</p>
               )}
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2 text-slate-500 text-xs">
               <Building2 className="w-3 h-3" />
               <span>Searching for details...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
