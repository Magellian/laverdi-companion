import { useRef, useEffect } from "react";
import "./ChatView.css";

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
}

interface Props {
  messages: Message[];
  loading: boolean;
  onSend: (text: string) => void;
  onBack: () => void;
}

export function ChatView({ messages, loading, onSend, onBack }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).elements.namedItem(
      "chat-input"
    ) as HTMLInputElement;
    const text = input.value.trim();
    if (text) {
      onSend(text);
      input.value = "";
    }
  }

  return (
    <div className="chat-view">
      {/* Header */}
      <div className="chat-header">
        <button className="chat-back" onClick={onBack}>
          ←
        </button>
        <div>
          <span className="chat-header__title">Agent Chat</span>
          <span className="chat-header__subtitle">Local · Private</span>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty">
            <p className="chat-empty__icon">💬</p>
            <p className="chat-empty__text">
              Ask the agent anything about your files, system, or tasks.
            </p>
            <div className="chat-suggestions">
              {[
                "Find my largest files",
                "How much disk space is free?",
                "Clean up old downloads",
                "List files on my desktop",
              ].map((s) => (
                <button
                  key={s}
                  className="chat-suggestion"
                  onClick={() => onSend(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`chat-msg chat-msg--${m.role}`}>
            <div className="chat-msg__bubble">{m.content}</div>
            <div className="chat-msg__time">
              {new Date(m.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-msg chat-msg--agent">
            <div className="chat-msg__bubble chat-msg__bubble--typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <input
          name="chat-input"
          className="chat-input"
          placeholder="Ask the agent to do something..."
          disabled={loading}
          autoFocus
        />
        <button
          type="submit"
          className="chat-send"
          disabled={loading}
        >
          ↑
        </button>
      </form>
    </div>
  );
}