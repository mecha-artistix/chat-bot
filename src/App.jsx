import { useState } from "react";
import axios from "axios";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    // Add user message to chat history
    const newMessage = { sender: "user", text: message };
    setMessages([...messages, newMessage]);

    try {
      const res = await axios.post(
        "http://5.9.96.58:5000/query",
        {
          input_text: message,
          session_id: "12345",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Add chatbot response to chat history
      const botResponse = { sender: "bot", text: res.data.response };
      setMessages([...messages, newMessage, botResponse]);
    } catch (error) {
      console.error("Error making API call", error);
    }

    // Clear the input field
    setMessage("");
  };

  return (
    <div className="flex items-center flex-col justify-center h-screen w-full">
      <div className="border">
        <div className="size-96 border bg-slate-100">
          {messages.map((msg, index) => (
            <div key={index}>
              <span>{msg.text}</span>
            </div>
          ))}
        </div>
        <div className="border w-full flax flex-col items-start">
          <input
            className="w-full border"
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder="Type your message here"
          />
          <button
            onClick={handleSendMessage}
            className="border bg-blue-500 text-white py-1 px-2"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
