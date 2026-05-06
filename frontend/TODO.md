# Chatbot Frontend Refactor TODO

## Status: 🚀 In Progress

### ✅ 1. Planning & Analysis (Completed)
- [x] Analyzed ChatPopup.jsx, chatbotApi.js, backend controller/service
- [x] Created detailed refactor plan
- [x] Got user approval

### ⏳ 2. Update API Layer
- [ ] src/api/chatbotApi.js - Fix response parsing for ApiResponse<ChatResponseDTO>
- [ ] Add auth headers/user context if needed

### ⏳ 3. Refactor ChatPopup.jsx
- [ ] Add useAuth() check - show login prompt if not logged in
- [ ] Load initial history from backend on open
- [ ] Remove localStorage dependency (use backend history)
- [ ] Parse response.data.data.message/movies/history
- [ ] Handle 401 errors → redirect to login
- [ ] Keep UI/animations/loading states

### ⏳ 4. UI Components
- [ ] MessageBubble.jsx - Verify MovieResponseDTO compatibility
- [ ] ChatWidget.jsx - No changes needed

### ⏳ 5. Testing
- [ ] npm run dev
- [ ] Login → Open chat → Send messages → Verify history/movies
- [ ] Test unauth → Show login prompt
- [ ] browser_action verification

### ⏳ 6. Polish
- [ ] Infinite scroll for history (pageable)
- [ ] Error boundaries
- [ ] Mark complete

**Next Step:** Update chatbotApi.js
