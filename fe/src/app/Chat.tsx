"use client";
import { gql, useQuery, useMutation, useSubscription } from "@apollo/client";
import { useUserContext } from "@/context/userContext";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import Contact from "@/components/Contact";
import Avatar from "@/components/Avatar";
import { uniqBy } from "lodash";

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      isOnline
    }
  }
`;

const GET_MESSAGES = gql`
  query GetMessages($recipientId: ID!) {
    messages(recipientId: $recipientId) {
      id
      sender
      recipient
      text
      file
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($recipientId: ID!, $text: String!, $file: Upload) {
    sendMessage(recipientId: $recipientId, text: $text, file: $file) {
      id
      sender
      recipient
      text
      file
    }
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageReceived($recipientId: ID!) {
    messageReceived(recipientId: $recipientId) {
      id
      sender
      recipient
      text
      file
    }
  }
`;

interface User {
  id: string;
  username: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  sender: string;
  recipient: string;
  text: string;
  file?: string;
}

interface SelectedUser {
  name: string;
  isOn: boolean;
}

export default function Chat() {
  const { id, setId, setUsername, username } = useUserContext();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const divUnderMsg = useRef<HTMLDivElement>(null);

  const { loading: usersLoading, data: usersData } = useQuery(GET_USERS);
  const { data: messagesData, refetch: refetchMessages } = useQuery(GET_MESSAGES, {
    variables: { recipientId: selectedUserId },
    skip: !selectedUserId,
  });
  const [sendMessageMutation] = useMutation(SEND_MESSAGE);
  const { data: newMessageData } = useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { recipientId: selectedUserId },
    skip: !selectedUserId,
  });

  useEffect(() => {
    if (newMessageData) {
      setMessages((prev) => uniqBy([...prev, newMessageData.messageReceived], "id"));
    }
  }, [newMessageData]);

  useEffect(() => {
    if (selectedUserId) {
      refetchMessages();
    }
  }, [selectedUserId, refetchMessages]);

  useEffect(() => {
    if (messagesData) {
      setMessages(messagesData.messages);
    }
  }, [messagesData]);

  useEffect(() => {
    if (divUnderMsg.current) {
      divUnderMsg.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent, file: File | null = null) => {
    e.preventDefault();
    if (!newMessageText.trim() && !file) return;

    await sendMessageMutation({
      variables: {
        recipientId: selectedUserId,
        text: newMessageText,
        file,
      },
    });

    setNewMessageText("");
  };

  if (usersLoading) return <p>Loading users...</p>;

  const onlineUsers = usersData?.users.filter((user: User) => user.isOnline && user.id !== id) || [];
  const offlineUsers = usersData?.users.filter((user: User) => !user.isOnline && user.id !== id) || [];

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col justify-between">
        <div className="overflow-y-auto">
          <Logo />
          {onlineUsers.map((user: User) => (
            <Contact
              key={user.id}
              online={true}
              username={user.username}
              onClick={() => {
                setSelectedUserId(user.id);
                setSelectedUser({ name: user.username, isOn: true });
              }}
              selected={user.id === selectedUserId}
            />
          ))}
          {offlineUsers.map((user: User) => (
            <Contact
              key={user.id}
              online={false}
              username={user.username}
              onClick={() => {
                setSelectedUserId(user.id);
                setSelectedUser({ name: user.username, isOn: false });
              }}
              selected={user.id === selectedUserId}
            />
          ))}
        </div>
        <div className="border-t-2 py-2 pl-2 pr-4 flex justify-between">
          <div className="flex bg-blue-500 p-1 px-2 gap-2 rounded-md text-white">
            <h2 className="capitalize">
              {username} <span className="lowercase text-gray-200">(you)</span>
            </h2>
          </div>
          <button className="text-gray-500" onClick={() => setId(null)}>
            Logout
          </button>
        </div>
      </div>

      <div className="bg-blue-50 w-2/3 p-2 flex flex-col">
        {selectedUser && (
          <div className="w-full bg-white shadow-xs border rounded-md px-2 py-2 gap-2 flex items-center">
            <Avatar username={selectedUser.name} online={selectedUser.isOn} />
            <span className="text-gray-800 capitalize">{selectedUser.name}</span>
          </div>
        )}
        <div className="flex-grow overflow-y-auto">
          {!selectedUserId && (
            <div className="flex flex-grow h-full items-center justify-center">
              <div className="text-gray-400">&larr; Select a person</div>
            </div>
          )}
          {!!selectedUserId && (
            <div className="overflow-y-auto">
              {messages.map((msg) => (
                <div key={msg.id} className={`${msg.sender === id ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block text-left max-w-[70%] p-2 my-2 rounded-md ${
                      msg.sender === id ? "bg-blue-500 text-white" : "bg-white text-gray-500"
                    }`}
                    style={{ wordWrap: "break-word" }}
                  >
                    {msg.text}
                    {msg.file && (
                      <div>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 border-b"
                          href={`http://localhost:5003/uploads/${msg.file}`}
                        >
                          {msg.file}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={divUnderMsg}></div>
            </div>
          )}
        </div>
        {!!selectedUserId && (
          <form
            className="flex gap-2 mx-2 pt-2"
            onSubmit={(e) => sendMessage(e)}
            encType="multipart/form-data"
          >
            <input
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              type="text"
              placeholder="Type your message here"
              className="bg-white rounded-sm flex-grow border p-2"
            />
            <label className="bg-blue-200 border p-2 text-gray-700 rounded-sm cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={(e) => sendMessage(e, e.target.files?.[0] || null)}
              />
              Upload
            </label>
            <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
