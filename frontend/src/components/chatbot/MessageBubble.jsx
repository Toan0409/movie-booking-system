import React from 'react';
import { formatDistanceToNow } from 'date-fns'; // Có thể add sau nếu cần time
// Note: date-fns chưa có, dùng simple timestamp

const MessageBubble = ({ message, type }) => {
    const isUser = type === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 last:mb-0`}>
            <div
                className={`
          max-w-[85%] md:max-w-[75%] lg:max-w-[65%] p-4 rounded-2xl shadow-lg
          ${isUser
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-500/25'
                        : 'glass-card bg-white/8 border border-white/15 text-slate-100 backdrop-blur-xl shadow-black/20'
                    }
          hover:${isUser ? 'shadow-red-500/40' : 'shadow-white/10'}
          transition-all duration-200
        `}
            >
                <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.text}</p>

                {message.movies && message.movies.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                        {message.movies.map((movie, idx) => (
                            <div
                                key={idx}
                                className="group text-left rounded-xl overflow-hidden bg-white/10 border border-white/15 hover:border-red-500/50 hover:bg-white/20 transition-all duration-300 cursor-pointer p-2"
                            >
                                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 group-hover:scale-105 transition-transform">
                                    <img
                                        src={movie.posterUrl || movie.poster_path || `https://via.placeholder.com/120x180/333/fff?text=${movie.title?.slice(0, 3)}`}
                                        alt={movie.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <p className="text-xs mt-2 font-medium truncate text-white">{movie.title}</p>
                                <p className="text-xs text-slate-400 mt-1">{movie.genreName}</p>
                            </div>
                        ))}
                    </div>
                )}

                <p className={`text-xs mt-2 ${isUser ? 'text-red-200' : 'text-slate-400'}`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};

export default MessageBubble;
