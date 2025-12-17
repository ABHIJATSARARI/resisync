import React, { useState, useRef } from 'react';
import { Trip } from '../types';

interface DocumentWalletProps {
  trips: Trip[];
  onClose: () => void;
  onAttachDocument: (tripId: string, file: File) => void;
}

const DocumentWallet: React.FC<DocumentWalletProps> = ({ trips, onClose, onAttachDocument }) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter trips that have documents
  const docs = trips.filter(t => t.document);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setPendingFile(e.target.files[0]);
        setUploadMode(true);
    }
  };

  const handleTripSelect = (tripId: string) => {
    if (pendingFile) {
        onAttachDocument(tripId, pendingFile);
        // Reset state
        setPendingFile(null);
        setUploadMode(false);
        // Select the new doc immediately
        setSelectedDocId(tripId);
    }
  };

  const cancelUpload = () => {
    setUploadMode(false);
    setPendingFile(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row h-[600px] relative">
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-black rounded-full text-slate-500 hover:text-red-500 transition-colors backdrop-blur-sm"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        {/* Sidebar / List */}
        <div className="w-full md:w-1/3 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        {uploadMode ? 'Select Trip' : 'Travel Wallet'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{uploadMode ? 'Attach file to:' : 'Secure Digital Vault'}</p>
                </div>
                {!uploadMode && (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/40 rounded-lg transition-colors"
                        title="Upload Document"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    </button>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={handleFileSelect}
                />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {uploadMode ? (
                    <>
                        <div className="bg-brand-50 dark:bg-brand-900/10 p-3 rounded-xl border border-brand-100 dark:border-brand-800/50 mb-4">
                            <span className="text-xs font-bold text-brand-700 dark:text-brand-300 block mb-1">Pending Upload:</span>
                            <span className="text-xs text-slate-600 dark:text-slate-400 truncate block">{pendingFile?.name}</span>
                            <button onClick={cancelUpload} className="text-[10px] text-red-500 hover:text-red-600 underline mt-2">Cancel</button>
                        </div>
                        {trips.length === 0 && <p className="text-sm text-slate-500 text-center">No trips available to attach.</p>}
                        {trips.map(trip => (
                            <div 
                                key={trip.id}
                                onClick={() => handleTripSelect(trip.id)}
                                className="p-3 rounded-xl cursor-pointer border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all flex items-center gap-3"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-lg">
                                    {trip.countryCode ? <img src={`https://flagcdn.com/w40/${trip.countryCode.toLowerCase()}.png`} className="w-full h-full object-cover rounded-lg" alt="" /> : '✈️'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold truncate text-slate-700 dark:text-slate-200">{trip.country}</h4>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{trip.startDate} - {trip.endDate}</p>
                                </div>
                                {trip.document && <span className="text-[10px] text-orange-500 font-bold" title="Will overwrite existing doc">Overwrite</span>}
                            </div>
                        ))}
                    </>
                ) : (
                    docs.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            <p className="text-sm">No documents found.</p>
                            <p className="text-xs">Click + to add a file.</p>
                        </div>
                    ) : (
                        docs.map(trip => (
                            <div 
                                key={trip.id}
                                onClick={() => setSelectedDocId(trip.id)}
                                className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 flex items-center gap-3 group ${
                                    selectedDocId === trip.id 
                                    ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 ring-1 ring-brand-500' 
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${selectedDocId === trip.id ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-500'}`}>
                                    {trip.document?.name.endsWith('.pdf') ? '📄' : '🖼️'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-bold truncate ${selectedDocId === trip.id ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {trip.document?.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{trip.country} • {trip.startDate}</p>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>

        {/* Main Preview Area */}
        <div className="w-full md:w-2/3 bg-slate-100 dark:bg-slate-950/50 p-8 flex items-center justify-center relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

            {selectedDocId && !uploadMode ? (
                <div className="relative w-full max-w-md aspect-[3/4] md:aspect-[1.586/1] perspective-1000 group">
                    {/* The "Card" */}
                    <div className="relative w-full h-full transition-transform duration-700 transform-style-3d group-hover:rotate-y-3">
                         {/* Card Face */}
                         <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col text-white">
                            
                            {/* Card Header */}
                            <div className="h-16 bg-white/5 border-b border-white/10 flex justify-between items-center px-6 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                     <span className="text-xs font-mono text-brand-300 uppercase tracking-widest">Digital Pass</span>
                                </div>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="flex-1 p-6 flex flex-col justify-between relative">
                                {/* Watermark */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                                    <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.75l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"></path></svg>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Document Name</p>
                                        <p className="font-heading text-xl font-bold tracking-tight">{docs.find(d => d.id === selectedDocId)?.document?.name}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Issuing Country</p>
                                            <p className="font-mono text-sm">{docs.find(d => d.id === selectedDocId)?.country}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Date</p>
                                            <p className="font-mono text-sm">{docs.find(d => d.id === selectedDocId)?.startDate}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 pt-4 border-t border-white/10 flex justify-between items-end">
                                    <div className="h-12 w-12 bg-white p-1 rounded-lg">
                                        {/* Mock QR Code */}
                                        <div className="w-full h-full bg-slate-900 flex flex-wrap content-start">
                                            {[...Array(16)].map((_, i) => (
                                                <div key={i} className={`w-1/4 h-1/4 ${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}></div>
                                            ))}
                                        </div>
                                    </div>
                                    <button className="text-xs bg-white text-slate-900 px-3 py-1.5 rounded font-bold hover:bg-brand-50 transition-colors">
                                        Download / View
                                    </button>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            ) : (
                <div className="text-center text-slate-400">
                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl mx-auto mb-4 rotate-3 flex items-center justify-center">
                        {uploadMode ? (
                            <svg className="w-8 h-8 opacity-50 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        ) : (
                            <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        )}
                    </div>
                    <p className="text-lg font-medium">{uploadMode ? 'Select a trip on the left' : 'Select a document to view'}</p>
                    {uploadMode && <p className="text-sm">to attach {pendingFile?.name}</p>}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DocumentWallet;