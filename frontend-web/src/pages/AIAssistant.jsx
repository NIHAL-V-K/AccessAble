import { useState, useRef, useEffect } from "react";
import BackToDashboard from "../components/BackToDashboard";

import {
  Send,
  Bot,
  User,
  Sparkles,
  Plus,
  MessageSquare,
  Trash2,
  BookOpen,
  Lightbulb,
  GraduationCap,
  Volume2,
  Accessibility,
  Clock,
  X,
  Mic,
  MicOff,
  Settings
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import "./AIAssistant.css";
import AccessibilitySettings from "../components/AccessibilitySettings";

const STORAGE_KEY = "accessable_ai_conversations";
const SETTINGS_KEY = "accessable_accessibility_settings";

const DEFAULT_SETTINGS = {
  fontSize: "medium",
  highContrast: false,
  dyslexiaFont: false,
  textSpacing: false,
  readAloud: true
};

const welcomeMessage = {
  role: "assistant",
  text: "Hello! Welcome to AccessAble AI. 🌿\n\nI'm here to make your learning journey easier. You can ask me questions, explore concepts, or get help understanding your lessons.\n\nWhat would you like to learn today?",
};

const createId = () =>
  window.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createConversation = () => ({
  id: createId(),
  title: "New conversation",
  messages: [{ ...welcomeMessage }],
  updatedAt: Date.now(),
});

function loadConversations() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Unable to load chat history:", error);
  }

  return [createConversation()];
}

function loadAccessibilitySettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);

    if (saved) {
      return {
        ...DEFAULT_SETTINGS,
        ...JSON.parse(saved)
      };
    }
  } catch (error) {
    console.error("Unable to load accessibility settings:", error);
  }

  return { ...DEFAULT_SETTINGS };
}

