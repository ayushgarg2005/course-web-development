// src/Chatbot.jsx
import React, { useState } from 'react';
import axios from 'axios';
import ChatMessage from './ChatMessage';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isVisible, setIsVisible] = useState(true); // New state to control visibility

  const handleSendMessage = async () => {
    if (!input.trim()) return; // Avoid sending empty messages

    // Add user message to chat
    const newMessage = { text: input, sender: 'You' };
    setMessages([...messages, newMessage]);
    setInput('');

    try {
      // Replace with your backend URL
      const response = await axios.post('http://localhost:3000/chat', {
        query: input,
        context: 'course' // Can be dynamic based on the user's needs
      });
      // Add bot response to chat
      const botMessage = { text: response.data.response, sender: 'Bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error communicating with chatbot:", error);
      // Add error message to chat
      const errorMessage = { text: "Sorry, something went wrong. Please try again.", sender: 'Bot' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible); // Toggle visibility state
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleVisibility}
        className="fixed bottom-4 right-0 bg-purple-500 text-white px-2 py-1 text-sm rounded-full shadow-lg z-50 hover:bg-purple-600"
      >
        {isVisible ? '>' : '<'}
      </button>

      {/* Chatbot Container */}
      {isVisible && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg flex flex-col h-96 z-40">
          <div className="bg-purple-500 text-white p-3 rounded-t-lg text-center">
            <h4>Course Assistant</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((message, index) => (
              <ChatMessage key={index} user={message.sender} text={message.text} />
            ))}
          </div>
          <div className="flex p-2 border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="flex-grow p-2 rounded-l-lg border focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="bg-purple-500 text-white px-4 rounded-r-lg hover:bg-purple-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
