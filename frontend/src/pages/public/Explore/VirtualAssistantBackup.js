// Backup of Virtual Assistant (Chatbot) components from Explore.js
// This file contains Chatbot, ChatbotWelcome, ChatbotMessage, TypingIndicator, ChatbotHeader, ChatbotInput, and related logic.
// Paste from Explore.js as of July 24, 2025.

import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// --- Chatbot Components ---
const ChatbotMessage = ({ message, botAvatar, userAvatar, isBot }) => (
  <div className={`message-row ${message.sender}`}>
    {isBot && (
      <img src={botAvatar} alt="bot avatar" className="message-avatar" />
    )}
    <div className="message-content">
      {message.text && (
        <p className={`message-bubble ${message.sender}`}>{message.text}</p>
      )}
      {message.payload && (
        <div className="rich-response-grid">
          {message.payload.map((item, index) => (
            <TrailCard
              key={item.id_jalur || index}
              trail={item}
              index={index}
            />
          ))}
        </div>
      )}
      <div className={`message-timestamp-container ${message.sender}`}>
        <span className="message-timestamp">{message.timestamp}</span>
      </div>
    </div>
    {!isBot && (
      <img src={userAvatar} alt="user avatar" className="message-avatar" />
    )}
  </div>
);

const TypingIndicator = ({ botAvatar }) => (
  <div className="message-row bot">
    <img src={botAvatar} alt="bot avatar" className="message-avatar" />
    <div className="message-bubble">
      <div className="typing-indicator">
        <span />
        <span />
        <span />
      </div>
    </div>
  </div>
);

const ChatbotHeader = ({ onClose }) => (
  <div className="chatbot-header">
    Asisten Virtual Mountify
    <button className="chatbot-close-button" onClick={onClose}>
      &times;
    </button>
  </div>
);

const ChatbotInput = ({ inputValue, setInputValue, onSubmit }) => (
  <form className="chatbot-input-form" onSubmit={onSubmit}>
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder="Ketik pesan Anda..."
    />
    <button type="submit">Kirim</button>
  </form>
);

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(uuidv4());
  const messagesEndRef = useRef(null);

  const botAvatarUrl =
    "https://cdn-icons-png.flaticon.com/512/8649/8649595.png";
  const userAvatarUrl =
    "https://cdn-icons-png.flaticon.com/512/1144/1144760.png";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  useEffect(() => {
    setMessages([INITIAL_CHATBOT_MESSAGE]);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputValue.trim() === "") return;
    const userMessage = createMessage(inputValue, "user");
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    try {
      // ...API call and response handling...
    } catch (error) {
      // ...error handling...
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container">
      <ChatbotHeader onClose={onClose} />
      <div className="chatbot-messages">
        {messages.map((msg) => (
          <ChatbotMessage
            key={msg.id}
            message={msg}
            botAvatar={botAvatarUrl}
            userAvatar={userAvatarUrl}
            isBot={msg.sender === "bot"}
          />
        ))}
        {isTyping && <TypingIndicator botAvatar={botAvatarUrl} />}
        <div ref={messagesEndRef} />
      </div>
      <ChatbotInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSubmit={handleSendMessage}
      />
    </div>
  );
};

const ChatbotWelcome = ({ onStartChat }) => {
  return (
    <div className="chatbot-welcome-container">
      <div className="welcome-content">
        <img
          src="https://cdn-icons-png.flaticon.com/512/8649/8649595.png"
          alt="Asisten Virtual"
          className="chatbot-welcome-icon"
        />
        <h2 className="chatbot-welcome-title">Asisten Virtual Mountify</h2>
        <p className="chatbot-welcome-description">
          Dapatkan rekomendasi gunung dengan percakapan yang natural dan
          interaktif
        </p>
        <button className="chatbot-start-button" onClick={onStartChat}>
          Mulai Percakapan
        </button>
      </div>
    </div>
  );
};

// Note: TrailCard, createMessage, INITIAL_CHATBOT_MESSAGE, and API helpers must be imported or defined for full functionality.

export {
  Chatbot,
  ChatbotWelcome,
  ChatbotMessage,
  TypingIndicator,
  ChatbotHeader,
  ChatbotInput,
};
