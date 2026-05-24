import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BsStars } from "react-icons/bs";
import { FaMicrophone, FaPaperPlane } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import PixelCard from "./PixelCard";
const CARD_DATA = {
  name: "Garv Kumar",
  username: "garvkumar68",
  bio: "Software Engineer · Computer Vision · ML · IoT · Data Analyst — building smart systems from data to deployment.",
  stats: { following: 12, followers: 180, posts: 34 },
  socialLinks: {
    linkedin: "https://www.linkedin.com/in/garv-kumar-aa09b0213",
    github: "https://github.com/garvkumar68",
    twitter: "https://twitter.com",
  },
};

const FALLBACK_IMG =
  "https://drive.google.com/uc?export=view&id=1yAZJCOeH9CGa3gtMfeDsZRs4dgKR-zQV";

const styles = `
  .flip-card-container {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .outside-ai-btn-row {
    width: 360px;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 6px;
  }
  
  @media (max-width: 768px) {
    .outside-ai-btn-row {
      width: 300px;
    }
  }
.flip-card-container .outside-ai-btn {
    background: transparent !important;
    background-color: transparent !important;
    border: 1px solid rgba(0, 223, 162, 0.4) !important;
    border-radius: 8px !important;
    box-shadow: none !important;
    color: #00dfa2 !important;
    padding: 4px 8px !important;
    margin: 0 2px 0 0 !important;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px !important;
    font-weight: 500;
    letter-spacing: 0.5px;
    cursor: pointer;
    z-index: 20;
    transition: color 0.3s ease, opacity 0.3s ease, background-color 0.3s ease, border-color 0.3s ease !important;
    opacity: 0.85;
    font-family: 'Outfit', 'Inter', monospace;
    white-space: nowrap;
  }

  .flip-card-container .outside-ai-btn svg {
    font-size: 12px !important;
    color: #00dfa2 !important;
    transition: color 0.3s ease !important;
  }

  .flip-card-container .outside-ai-btn:hover {
    color: #00dfa2 !important;
    opacity: 1 !important;
    background: rgba(0, 223, 162, 0.12) !important;
    background-color: rgba(0, 223, 162, 0.12) !important;
    border-color: rgba(0, 223, 162, 0.7) !important;
  }

  .flip-card-container .outside-ai-btn:hover svg {
    color: #00dfa2 !important;
    fill: #00dfa2 !important;
  }

  .flip-card-wrapper {
    width: 360px !important;
    height: 450px !important;
    user-select: none;
  }

  /* ── FRONT: Dark slate base matching canvas ── */
  .flip-card-front {
    background: #0d0d0d !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .fc-front-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
    border-radius: 24px;
    margin: 0;
    padding: 0;
  }

  .fc-bottom-tagline {
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #00dfa2;
    text-shadow: 0 0 10px rgba(0, 223, 162, 0.4);
    z-index: 3;
    pointer-events: none;
    font-family: 'Outfit', 'Inter', monospace;
    width: 100%;
    padding: 0 24px;
  }

  .fc-bottom-tagline::before,
  .fc-bottom-tagline::after {
    content: "";
    flex: 1;
    height: 1px;
    background: rgba(0, 223, 162, 0.3);
  }

  .tagline-dot {
    font-size: 8px;
    color: #00dfa2;
    opacity: 0.8;
  }

  /* Specular border glow matching hexagon grid lines */
  .flip-card-front::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 24px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
    pointer-events: none;
    z-index: 1;
  }

  /* ── BACK: AI Twin Chat Interface ── */
  /* Using highly specific selector to completely override App.css rules */
  .flip-card-wrapper .flip-card-inner .flip-card-back {
    position: absolute !important;
    inset: 0 !important;
    background: #0d0d0d !important;
    background-image: radial-gradient(circle at top right, rgba(0, 223, 162, 0.07), transparent 60%) !important;
    border: none !important;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
    border-radius: 24px !important;
    padding: 0 !important;
    margin: 0 !important;
    gap: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    justify-content: space-between !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: 100% !important;
    transform: none !important;
    backdrop-filter: blur(16px) !important;
    -webkit-backdrop-filter: blur(16px) !important;
  }

  .ai-chat-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    background: transparent;
  }

  .ai-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #00dfa2;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    font-size: 20px;
    box-shadow: 0 0 18px rgba(0, 223, 162, 0.4);
    flex-shrink: 0;
  }

  .ai-header-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .ai-header-info h4 {
    margin: 0 0 2px;
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.3px;
  }

  .ai-header-info p {
    margin: 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
  }

  .online-dot {
    width: 8px;
    height: 8px;
    background-color: #00dfa2;
    border-radius: 50%;
    display: inline-block;
  }

  .ai-chat-body {
    flex: 1 !important;
    padding: 16px 20px !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    background: transparent !important;
    overflow-y: auto !important;
    min-height: 0 !important;
    overscroll-behavior: contain !important;
    scrollbar-width: thin !important;
    scrollbar-color: rgba(0, 223, 162, 0.4) transparent !important;
  }
  
  .ai-chat-body::-webkit-scrollbar {
    width: 4px !important;
  }
  
  .ai-chat-body::-webkit-scrollbar-track {
    background: transparent !important;
  }
  
  .ai-chat-body::-webkit-scrollbar-thumb {
    background: rgba(0, 223, 162, 0.4) !important;
    border-radius: 10px !important;
  }
  
  .ai-chat-body::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 223, 162, 0.7) !important;
  }

  .ai-message {
    background: #18181b;
    color: #e4e4e7;
    padding: 11px 15px;
    border-radius: 16px;
    border-top-left-radius: 4px;
    font-size: 13px;
    line-height: 1.45;
    max-width: 85%;
    border: 1px solid rgba(255,255,255,0.05);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    align-self: flex-start;
    margin-bottom: 12px;
  }

  .ai-message p, 
  .ai-message ul, 
  .ai-message ol, 
  .ai-message li, 
  .ai-message span, 
  .ai-message a,
  .ai-message strong,
  .ai-message em {
    font-size: 13px !important;
    line-height: 1.45 !important;
    text-align: left !important;
  }

  .ai-message p {
    margin: 0 0 8px 0;
  }
  
  .ai-message p:last-child {
    margin-bottom: 0;
  }

  .ai-message ul, .ai-message ol {
    margin: 4px 0 8px 0;
    padding-left: 20px;
  }

  .ai-message li {
    margin-bottom: 4px;
  }

  .user-message {
    background: rgba(0, 223, 162, 0.15);
    color: #ffffff;
    padding: 11px 15px;
    border-radius: 16px;
    border-top-right-radius: 4px;
    font-size: 13px;
    line-height: 1.45;
    max-width: 85%;
    border: 1px solid rgba(0, 223, 162, 0.25);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    align-self: flex-end;
    margin-bottom: 12px;
  }

  .ai-chat-input-wrapper {
    padding: 0 20px 16px;
    background: transparent;
  }

  .ai-input-pill {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(20, 30, 25, 0.4);
    border-radius: 30px;
    padding: 4px 4px 4px 16px;
    border: 1px solid rgba(0, 223, 162, 0.15);
  }

  .ai-input-pill input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 13.5px;
    outline: none;
    width: 100%;
    padding: 0;
    margin: 0;
  }

  .ai-input-pill input::placeholder {
    color: #666666;
    font-weight: 400;
  }

  .mic-btn {
    width: 36px !important;
    height: 36px !important;
    border-radius: 50% !important;
    background: #00dfa2 !important;
    color: #000000 !important;
    border: none !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    box-shadow: 0 0 12px rgba(0, 223, 162, 0.3) !important;
    transition: transform 0.2s, background 0.2s, box-shadow 0.2s !important;
    flex-shrink: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  .mic-btn:hover {
    transform: scale(1.05) !important;
    background: #05ffd3 !important;
    box-shadow: 0 0 18px rgba(0, 223, 162, 0.5) !important;
  }

  .mic-btn svg {
    display: block !important;
    width: 15px !important;
    height: 15px !important;
    margin: auto !important;
    fill: currentColor !important;
  }

  .mic-btn.listening {
    background: #ff3b30 !important;
    color: #ffffff !important;
    box-shadow: 0 0 12px rgba(255, 59, 48, 0.4) !important;
    animation: micPulse 1.2s infinite ease-in-out !important;
  }
  
  @keyframes micPulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 12px rgba(255, 59, 48, 0.4);
    }
    50% {
      transform: scale(1.1);
      box-shadow: 0 0 20px rgba(255, 59, 48, 0.8);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 12px rgba(255, 59, 48, 0.4);
    }
  }

  /* Fully Responsive for Mobile Card Sizes */
  @media (max-width: 768px) {
    .flip-card-wrapper {
      width: 300px !important;
      height: 390px !important;
    }
    .ai-chat-header {
      padding: 12px 16px 10px !important;
      gap: 10px !important;
    }
    .ai-avatar {
      width: 32px !important;
      height: 32px !important;
      font-size: 16px !important;
      box-shadow: 0 0 12px rgba(0, 223, 162, 0.3) !important;
    }
    .ai-header-info h4 {
      font-size: 12.5px !important;
    }
    .ai-header-info p {
      font-size: 10.5px !important;
    }
    .ai-chat-body {
      padding: 12px 16px !important;
    }
    .ai-message {
      padding: 9px 13px !important;
      font-size: 12px !important;
      max-width: 98% !important;
    }
    .ai-chat-input-wrapper {
      padding: 0 16px 12px !important;
    }
    .ai-input-pill {
      padding: 4px 4px 4px 12px !important;
    }
    .ai-input-pill input {
      font-size: 12.5px !important;
    }
    .mic-btn {
      width: 30px !important;
      height: 30px !important;
    }
    .mic-btn svg {
      width: 13px !important;
      height: 13px !important;
    }
    .fc-vertical-tagline {
      font-size: 8px !important;
      letter-spacing: 1.5px !important;
      padding: 12px 4px !important;
      right: 8px !important;
    }
  }

  /* Override 3D flip with PixelCard crossfade */
  .flip-card-wrapper .flip-card-inner {
    transform: none !important;
    transition: none !important;
  }
  .flip-card-wrapper .flip-card-front,
  .flip-card-wrapper .flip-card-back {
    transition: opacity 0.4s ease-in-out !important;
    transform: none !important;
    backface-visibility: visible !important;
    z-index: 1; /* behind pixel canvas which is z-index 2 */
  }
  
  .flip-card-wrapper .flip-card-inner:not(.flipped) .flip-card-back {
    opacity: 0 !important;
    pointer-events: none !important;
  }
  .flip-card-wrapper .flip-card-inner:not(.flipped) .flip-card-front {
    opacity: 1 !important;
    pointer-events: auto !important;
  }

  .flip-card-wrapper .flip-card-inner.flipped .flip-card-front {
    opacity: 0 !important;
    pointer-events: none !important;
  }
  .flip-card-wrapper .flip-card-inner.flipped .flip-card-back {
    opacity: 1 !important;
    pointer-events: auto !important;
  }

  /* Fade out the pixel overlay on the backside so text is readable */
  .flip-card-wrapper.flipped .pixel-canvas,
  .flip-card-wrapper:hover .pixel-canvas {
    opacity: 0.15 !important;
    transition: opacity 0.8s ease-in-out 0.4s !important;
    pointer-events: none !important;
  }
  
  .flip-card-wrapper:not(:hover) .pixel-canvas {
    opacity: 1 !important;
    transition: opacity 0.2s ease-in-out !important;
  }
`;

