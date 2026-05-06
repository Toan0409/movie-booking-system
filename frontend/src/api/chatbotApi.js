import axiosClient from './axiosClient';

const chatbotApi = {
    async sendMessage(message) {
        try {
            const response = await axiosClient.post('/chatbot/chat', {
                message: message.trim()
            });

            // Parse Spring Boot ApiResponse<ChatResponseDTO>
            const data = response.data.data;
            if (!data) {
                throw new Error('Invalid response format from backend');
            }

            return {
                reply: data.message || 'Xin lỗi, tôi chưa hiểu câu hỏi của bạn.',
                movies: data.movies || [],
                history: data.history || []
            };
        } catch (error) {
            console.error('Chatbot API error:', error);

            // Handle specific HTTP errors
            if (error.response?.status === 401) {
                throw new Error('Vui lòng đăng nhập để sử dụng chatbot');
            }
            if (error.response?.status === 403) {
                throw new Error('Không có quyền truy cập chatbot');
            }

            throw new Error('Không thể kết nối chatbot. Vui lòng thử lại.');
        }
    }
};

export default chatbotApi;
