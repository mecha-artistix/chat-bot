import { useState, useEffect, useRef } from "react";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const eventSourceRef = useRef(null);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    const newMessage = { sender: "user", text: message };
    setMessages((messages) => [...messages, newMessage]);
    setMessage("");

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);

    try {
      const response = await fetch("http://5.9.96.58:5000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input_text: message,
          session_id: "12345",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("ReadableStream not supported!");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let completeResponse = "";
      setMessages((messages) => [...messages, { sender: "bot", text: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        completeResponse += chunk;

        // Update the last message (bot's response) with the new chunk
        setMessages((messages) => {
          const updatedMessages = [...messages];
          console.log(updatedMessages);
          updatedMessages[updatedMessages.length - 1] = {
            ...updatedMessages[updatedMessages.length - 1],
            text: completeResponse,
          };
          return updatedMessages;
        });

        console.log("Received Chunk:", chunk);
      }
    } catch (error) {
      console.error("Error making API call", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [messages]);
  return (
    <div className="flex items-center flex-col justify-center min-h-screen w-full p-2">
      <div className="h-screen md:h-96 border rounded-lg w-full max-w-md flex flex-col bg-white shadow-lg">
        <div className="h-full overflow-y-scroll border bg-slate-100 ">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 my-2 rounded-lg max-w-xs ${
                msg.sender === "user"
                  ? "bg-gray-500 text-white self-end"
                  : "bg-blue-500 text-white self-start"
              }`}
            >
              <span>{msg.text}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="border w-full flax flex-col items-start">
          <textarea
            ref={inputRef}
            className="w-full border"
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
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
