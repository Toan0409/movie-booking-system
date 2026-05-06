import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Note: framer-motion nếu có, hoặc pure Tailwind
import ChatPopup from './ChatPopup';
// Note: Project chưa có framer-motion, dùng pure Tailwind + animate-*

const ChatWidget = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            {/* Floating Chat Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="fixed bottom-6 right-6 z-[9999] w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-orange-500 shadow-2xl shadow-red-500/25 hover:shadow-red-500/40 hover:from-red-700 hover:to-orange-600 focus:outline-none focus:shadow-red-500/50 transition-all duration-300 animate-pulse hover:animate-none border-4 border-white/20"
                onClick={() => setIsChatOpen(true)}
                aria-label="Mở chatbot"
            >
                <div className="relative p-1">
                    <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center animate-ping">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                    </div>
                </div>
            </motion.button>

            {/* Chat Popup */}
            <AnimatePresence>
                {isChatOpen && (
                    <ChatPopup
                        isOpen={isChatOpen}
                        onClose={() => setIsChatOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
