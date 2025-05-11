import { useState, useEffect, useRef } from "react";
import { getMessagesOfChatRoom, sendMessage } from "../../services/ChatService";
import Message from "./Message";
import Contact from "./Contact";
import ChatForm from "./ChatForm";

export default function ChatRoom({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [incomingMessage, setIncomingMessage] = useState(null);

  const scrollRef = useRef();

  // Fetch messages when currentChat changes
  useEffect(() => {
    if (!currentChat || !currentChat._id) return;

    const fetchData = async () => {
      try {
        const res = await getMessagesOfChatRoom(currentChat._id);
        setMessages(res);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    fetchData();
  }, [currentChat]);

  // Scroll to the bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Listen for incoming messages via socket
  useEffect(() => {
    if (!socket.current) return;

    const listener = (data) => {
      setIncomingMessage({
        senderId: data.senderId,
        message: data.message,
      });
    };

    socket.current.on("getMessage", listener);

    // Cleanup listener when socket or component unmounts
    return () => {
      socket.current.off("getMessage", listener);
    };
  }, [socket]);

  // Add incoming message to message list
  useEffect(() => {
    if (incomingMessage) {
      setMessages((prev) => [...prev, incomingMessage]);
    }
  }, [incomingMessage]);

  // Handle form submit for sending message
  const handleFormSubmit = async (message) => {
    const receiverId = currentChat.members.find(
      (member) => member !== currentUser.uid
    );

    socket.current.emit("sendMessage", {
      senderId: currentUser.uid,
      receiverId: receiverId,
      message: message,
    });

    const messageBody = {
      chatRoomId: currentChat._id,
      sender: currentUser.uid,
      message: message,
    };
    try {
      const res = await sendMessage(messageBody);
      setMessages((prev) => [...prev, res]);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="lg:col-span-2 lg:block">
      <div className="w-full">
        <div className="p-3 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <Contact chatRoom={currentChat} currentUser={currentUser} />
        </div>

        <div className="relative w-full p-6 overflow-y-auto h-[30rem] bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
          <ul className="space-y-2">
            {messages.map((message, index) => (
              <Message key={index} message={message} self={currentUser.uid} />
            ))}
            <div ref={scrollRef} />
          </ul>
        </div>

        <ChatForm handleFormSubmit={handleFormSubmit} />
      </div>
    </div>
  );
}
