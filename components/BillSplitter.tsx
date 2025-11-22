
import React, { useState, useEffect, useMemo } from 'react';
import { Dish } from '../types';
import { X, Plus, User, Trash2, DollarSign, Users, Split, Check, Edit2, Sparkles, Receipt } from 'lucide-react';

interface BillSplitterProps {
  isOpen: boolean;
  onClose: () => void;
  dishes: Dish[];
}

interface BillItem {
  id: string;
  name: string;
  price: number;
  originalPriceString: string;
  assignedTo: string[]; // Array of Person IDs
}

interface Person {
  id: string;
  name: string;
  color: string;
  gradient: string;
}

const PERSON_STYLES = [
  { color: 'bg-blue-500', gradient: 'from-blue-500 to-cyan-500' },
  { color: 'bg-emerald-500', gradient: 'from-emerald-500 to-teal-500' },
  { color: 'bg-purple-500', gradient: 'from-purple-500 to-pink-500' },
  { color: 'bg-orange-500', gradient: 'from-orange-500 to-red-500' },
  { color: 'bg-pink-500', gradient: 'from-pink-500 to-rose-500' },
  { color: 'bg-cyan-500', gradient: 'from-cyan-500 to-blue-500' },
  { color: 'bg-yellow-500', gradient: 'from-yellow-500 to-orange-500' },
  { color: 'bg-red-500', gradient: 'from-red-500 to-pink-500' }
];

