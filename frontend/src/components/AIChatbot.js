import { useState, useRef, useEffect } from "react";
import api from "../services/api";

const SUGGESTIONS = [
  "Which category am I spending most on?",
  "How much did I spend this month?",
  "Give me tips to save money",
  "What's my average expense?",
];

const styles = {
  // Floating button
  fabBtn: {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #c4431a 0%, #e8621f 100%)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 20px rgba(196,67,26,0.45)",
    zIndex: 1000,
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  fabIcon: { fontSize: "22px", lineHeight: 1 },
  fabPulse: {
    position: "absolute",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(196,67,26,0.25)",
    animation: "pulse 2s infinite",
  },

  // Chat window
  chatWindow: {
    position: "fixed",
    bottom: "96px",
    right: "28px",
    width: "370px",
    height: "520px",
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    zIndex: 999,
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.06)",
    animation: "slideUp 0.25s cubic-bezier(.21,1.02,.73,1)",
  },

  // Header
  header: {
    background: "linear-gradient(135deg, #1a1814 0%, #2c2620 100%)",
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  headerAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #c4431a, #e8621f)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    flexShrink: 0,
  },
  headerTitle: {
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    margin: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
  headerSub: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "11px",
    margin: 0,
    fontFamily: "'DM Sans', sans-serif",
  },
  closeBtn: {
    marginLeft: "auto",
    background: "rgba(255,255,255,0.08)",
    border: "none",
    color: "rgba(255,255,255,0.7)",
    cursor: "pointer",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    transition: "background 0.15s",
  },

  // Messages area
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    background: "#f9f8f6",
  },

  // Suggestions
  suggestionsWrap: {
    padding: "0 16px 12px",
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    background: "#f9f8f6",
    flexShrink: 0,
  },
  suggestionChip: {
    fontSize: "11px",
    padding: "5px 10px",
    borderRadius: "20px",
    border: "1px solid rgba(196,67,26,0.3)",
    background: "rgba(196,67,26,0.05)",
    color: "#c4431a",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  },

  // Input area
  inputArea: {
    padding: "12px 14px",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
    background: "#fff",
    flexShrink: 0,
  },
  inputBox: {
    flex: 1,
    border: "1.5px solid rgba(0,0,0,0.1)",
    borderRadius: "12px",
    padding: "9px 12px",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    background: "#f9f8f6",
    resize: "none",
    lineHeight: "1.4",
    color: "#1a1814",
    maxHeight: "80px",
    transition: "border-color 0.15s",
  },
  sendBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #c4431a, #e8621f)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "opacity 0.15s, transform 0.1s",
  },
};

function BubbleUser({ text }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #c4431a, #e8621f)",
          color: "#fff",
          padding: "10px 14px",
          borderRadius: "16px 16px 4px 16px",
          maxWidth: "82%",
          fontSize: "13px",
          lineHeight: "1.5",
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 2px 8px rgba(196,67,26,0.2)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function BubbleAI({ text, isTyping }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1a1814, #2c2620)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        🤖
      </div>
      <div
        style={{
          background: "#ffffff",
          border: "1px solid rgba(0,0,0,0.07)",
          padding: "10px 14px",
          borderRadius: "16px 16px 16px 4px",
          maxWidth: "82%",
          fontSize: "13px",
          lineHeight: "1.6",
          color: "#1a1814",
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          whiteSpace: "pre-line",
        }}
      >
        {isTyping ? (
          <span style={{ display: "flex", gap: "4px", alignItems: "center", padding: "2px 0" }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#c4431a",
                  display: "inline-block",
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </span>
        ) : (
          text
        )}
      </div>
    </div>
  );
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "👋 Hi! I'm your AI finance assistant powered by Gemini. Ask me anything about your expenses!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const res = await api.post("/api/gemini-chat/", { message: msg });
      setMessages((prev) => [...prev, { role: "ai", text: res.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, I couldn't reach the AI right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.7; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-6px); }
        }
        .fab-hover:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(196,67,26,0.55) !important; }
        .send-btn:hover  { opacity: 0.88; transform: scale(1.05); }
        .chip-hover:hover { background: rgba(196,67,26,0.12) !important; }
        .close-hover:hover { background: rgba(255,255,255,0.15) !important; }
        .chat-input:focus { border-color: rgba(196,67,26,0.5) !important; background: #fff !important; }
        .messages-scroll::-webkit-scrollbar { width: 4px; }
        .messages-scroll::-webkit-scrollbar-track { background: transparent; }
        .messages-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
      `}</style>

      {/* FAB Button */}
      {!open && (
        <button
          className="fab-hover"
          style={styles.fabBtn}
          onClick={() => setOpen(true)}
          title="Chat with AI Assistant"
        >
          <div style={styles.fabPulse} />
          <span style={styles.fabIcon}>💬</span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div style={styles.chatWindow}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerAvatar}>🤖</div>
            <div>
              <p style={styles.headerTitle}>Gemini Finance AI</p>
              <p style={styles.headerSub}>● Online • Powered by Gemini</p>
            </div>
            <button
              className="close-hover"
              style={styles.closeBtn}
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="messages-scroll" style={styles.messagesArea}>
            {messages.map((m, i) =>
              m.role === "user" ? (
                <BubbleUser key={i} text={m.text} />
              ) : (
                <BubbleAI key={i} text={m.text} />
              )
            )}
            {loading && <BubbleAI isTyping />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {showSuggestions && (
            <div style={styles.suggestionsWrap}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="chip-hover"
                  style={styles.suggestionChip}
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={styles.inputArea}>
            <textarea
              ref={textareaRef}
              className="chat-input"
              style={styles.inputBox}
              rows={1}
              placeholder="Ask about your expenses…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="send-btn"
              style={{ ...styles.sendBtn, opacity: !input.trim() || loading ? 0.5 : 1 }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
