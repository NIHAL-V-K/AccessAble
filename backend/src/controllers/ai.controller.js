import { generateAIResponse } from "../services/ai.service.js";

export const chatWithAI = async (req, res, next) => {
    try {
        const { message, history = [] } = req.body;

        // Validate message
        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid message."
            });
        }

        // Validate conversation history
        if (!Array.isArray(history)) {
            return res.status(400).json({
                success: false,
                message: "Invalid conversation history."
            });
        }

        // Limit history to the latest 10 messages
        const recentHistory = history.slice(-10);

        // Generate AI response
        const response = await generateAIResponse(
            message.trim(),
            recentHistory
        );

        return res.status(200).json({
            success: true,
            message: "AI response generated successfully.",
            data: {
                reply: response
            }
        });

    } catch (error) {
        next(error);
    }
};