const BillSplitter: React.FC<BillSplitterProps> = ({ isOpen, onClose, dishes }) => {
  const [items, setItems] = useState<BillItem[]>([]);
  const [people, setPeople] = useState<Person[]>([
    { id: 'p1', name: 'Me', ...PERSON_STYLES[0] }
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [tipRate, setTipRate] = useState(15);
  const [newPersonName, setNewPersonName] = useState('');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>('p1');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState('');

  // Initialize items from dishes when opened
  useEffect(() => {
    if (isOpen && dishes.length > 0) {
      const billItems = dishes
        .map((d) => {
          const priceStr = d.price || d.convertedPrice || '0';
          return {
            id: d.id,
            name: d.name,
            originalPriceString: priceStr,
            price: parsePrice(priceStr),
            assignedTo: [] as string[]
          };
        })
        .filter(i => true);

      setItems(billItems);
    }
  }, [isOpen, dishes]);

  const parsePrice = (priceStr: string): number => {
    if (!priceStr) return 0;
    const clean = priceStr.replace(/[^0-9.,]/g, '');
    const normalized = clean.replace(',', '.');
    const match = normalized.match(/(\d+\.?\d*)/);
    const val = match ? parseFloat(match[0]) : 0;
    return isNaN(val) ? 0 : val;
  };

  const addPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;
    const newPerson: Person = {
      id: `p-${Date.now()}`,
      name: newPersonName,
      ...PERSON_STYLES[people.length % PERSON_STYLES.length]
    };
    setPeople([...people, newPerson]);
    setNewPersonName('');
    setSelectedPersonId(newPerson.id);
  };

  const toggleAssignment = (itemId: string) => {
    if (!selectedPersonId) return;

    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const isAssigned = item.assignedTo.includes(selectedPersonId);
        let newAssigned;
        if (isAssigned) {
          newAssigned = item.assignedTo.filter(id => id !== selectedPersonId);
        } else {
          newAssigned = [...item.assignedTo, selectedPersonId];
        }
        return { ...item, assignedTo: newAssigned };
      }
      return item;
    }));
  };

  const removePerson = (personId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (people.length <= 1) return;
    setPeople(prev => prev.filter(p => p.id !== personId));

    setItems(prev => prev.map(item => ({
      ...item,
      assignedTo: item.assignedTo.filter(id => id !== personId)
    })));

    if (selectedPersonId === personId) {
      setSelectedPersonId(people[0].id);
    }
  };

  const handlePriceEdit = (item: BillItem) => {
    setEditingItemId(item.id);
    setEditPriceVal(item.price.toString());
  };

  const savePriceEdit = (itemId: string) => {
    const newPrice = parseFloat(editPriceVal);
    if (!isNaN(newPrice)) {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, price: newPrice } : i));
    }
    setEditingItemId(null);
  };

  // Calculations
  const totals = useMemo(() => {
    const personTotals: Record<string, { subtotal: number, tax: number, tip: number, total: number }> = {};

    people.forEach(p => {
      personTotals[p.id] = { subtotal: 0, tax: 0, tip: 0, total: 0 };
    });

    items.forEach(item => {
      if (item.assignedTo.length > 0) {
        const splitPrice = item.price / item.assignedTo.length;
        item.assignedTo.forEach(pid => {
          if (personTotals[pid]) {
            personTotals[pid].subtotal += splitPrice;
          }
        });
      }
    });

    let grandTotal = 0;
    people.forEach(p => {
      const stats = personTotals[p.id];
      stats.tax = stats.subtotal * (taxRate / 100);
      stats.tip = stats.subtotal * (tipRate / 100);
      stats.total = stats.subtotal + stats.tax + stats.tip;
      grandTotal += stats.total;
    });

    return { personTotals, grandTotal };
  }, [items, people, taxRate, tipRate]);

  const selectedPerson = people.find(p => p.id === selectedPersonId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/20 rounded-2xl w-full max-w-4xl shadow-2xl shadow-emerald-500/10 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-500 relative">

        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Header */}
        <div className="relative p-4 border-b border-emerald-500/20 bg-slate-950/50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 p-2 rounded-xl shadow-lg shadow-emerald-500/30">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Bill Splitter</h2>
                <p className="text-xs text-emerald-400/60 font-medium">Split your bill with friends ✨</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 rounded-xl transition-all duration-300 text-slate-400 hover:text-red-400 hover:scale-110 hover:rotate-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

          {/* LEFT: People & Items */}
          <div className="flex-1 flex flex-col min-w-0 relative">

            {/* People Selector */}
            <div className="p-3 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl border-b border-emerald-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Select Person</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {people.map(person => (
                  <div
                    key={person.id}
                    onClick={() => setSelectedPersonId(person.id)}
                    className={`relative group cursor-pointer transition-all duration-300 ${selectedPersonId === person.id ? 'scale-105' : 'hover:scale-105'
                      }`}
                  >
                    <div className={`relative px-3 py-2 rounded-xl border-2 transition-all duration-300 ${selectedPersonId === person.id
                      ? `bg-gradient-to-r ${person.gradient} border-white/30 shadow-lg shadow-${person.color}/50`
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${person.gradient} flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
                          {person.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className={`text-xs font-bold whitespace-nowrap ${selectedPersonId === person.id ? 'text-white' : 'text-slate-300'
                          }`}>
                          {person.name}
                        </span>
                        {people.length > 1 && (
                          <button
                            onClick={(e) => removePerson(person.id, e)}
                            className="ml-1 p-0.5 hover:bg-red-500/30 rounded-full text-slate-500 hover:text-red-400 transition-all duration-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    {selectedPersonId === person.id && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    )}
                  </div>
                ))}

                <form onSubmit={addPerson} className="flex items-center shrink-0">
                  <input
                    type="text"
                    placeholder="Add person..."
                    className="bg-slate-800/80 backdrop-blur-sm border border-emerald-500/30 rounded-l-xl py-2 px-3 text-xs text-white w-28 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-600 transition-all duration-300"
                    value={newPersonName}
                    onChange={e => setNewPersonName(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white p-2 rounded-r-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  Tap items to assign to {selectedPerson?.name || 'selected person'}
                </p>
              </div>

              {items.map(item => {
                const isAssignedToSelected = selectedPersonId && item.assignedTo.includes(selectedPersonId);

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleAssignment(item.id)}
                    className={`group relative p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer select-none ${isAssignedToSelected
                      ? `bg-gradient-to-r ${selectedPerson?.gradient} border-white/30 shadow-lg shadow-${selectedPerson?.color}/30 scale-[1.01]`
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800/70'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 mr-2">
                        <div className={`text-sm font-bold truncate ${isAssignedToSelected ? 'text-white' : 'text-slate-200'}`}>
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {editingItemId === item.id ? (
                            <div className="flex items-center" onClick={e => e.stopPropagation()}>
                              <input
                                type="number"
                                value={editPriceVal}
                                onChange={e => setEditPriceVal(e.target.value)}
                                className="w-20 bg-slate-900/80 text-white text-xs p-1.5 rounded-lg border border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                autoFocus
                                onBlur={() => savePriceEdit(item.id)}
                                onKeyDown={e => e.key === 'Enter' && savePriceEdit(item.id)}
                              />
                            </div>
                          ) : (
                            <div className={`flex items-center gap-1.5 text-base font-black ${isAssignedToSelected ? 'text-white' : 'text-emerald-400'}`}>
                              <DollarSign className="w-3.5 h-3.5" />
                              {item.price > 0 ? item.price.toFixed(2) : '---'}
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePriceEdit(item); }}
                                className={`p-1 rounded-lg transition-all duration-200 ${isAssignedToSelected ? 'hover:bg-white/20' : 'hover:bg-slate-700'
                                  }`}
                                title="Edit Price"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Avatars */}
                      <div className="flex -space-x-2">
                        {item.assignedTo.map(pid => {
                          const person = people.find(p => p.id === pid);
                          if (!person) return null;
                          return (
                            <div
                              key={pid}
                              className={`w-7 h-7 rounded-full bg-gradient-to-br ${person.gradient} border-2 border-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform hover:scale-110`}
                            >
                              {person.name.substring(0, 1)}
                            </div>
                          );
                        })}
                        {item.assignedTo.length === 0 && (
                          <span className="text-[10px] text-slate-600 italic px-2 py-1 bg-slate-900/50 rounded-full">Unassigned</span>
                        )}
                      </div>
                    </div>

                    {isAssignedToSelected && (
                      <div className="absolute top-1.5 right-1.5">
                        <Check className="w-4 h-4 text-white animate-in zoom-in duration-300" />
                      </div>
                    )}
                  </div>
                );
              })}

              {items.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Receipt className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-500 text-sm font-medium">No items to split</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Totals & Settings */}
          <div className="w-full lg:w-80 bg-gradient-to-br from-slate-950/95 to-slate-900/95 backdrop-blur-xl p-4 flex flex-col border-l border-emerald-500/10 relative">

            {/* Tax & Tip */}
            <div className="space-y-4 mb-6">
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <label className="flex justify-between text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3" />
                    Tax Rate
                  </span>
                  <span className="text-white text-base">{taxRate}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
                />
              </div>

              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <label className="flex justify-between text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Tip
                  </span>
                  <span className="text-white text-base">{tipRate}%</span>
                </label>
                <div className="flex gap-1.5">
                  {[0, 10, 15, 18, 20].map(rate => (
                    <button
                      key={rate}
                      onClick={() => setTipRate(rate)}
                      className={`flex-1 py-2 text-xs rounded-lg font-bold transition-all duration-300 ${tipRate === rate
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
                        }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Per Person Summary */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              <h3 className="text-xs font-bold text-white border-b border-emerald-500/20 pb-2 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-emerald-400" />
                Per Person Breakdown
              </h3>
              {people.map(person => {
                const stats = totals.personTotals[person.id];
                return (
                  <div
                    key={person.id}
                    className="p-3 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl border border-slate-700 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${person.gradient} shadow-lg`} />
                        <span className="text-xs font-bold text-slate-300">{person.name}</span>
                      </div>
                      <div className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${person.gradient}`}>
                        ${stats.total.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono flex justify-between">
                      <span>Sub: ${stats.subtotal.toFixed(2)}</span>
                      <span>Tax: ${stats.tax.toFixed(2)}</span>
                      <span>Tip: ${stats.tip.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grand Total */}
            <div className="pt-4 border-t border-emerald-500/20">
              <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 p-4 rounded-xl border border-emerald-500/30 backdrop-blur-xl">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-0.5">Grand Total</span>
                    <span className="text-slate-400 text-xs font-medium">{people.length} {people.length === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse">
                    ${totals.grandTotal.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BillSplitter;