export const FlipCard = () => {
  const [flipped, setFlipped] = useState(false);
  const [imgUrl, setImgUrl] = useState(FALLBACK_IMG);
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hey! I'm Garv's AI twin. Ask me anything about his work." }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const chatBodyRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    axios
      .get(
        "https://raw.githubusercontent.com/garvkumar68/Portfolio/json-data/logo.json"
      )
      .then((res) => {
        if (res.data?.logo_url) setImgUrl(res.data.logo_url);
      })
      .catch(() => {});
  }, []);

  // Set up Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognition) {
        try {
          recognition.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Auto-scroll to the bottom of the chat list on new messages
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Stop global scroll hijackers (like react-scroll) from intercepting mouse wheels inside the chat
  useEffect(() => {
    const el = chatBodyRef.current;
    if (!el) return;
    
    const stopScrollPropagation = (e) => {
      e.stopPropagation();
    };

    el.addEventListener("wheel", stopScrollPropagation, { passive: false });
    el.addEventListener("touchmove", stopScrollPropagation, { passive: false });

    return () => {
      el.removeEventListener("wheel", stopScrollPropagation);
      el.removeEventListener("touchmove", stopScrollPropagation);
    };
  }, []);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const currentMessages = [...messages, { sender: "user", text: userText }];
    setMessages(currentMessages);
    setInputValue("");

    // Create an empty AI message that we will stream into
    setMessages((prev) => [...prev, { sender: "ai", text: "" }]);

    try {
      // Build API payload mapping our history
      let apiMessages = currentMessages.map(msg => ({
        role: msg.sender === "ai" ? "assistant" : "user",
        content: msg.text
      }));

      // Gemma and many LLMs strictly require the conversation history to start with a 'user' message
      while (apiMessages.length > 0 && apiMessages[0].role === "assistant") {
        apiMessages.shift();
      }

      const response = await fetch("https://garv-ai-twin.portfolio-support.workers.dev/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          model: "google/gemma-3-12b",
          stream: true
        })
      });

      if (!response.ok) {
        setMessages((prev) => {
          const arr = [...prev];
          arr[arr.length - 1].text = "Error: Failed to reach AI endpoint.";
          return arr;
        });
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResponse = "";

      // Real-time Stream loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;
          if (line.startsWith("data: ")) {
            const dataStr = line.substring(6).trim();
            if (dataStr === "[DONE]") break;
            try {
              const packet = JSON.parse(dataStr);
              const content = packet.choices?.[0]?.delta?.content || "";
              if (content) {
                fullResponse += content;
                // Dynamically update the very last message in the array
                setMessages((prev) => {
                  const arr = [...prev];
                  arr[arr.length - 1].text = fullResponse || " "; // fall back to space so bubble renders
                  return arr;
                });
              }
            } catch (err) {
              // Ignore parse errors on partial chunks
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const arr = [...prev];
        arr[arr.length - 1].text = "Error: Connection failed.";
        return arr;
      });
    }
  };

  const handleMicClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (inputValue.trim() && !isListening) {
      handleSend();
      return;
    }

    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try Google Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const { name } = CARD_DATA;

  return (
    <div className="flip-card-container">
      <style>{styles}</style>
      <div className="outside-ai-btn-row">
        <button 
          className="outside-ai-btn"
          onClick={(e) => { e.stopPropagation(); setFlipped(!flipped); }}
          title={flipped ? "Close AI" : "Ai Chat"}
        >
          {flipped ? "Close AI" : "Ai Chat"} <BsStars />
        </button>
      </div>
      <PixelCard
        variant="default"
        gap={12}
        speed={45}
        colors="#00dfa2,#00b386,#008060"
        noFocus={true}
        className="flip-card-wrapper"
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        onClick={() => setFlipped((f) => !f)}
      >
        <div className={`flip-card-inner${flipped ? " flipped" : ""}`}>

          {/* ── FRONT ── */}
          <div className="flip-card-front">
            <img
              src={imgUrl}
              alt={name}
              className="fc-front-img"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_IMG;
              }}
            />
            <div className="fc-bottom-tagline">
              <span className="tagline-dot">▪</span> FROM DATA TO SOLUTIONS WITH AI <span className="tagline-dot">▪</span>
            </div>
          </div>

          {/* ── BACK: AI Twin Interface ── */}
          <div className="flip-card-back" onClick={(e) => e.stopPropagation()}>
            <div className="ai-chat-header">
              <div className="ai-avatar">
                <BsStars />
              </div>
              <div className="ai-header-info">
                <h4>Garv · AI Twin</h4>
                <p><span className="online-dot"></span> online</p>
              </div>
            </div>

            <div className="ai-chat-body" ref={chatBodyRef}>
              {messages.map((msg, index) => (
                <div key={index} className={msg.sender === "ai" ? "ai-message" : "user-message"}>
                  {msg.sender === "ai" ? (
                    <ReactMarkdown
                      components={{
                        a: ({ node, ...props }) => (
                          <a 
                            {...props} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: "#00dfa2", textDecoration: "none", fontWeight: "600" }} 
                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                          />
                        )
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="ai-chat-input-wrapper">
              <div className="ai-input-pill">
                <input
                  type="text"
                  placeholder={isListening ? "Listening... Speak now..." : "Type your request..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button
                  type="button"
                  className={`mic-btn ${isListening ? "listening" : ""}`}
                  onClick={handleMicClick}
                >
                  {isListening || !inputValue.trim() ? <FaMicrophone /> : <FaPaperPlane />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </PixelCard>
    </div>
  );
};