import React, { useState, useEffect, useRef } from "react";
import { BsStars } from "react-icons/bs";
import { FaMicrophone, FaPaperPlane } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import ReactMarkdown from "react-markdown";
import { useLocation } from "react-router-dom";

const styles = `
  .floating-ai-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .floating-ai-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #00dfa2;
    color: #0d0d0d;
    border: none;
    box-shadow: 0 4px 20px rgba(0, 223, 162, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
  }

  .floating-ai-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 24px rgba(0, 223, 162, 0.6);
    background: #05ffd3;
  }

  .floating-ai-btn.open {
    background: #ff3b30;
    color: white;
    box-shadow: 0 4px 20px rgba(255, 59, 48, 0.4);
  }

  .floating-ai-btn.open:hover {
    background: #ff5247;
    box-shadow: 0 6px 24px rgba(255, 59, 48, 0.6);
  }

  .floating-chat-popup {
    width: 360px;
    height: 500px;
    background: #0d0d0d;
    background-image: radial-gradient(circle at top right, rgba(0, 223, 162, 0.07), transparent 60%);
    border-radius: 24px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 10px 40px rgba(0, 0, 0, 0.8);
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    pointer-events: none;
    transform-origin: bottom right;
    transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .floating-chat-popup.open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }

  /* Chat interface styles borrowed from FlipCard */
  .floating-chat-popup .ai-chat-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .floating-chat-popup .ai-avatar {
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

  .floating-chat-popup .ai-header-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .floating-chat-popup .ai-header-info h4 {
    margin: 0 0 2px;
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.3px;
  }

  .floating-chat-popup .ai-header-info p {
    margin: 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 500;
  }

  .floating-chat-popup .online-dot {
    width: 8px;
    height: 8px;
    background-color: #00dfa2;
    border-radius: 50%;
    display: inline-block;
  }

  .floating-chat-popup .ai-chat-body {
    flex: 1;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 223, 162, 0.4) transparent;
  }

  .floating-chat-popup .ai-chat-body::-webkit-scrollbar {
    width: 4px;
  }

  .floating-chat-popup .ai-chat-body::-webkit-scrollbar-thumb {
    background: rgba(0, 223, 162, 0.4);
    border-radius: 10px;
  }

  .floating-chat-popup .ai-message {
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
    text-align: left;
  }

  .floating-chat-popup .ai-message p { margin: 0 0 8px 0; }
  .floating-chat-popup .ai-message p:last-child { margin-bottom: 0; }
  .floating-chat-popup .ai-message ul, .floating-chat-popup .ai-message ol { margin: 4px 0 8px 0; padding-left: 20px; }
  .floating-chat-popup .ai-message li { margin-bottom: 4px; }

  .floating-chat-popup .user-message {
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
    text-align: left;
  }

  .floating-chat-popup .ai-chat-input-wrapper {
    padding: 0 20px 16px;
  }

  .floating-chat-popup .ai-input-pill {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(20, 30, 25, 0.4);
    border-radius: 30px;
    padding: 4px 4px 4px 16px;
    border: 1px solid rgba(0, 223, 162, 0.15);
  }

  .floating-chat-popup .ai-input-pill input {
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-size: 13.5px;
    outline: none;
    width: 100%;
  }

  .floating-chat-popup .ai-input-pill input::placeholder {
    color: #666666;
  }

  .floating-chat-popup .mic-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #00dfa2;
    color: #000000;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s, background 0.2s;
  }

  .floating-chat-popup .mic-btn:hover {
    transform: scale(1.05);
    background: #05ffd3;
  }

  .floating-chat-popup .mic-btn.listening {
    background: #ff3b30;
    color: #ffffff;
    animation: floatingMicPulse 1.2s infinite ease-in-out;
  }

  @keyframes floatingMicPulse {
    0% { transform: scale(1); box-shadow: 0 0 12px rgba(255, 59, 48, 0.4); }
    50% { transform: scale(1.1); box-shadow: 0 0 20px rgba(255, 59, 48, 0.8); }
    100% { transform: scale(1); box-shadow: 0 0 12px rgba(255, 59, 48, 0.4); }
  }

  @media (max-width: 768px) {
    .floating-ai-container {
      bottom: 16px;
      right: 16px;
    }
    .floating-ai-btn {
      width: 50px;
      height: 50px;
      font-size: 20px;
    }
    .floating-chat-popup {
      width: calc(100vw - 32px);
      height: 450px;
    }
  }
`;

export const FloatingAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHomeFlipped, setIsHomeFlipped] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hey! I'm Garv's AI twin. Ask me anything about his work, skills, or projects." }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const chatBodyRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync state from FlipCard
  useEffect(() => {
    const handleState = (e) => setIsHomeFlipped(e.detail);
    window.addEventListener('flipcard-state', handleState);
    return () => window.removeEventListener('flipcard-state', handleState);
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

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    }

    return () => {
      if (recognition) {
        try { recognition.abort(); } catch (e) {}
      }
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (chatBodyRef.current && isOpen) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Stop scroll propagation
  useEffect(() => {
    const el = chatBodyRef.current;
    if (!el) return;
    const stopScrollPropagation = (e) => e.stopPropagation();
    el.addEventListener("wheel", stopScrollPropagation, { passive: false });
    el.addEventListener("touchmove", stopScrollPropagation, { passive: false });
    return () => {
      el.removeEventListener("wheel", stopScrollPropagation);
      el.removeEventListener("touchmove", stopScrollPropagation);
    };
  }, [isOpen]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const currentMessages = [...messages, { sender: "user", text: userText }];
    setMessages(currentMessages);
    setInputValue("");

    // Create an empty AI message to stream into
    setMessages((prev) => [...prev, { sender: "ai", text: "" }]);

    try {
      let apiMessages = currentMessages.map(msg => ({
        role: msg.sender === "ai" ? "assistant" : "user",
        content: msg.text
      }));

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
                setMessages((prev) => {
                  const arr = [...prev];
                  arr[arr.length - 1].text = fullResponse || " ";
                  return arr;
                });
              }
            } catch (err) {}
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
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try { recognitionRef.current.start(); } catch (err) {}
    }
  };

  return (
    <div className="floating-ai-container">
      <style>{styles}</style>
      
      {/* Only render the popup if we are NOT on the home page */}
      {!isHome && (
        <div className={`floating-chat-popup ${isOpen ? "open" : ""}`}>
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
      )}

      <button 
        className={`floating-ai-btn ${(isHome ? isHomeFlipped : isOpen) ? "open" : ""}`} 
        onClick={() => {
          if (isHome) {
            window.dispatchEvent(new Event('toggle-flipcard'));
          } else {
            setIsOpen(!isOpen);
          }
        }}
        title="Chat with AI Twin"
      >
        {(isHome ? isHomeFlipped : isOpen) ? <IoMdClose /> : <BsStars />}
      </button>
    </div>
  );
};