function AIAssistant() {
  const [conversations, setConversations] = useState(loadConversations);

  const [activeConversationId, setActiveConversationId] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      return saved[0]?.id || null;
    } catch {
      return null;
    }
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // ACCESSIBILITY SETTINGS
  const [settings, setSettings] = useState(loadAccessibilitySettings);
  const [showAccessibilitySettings, setShowAccessibilitySettings] =
    useState(false);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  const activeConversation =
    conversations.find(
      (conversation) => conversation.id === activeConversationId
    ) || conversations[0];

  const messages = activeConversation?.messages || [
    { ...welcomeMessage }
  ];

  // SET INITIAL ACTIVE CONVERSATION
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [activeConversationId, conversations]);

  // AUTOMATICALLY SAVE CHAT HISTORY
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(conversations)
    );
  }, [conversations]);

  // SAVE ACCESSIBILITY SETTINGS
  useEffect(() => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );
  }, [settings]);

  // SCROLL TO LATEST MESSAGE
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, loading]);

  // CLEAN UP VOICE RECOGNITION AND SPEECH
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // SUGGESTED PROMPTS
  const suggestions = [
    {
      icon: BookOpen,
      title: "Explain a concept",
      text: "Explain machine learning in simple words"
    },
    {
      icon: Lightbulb,
      title: "Study tips",
      text: "Give me some effective study tips"
    },
    {
      icon: GraduationCap,
      title: "Programming help",
      text: "What is the difference between HTML and CSS?"
    }
  ];

  // UPDATE CURRENT CONVERSATION
  const updateCurrentConversation = (updatedMessages, title = null) => {
    if (!activeConversationId) return;

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === activeConversationId
          ? {
              ...conversation,
              messages: updatedMessages,
              title: title || conversation.title,
              updatedAt: Date.now(),
            }
          : conversation
      )
    );
  };

  // FIND JWT TOKEN SAVED AFTER LOGIN
  const getAuthToken = () => {
    const values = [
      ...Object.values(localStorage),
      ...Object.values(sessionStorage)
    ];

    return values.find(
      (value) =>
        typeof value === "string" &&
        /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)
    );
  };

  // SEND MESSAGE TO OPENAI BACKEND
  const handleSend = async (text = input) => {
    const question = text.trim();

    if (!question || loading || !activeConversation) return;

    const currentId = activeConversation.id;
    const previousMessages = activeConversation.messages || [];

    const updatedMessages = [
      ...previousMessages,
      { role: "user", text: question }
    ];

    const conversationTitle =
      previousMessages.length <= 1
        ? question.length > 28
          ? question.slice(0, 28) + "..."
          : question
        : activeConversation.title;

    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === currentId
          ? {
              ...conversation,
              messages: updatedMessages,
              title: conversationTitle,
              updatedAt: Date.now()
            }
          : conversation
      )
    );

    setInput("");
    setLoading(true);

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error(
          "Your login session could not be found. Please log out and log in again."
        );
      }

      // SEND PREVIOUS CHAT MESSAGES AS CONTEXT
      const history = previousMessages
        .filter(
          (message) =>
            (message.role === "user" ||
              message.role === "assistant") &&
            message.text &&
            message.text !== welcomeMessage.text
        )
        .slice(-10)
        .map((message) => ({
          role: message.role,
          content: message.text
        }));

      // CALL BACKEND AI API
      const response = await fetch(
        "http://localhost:5000/api/v1/ai/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            message: question,
            history
          })
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || `AI request failed (${response.status}).`
        );
      }

      // EXTRACT AI RESPONSE
      const answer =
        result.data?.response ||
        result.data?.reply ||
        result.data?.content ||
        result.response ||
        result.reply ||
        (typeof result.data === "string" ? result.data : "") ||
        "";

      if (!answer) {
        throw new Error(
          "The AI service responded, but no answer was found in the response."
        );
      }

      // DISPLAY AI RESPONSE
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === currentId
            ? {
                ...conversation,
                messages: [
                  ...conversation.messages,
                  { role: "assistant", text: answer }
                ],
                updatedAt: Date.now()
              }
            : conversation
        )
      );

    } catch (error) {
      console.error("AccessAble AI request failed:", error);

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === currentId
            ? {
                ...conversation,
                messages: [
                  ...conversation.messages,
                  {
                    role: "assistant",
                    text: `I'm sorry, I couldn't generate a response. ${error.message} Please try again.`
                  }
                ],
                updatedAt: Date.now()
              }
            : conversation
        )
      );

    } finally {
      setLoading(false);
    }
  };

  // CREATE NEW CONVERSATION
  const createNewConversation = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    setIsListening(false);

    const newConversation = createConversation();

    setConversations((previous) => [
      newConversation,
      ...previous
    ]);

    setActiveConversationId(newConversation.id);
    setInput("");
    setLoading(false);

    window.speechSynthesis?.cancel();
  };

  // OPEN PREVIOUS CONVERSATION
  const openConversation = (id) => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    setIsListening(false);
    setActiveConversationId(id);
    setInput("");
    setLoading(false);

    window.speechSynthesis?.cancel();
  };

  // CLEAR CURRENT CONVERSATION
  const clearChat = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    setIsListening(false);

    updateCurrentConversation(
      [
        {
          role: "assistant",
          text: "Hello again! 🌿 What would you like to learn today?"
        }
      ],
      "New conversation"
    );

    setInput("");
    setLoading(false);

    window.speechSynthesis?.cancel();
  };

  // DELETE INDIVIDUAL CONVERSATION
  const deleteConversation = (event, id) => {
    event.stopPropagation();

    const remaining = conversations.filter(
      (conversation) => conversation.id !== id
    );

    if (remaining.length === 0) {
      const freshConversation = createConversation();

      setConversations([freshConversation]);
      setActiveConversationId(freshConversation.id);
      return;
    }

    setConversations(remaining);

    if (activeConversationId === id) {
      setActiveConversationId(remaining[0].id);
    }
  };

  // TEXT TO SPEECH
  const speakMessage = (text) => {
    if (!("speechSynthesis" in window)) {
      alert("Text to Speech is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.rate = 0.9;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  // VOICE INPUT
  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use a supported version of Chrome or Edge."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    recognitionRef.current?.stop();

    const recognition = new SpeechRecognition();

    recognitionRef.current = recognition;

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript;
      }

      setInput(transcript.trim());
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);

      setIsListening(false);

      if (event.error === "not-allowed") {
        alert(
          "Microphone access was denied. Please allow microphone access in your browser settings."
        );
      } else if (event.error === "no-speech") {
        console.log("No speech detected. Please try again.");
      } else if (event.error === "network") {
        alert(
          "A network error occurred during voice recognition. Please check your internet connection."
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Unable to start voice recognition:", error);
      setIsListening(false);
    }
  };

  // ACCESSIBILITY CLASS NAMES
  const accessibilityClasses = [
    "ai-page",
    `font-${settings.fontSize}`,
    settings.highContrast ? "high-contrast" : "",
    settings.dyslexiaFont ? "dyslexia-font" : "",
    settings.textSpacing ? "wide-spacing" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={accessibilityClasses}>

      {/* SIDEBAR */}

      <aside className="ai-sidebar">

        {/* BRAND */}

        <div className="ai-brand">
          <div className="ai-brand-icon">
            <Accessibility size={25} />
          </div>

          <span>access<span>able</span></span>
        </div>

        {/* NEW CONVERSATION */}

        <button
          className="ai-new-chat"
          onClick={createNewConversation}
        >
          <Plus size={19} />
          New conversation
        </button>

        {/* NAVIGATION */}

        <div className="ai-sidebar-heading">
          YOUR SPACE
        </div>

        <div className="ai-sidebar-item active">
          <MessageSquare size={19} />
          AI Assistant
        </div>


        {/* ACCESSIBILITY SETTINGS */}

        <button
          className="ai-sidebar-item"
          onClick={() => setShowAccessibilitySettings(true)}
          type="button"
        >
          <Settings size={19} />
          Accessibility Settings
        </button>

        {/* CHAT HISTORY */}

        <div className="ai-history-section">

          <div className="ai-history-heading">
            <span>RECENT CONVERSATIONS</span>
            <Clock size={15} />
          </div>

          <div className="ai-history-list">

            {conversations.map((conversation) => (

              <div
                key={conversation.id}
                className={`ai-history-item ${
                  activeConversationId === conversation.id
                    ? "selected"
                    : ""
                }`}
              >

                <button
                  className="ai-history-open"
                  onClick={() => openConversation(conversation.id)}
                  title={conversation.title}
                >
                  <MessageSquare size={15} />

                  <span>
                    {conversation.title}
                  </span>
                </button>

                <button
                  className="ai-history-delete"
                  onClick={(event) =>
                    deleteConversation(event, conversation.id)
                  }
                  aria-label="Delete conversation"
                  title="Delete conversation"
                >
                  <X size={14} />
                </button>

              </div>

            ))}

          </div>

        </div>

        {/* SIDEBAR BOTTOM */}

        <div className="ai-sidebar-bottom">

          <div className="ai-support-card">
            <Sparkles size={22} />

            <h4>Learning without limits.</h4>

            <p>
              Your accessible learning companion is always here.
            </p>
          </div>

          <div className="ai-sidebar-footer">
            <span>ACCESSABLE AI</span>
            <span>Learning made inclusive.</span>
          </div>

        </div>

      </aside>

      {/* MAIN CONTENT */}

      <main className="ai-main">

        {/* HEADER */}

        <header className="ai-header">
<BackToDashboard />
          <div className="ai-header-left">

            <div className="ai-header-icon">
              <Bot size={25} />
            </div>

            <div>
              <h2>AI Learning Assistant</h2>

              <p>
                Your personal accessible learning companion
              </p>
            </div>

          </div>

          <div className="ai-header-right">

            <div className="ai-status">
              <span className="ai-status-dot"></span>
              AI connected
            </div>

          </div>

        </header>

        {/* CHAT AREA */}

        <section className="ai-chat-area">

          <div className="ai-chat-content">

            {/* WELCOME SECTION */}

            {messages.length <= 1 && (

              <div className="ai-welcome">

                <div className="ai-welcome-icon">
                  <Sparkles size={30} />
                </div>

                <h1>
                  How can I help you <span>learn today?</span>
                </h1>

                <p>
                  Ask questions, explore concepts and make learning easier
                  with your AI-powered accessible assistant.
                </p>

                {/* SUGGESTED PROMPTS */}

                <div className="ai-suggestions">

                  <div className="ai-suggestions-heading">
                    TRY ASKING
                  </div>

                  <div className="ai-suggestion-grid">

                    {suggestions.map((suggestion, index) => {

                      const Icon = suggestion.icon;

                      return (

                        <button
                          key={index}
                          className="ai-suggestion-card"
                          onClick={() => handleSend(suggestion.text)}
                          disabled={loading}
                        >

                          <div className="ai-suggestion-icon">
                            <Icon size={21} />
                          </div>

                          <div>
                            <h4>{suggestion.title}</h4>
                            <p>{suggestion.text}</p>
                          </div>

                        </button>

                      );

                    })}

                  </div>

                </div>

              </div>

            )}

            {/* CHAT MESSAGES */}

            <div className="ai-messages">

              {messages.map((message, index) => (

                <div
                  key={index}
                  className={`ai-message ${
                    message.role === "user"
                      ? "user-message"
                      : "assistant-message"
                  }`}
                >

                  <div className="ai-message-avatar">

                    {message.role === "user" ? (
                      <User size={19} />
                    ) : (
                      <Bot size={19} />
                    )}

                  </div>

                  <div className="ai-message-content">

                    <div className="ai-message-name">

                      {message.role === "user"
                        ? "You"
                        : "AccessAble AI"}

                    </div>

                    <div className="ai-message-bubble">

                      <div className="ai-message-text">

                        {message.role === "assistant" ? (

                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                          >
                            {message.text}
                          </ReactMarkdown>

                        ) : (
                          message.text
                        )}

                      </div>

                    </div>

                    {/* READ ALOUD */}

                    {message.role === "assistant" &&
                      settings.readAloud &&
                      index !== 0 && (

                        <button
                          className="ai-message-listen"
                          onClick={() => speakMessage(message.text)}
                        >
                          <Volume2 size={15} />
                          Listen
                        </button>

                      )}

                  </div>

                </div>

              ))}

              {/* TYPING INDICATOR */}

              {loading && (

                <div className="ai-message assistant-message">

                  <div className="ai-message-avatar">
                    <Bot size={19} />
                  </div>

                  <div className="ai-message-content">

                    <div className="ai-message-name">
                      AccessAble AI
                    </div>

                    <div className="ai-typing">

                      <span></span>
                      <span></span>
                      <span></span>

                    </div>

                  </div>

                </div>

              )}

              <div ref={bottomRef}></div>

            </div>

          </div>

        </section>

        {/* INPUT SECTION */}

        <footer className="ai-input-section">

          <div className="ai-input-container">

            {/* VOICE INPUT */}

            <button
              className={`ai-voice-button ${
                isListening ? "listening" : ""
              }`}
              onClick={handleVoiceInput}
              type="button"
              aria-label={
                isListening
                  ? "Stop voice input"
                  : "Start voice input"
              }
              title={
                isListening
                  ? "Stop listening"
                  : "Speak your question"
              }
            >

              {isListening ? (
                <MicOff size={19} />
              ) : (
                <Mic size={19} />
              )}

            </button>

            {/* TEXT INPUT */}

            <textarea
              className="ai-input"
              placeholder="Ask me anything about your learning..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
            />

            {/* SEND BUTTON */}

            <button
              className="ai-send-button"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <Send size={19} />
            </button>

          </div>

          {/* INPUT FOOTER */}

          <div className="ai-input-note">

            <span>
              <Accessibility size={14} />
              Designed for accessible learning
            </span>

            <button onClick={clearChat}>
              <Trash2 size={14} />
              Clear conversation
            </button>

          </div>

        </footer>

      </main>

      {/* ACCESSIBILITY SETTINGS MODAL */}

      {showAccessibilitySettings && (
        <AccessibilitySettings
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowAccessibilitySettings(false)}
        />
      )}

    </div>
  );
}

export default AIAssistant;