import { FormEvent, useEffect, useRef, useState } from "react";
import "./index.css";
import botLogo from "../assets/chatBot.jpg";
type Role = "user" | "assistant";

interface Message {
  id: number;
  role: Role;
  text: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hi! I’m your AI chat (stub version). Ask me anything 🤖",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // автоскролл вниз при новом сообщении
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:4000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      const replyText =
        data.reply ??
        data.message ??
        "Echo from backend (no 'reply' field in response).";

      const botMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: replyText,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setError("Failed to get response from server");
      const botMessage: Message = {
        id: Date.now() + 2,
        role: "assistant",
        text:
          "Sorry, I couldn't reach the server. Please try again in a moment 🙏",
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-root">
      <div className="chat-card">
        <header className="chat-header">
          <div className="chat-title">AI Chat</div>
          <div className="chat-subtitle">portfolio mini-project</div>
        </header>

        <main className="chat-messages">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`message-row ${
                m.role === "user" ? "message-row--user" : "message-row--assistant"
              }`}
            >
              <div className="avatar">
                {m.role === "assistant" ? (
                <img src={botLogo} alt="AI avatar" className="avatar-img" />
                ) : (
                <span className="avatar-user">You</span>
                 )}
            </div>

              <div
                className={`bubble ${
                  m.role === "user" ? "bubble--user" : "bubble--assistant"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="typing-row">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          )}

          <div ref={bottomRef} />
        </main>

        <footer className="chat-footer">
          {error && <div className="error-text">{error}</div>}

          <form className="input-row" onSubmit={handleSubmit}>
            <input
              className="text-input"
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              className="send-btn"
              type="submit"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}

export default App;
