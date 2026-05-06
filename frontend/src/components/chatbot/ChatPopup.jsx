import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import chatbotApi from '../../api/chatbotApi';
import MessageBubble from './MessageBubble';

const ChatPopup = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Show welcome or login prompt on open
    useEffect(() => {
        if (isOpen) {
            if (user) {
                setMessages([{
                    type: 'bot',
                    text: 'Chào bạn! 🎬 Tôi là Movie Assistant. Hỏi tôi về:\n• Gợi ý phim hành động\n• Phim tình cảm\n• Phim hot đang chiếu\n• Top phim...',
                    movies: [],
                    createdAt: new Date().toISOString()
                }]);
            } else {
                setMessages([{
                    type: 'bot',
                    text: '🔐 Vui lòng đăng nhập để sử dụng chatbot.',
                    movies: [],
                    createdAt: new Date().toISOString()
                }]);
            }
            inputRef.current?.focus();
        }
    }, [isOpen, user]);

    // No localStorage - use backend history

    // Auto-scroll
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading, scrollToBottom]);

    // Remove loadHistory - history loads with first response

    const sendMessage = async () => {
        if (!user) return; // Auth check

        const text = input.trim();
        if (!text || loading) return;

        const userMessage = {
            type: 'user',
            text,
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await chatbotApi.sendMessage(text);
            const botMessage = {
                type: 'bot',
                text: response.reply,
                movies: response.movies,
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            let errorText = '🤖 Có lỗi xảy ra. Vui lòng thử lại.';
            if (error.message.includes('đăng nhập')) {
                errorText = '🔐 Vui lòng đăng nhập lại để tiếp tục chat.';
            } else if (error.message.includes('quyền')) {
                errorText = '❌ Không có quyền truy cập chatbot.';
            }

            const errorMessage = {
                type: 'bot',
                text: errorText,
                movies: [],
                createdAt: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        if (user) {
            setMessages([{
                type: 'bot',
                text: 'Đã làm mới chat! 🎬 Hỏi tôi phim gì nào?',
                movies: [],
                createdAt: new Date().toISOString()
            }]);
        } else {
            setMessages([{
                type: 'bot',
                text: '🔐 Vui lòng đăng nhập để sử dụng chatbot.',
                movies: [],
                createdAt: new Date().toISOString()
            }]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-end sm:justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in slide-in-from-right-4 duration-300 fade-in">
            {/* Overlay */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* Popup Container */}
            <div className="glass-card w-full max-w-md h-[85vh] sm:h-[75vh] max-h-[600px] flex flex-col relative shadow-2xl shadow-black/30 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-5 pb-3 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                                Movie Assistant
                            </h3>
                            <p className="text-xs text-slate-400">Gợi ý phim thông minh 🎥</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <button
                                onClick={clearChat}
                                className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105"
                                title="Làm mới chat"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        ) : (
                            <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-xs font-medium text-yellow-100">
                                Đăng nhập
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105"
                            title="Đóng"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 pb-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-600/50 scrollbar-track-white/5">
                    {messages.map((message, index) => (
                        <MessageBubble
                            key={`${message.createdAt}-${index}`}
                            message={message}
                            type={message.type}
                        />
                    ))}

                    {loading && (
                        <div className="flex justify-start">
                            <div className="glass-card p-4 rounded-2xl text-sm text-slate-300 flex items-center gap-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </div>
                                <span>Đang suy nghĩ...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 pt-2 border-t border-white/10">
                    <div className="flex items-end gap-3">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={user ? "Nhập câu hỏi về phim... (Enter để gửi)" : "🔐 Đăng nhập để chat..."}
                            className="flex-1 max-h-24 resize-none rounded-2xl px-4 py-3 bg-white/10 border border-white/15 outline-none focus:border-red-500/70 focus:bg-white/15 placeholder:text-slate-400 text-sm leading-relaxed transition-all duration-200"
                            disabled={loading || !user}
                            rows={1}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="group shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 text-center">
                        Hỗ trợ gợi ý phim theo thể loại, xu hướng, thời gian chiếu
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatPopup;
