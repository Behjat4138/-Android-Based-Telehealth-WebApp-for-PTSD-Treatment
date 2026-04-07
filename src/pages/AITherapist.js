import { useState, useRef, useEffect } from "react";

// Key is loaded from your .env file as REACT_APP_GROQ_KEY
// Never hardcode the key here -- it will be exposed in the browser bundle
// To set up: create a .env file in the project root with:
// REACT_APP_GROQ_KEY=your_key_here
const GROQ_KEY = process.env.REACT_APP_GROQ_KEY || "";

const LANG = {
  en: {
    title: "AI Companion",
    disclaimer: "AI companion only - not a licensed therapist. Crisis line:",
    placeholder: "Share what's on your mind... (Enter to send)",
    send: "Send", sending: "...", newChat: "New Chat", back: "<- Dashboard",
    footerNote: "Conversations are not stored. Each session is private.",
    error: "Something went wrong - please try again.",
    greeting: (name) =>
      `Hi${name ? `, ${name}` : ""} I'm here with you. This is a safe, private space to share whatever is on your mind.\n\nI'm not a therapist, but I'm here to listen and offer gentle support.\n\nHow are you feeling right now?`,
    freshStart: "Hi again - Fresh start. I'm here. How are you feeling?",
    setupMsg: "The AI companion is not configured yet.\n\nTo activate: add REACT_APP_GROQ_KEY=your_key to your .env file, then restart the app.\n\nGet a free key at console.groq.com",
  },
  zu: {
    title: "Umngane we-AI",
    disclaimer: "Umngane we-AI kuphela - hhayi inyanga. Umugqa wezimo esikhulukazi:",
    placeholder: "Yabelana nalokho okusengqondweni yakho...",
    send: "Thumela", sending: "...", newChat: "Ingxoxo Entsha", back: "<- Ibhodi",
    footerNote: "Izingxoxo azigcinwa. Inhloko yonke iyimfihlo.",
    error: "Kukhona okungahambanga kahle - sicela uzame futhi.",
    greeting: (name) =>
      `Sawubona${name ? `, ${name}` : ""}. Ngilapha nawe. Lesi isikhala esiphephile.\n\nAngiyena inyanga, kodwa ngilapha ukuzwa futhi nikusekele.\n\nUzizwa kanjani njengamanje?`,
    freshStart: "Sawubona futhi - Siqala kabusha. Uzizwa kanjani?",
    setupMsg: "Umngane we-AI awusetiwe.\n\nUkuze usebenze: engeza i-REACT_APP_GROQ_KEY=ukhiye_wakho ku-.env wakho bese uqala kabusha i-app.",
  },
};

const SYSTEM_PROMPT = `You are a compassionate, trauma-informed AI companion for PTSDCare, supporting youth (ages 14-25) with PTSD in KwaZulu-Natal, South Africa. Be warm, gentle, non-judgmental. Acknowledge feelings FIRST before any suggestions. Keep responses to 2-3 short paragraphs. Never diagnose. For crisis: SA line 0800 567 567. If user writes in Zulu, respond in Zulu.`;

function AITherapist({ user, setPage, lang = "en" }) {
  const tx = LANG[lang] || LANG.en;
  const firstName = user?.displayName?.split(" ")[0] || "";

  const [messages, setMessages] = useState([
    { role: "assistant", content: (LANG[lang] || LANG.en).greeting(firstName) },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const isKeySet = !!GROQ_KEY;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError("");

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    if (!isKeySet) {
      await new Promise(r => setTimeout(r, 400));
      setMessages(prev => [...prev, {
        role: "assistant",
        content: (LANG[lang] || LANG.en).setupMsg,
      }]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 400,
          temperature: 0.75,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim()
        || "I'm here - could you share a little more about how you're feeling?";

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error("Groq error:", e.message);
      setError(tx.error);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: (LANG[lang] || LANG.en).freshStart }]);
    setError("");
  };

  return (
    <div className="dashboard">
      <div className="top-bar">
        <h1 className="page-title">{tx.title}</h1>
        <div className="topbar-right">
          <button className="btn-ghost-sm" onClick={clearChat}>{tx.newChat}</button>
          <button onClick={() => setPage("dashboard")}>{tx.back}</button>
        </div>
      </div>

      <div className="ai-disclaimer">
        {tx.disclaimer}{" "}
        <a href="tel:0800567567"><strong>0800 567 567</strong></a> (SA) &middot;{" "}
        <a href="tel:988"><strong>988</strong></a> (US)
      </div>

      {!isKeySet && (
        <div className="ai-setup-banner">
          <strong>Setup needed:</strong> Add <code>REACT_APP_GROQ_KEY=your_key</code> to your <code>.env</code> file and restart the app.
          Get a free key at <a href="https://console.groq.com" target="_blank" rel="noreferrer">console.groq.com</a>.
        </div>
      )}

      <div className="ai-chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg-row ${m.role}`}>
            {m.role === "assistant" && <div className="ai-avatar">🌿</div>}
            <div className={`ai-bubble ${m.role}`}>
              {m.content.split("\n").map((line, j) =>
                line ? <p key={j}>{line}</p> : <br key={j} />
              )}
            </div>
            {m.role === "user" && (
              <div className="ai-avatar user-avatar">
                {firstName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="ai-msg-row assistant">
            <div className="ai-avatar">🌿</div>
            <div className="ai-bubble assistant ai-typing"><span /><span /><span /></div>
          </div>
        )}

        {error && (
          <div className="ai-error-row">
            {error}
            <button className="ai-retry-btn" onClick={() => setError("")}>Dismiss</button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="ai-input-row">
        <textarea
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown} placeholder={tx.placeholder}
          className="ai-input" rows={2} disabled={loading}
        />
        <button className="ai-send-btn" onClick={sendMessage} disabled={!input.trim() || loading}>
          {loading ? tx.sending : tx.send}
        </button>
      </div>
      <p className="ai-footer-note">{tx.footerNote}</p>
    </div>
  );
}

export default AITherapist;