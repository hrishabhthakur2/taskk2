"use client"
import { UseUserContext } from '@/context/userContext';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Logo from '@/components/Logo';
import { uniqBy } from 'lodash';
import { axiosClient } from '@/lib/axiosClient';
import Contact from '@/components/Contact';
import Avatar from '@/components/Avatar';
import axios from 'axios';

export default function Chat() {
  const { id, setId, setUsername, username } = UseUserContext();
  const [socket, setSocket] = useState<any>(null);
  const [usersOnline, setUsersOnline] = useState<any[]>([]);
  const [usersOffline, setUsersOffline] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<null | number>(null);
  const [selectedUser, setSelectedUser] = useState<null | { name: string, isOn: boolean }>(null);
  const [newMessageText, setNewMessageText] = useState('');
  const [ messages, setMessage ] = useState<any[]>([]);
  const divUnderMsg = useRef<HTMLDivElement>(null);

  const [filee, setFilee] = useState(null);

  const handleFileChange = (e: any) => {
    setFilee(e.target.files[0]);
  };

  useEffect(() => {
    // Ganti URL dengan URL server Socket.IO Anda
    const socket = io('http://localhost:5003', { withCredentials: true,  });

    // Event yang dijalankan saat koneksi berhasil
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setSocket(socket);
    });

    // Event yang dijalankan saat menerima pesan dari server
    socket.on('message', (data) => {
      console.log('Message from server:', data);
      console.log(data)
      if(data.sender == selectedUserId) {
        setMessage((prev) => ([...prev, { ...data }]))
      }
    });

    socket.on('onlineUsers', (data) => {
      console.log('Online Users:', data.online);
      const onlinePeopleExcOurUser = data.online.filter((item: any) => item.id != id);
      setUsersOnline(onlinePeopleExcOurUser);
    });

    // Event yang dijalankan saat koneksi terputus
    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    // Membersihkan efek pada unmount atau saat komponen dihancurkan
    return () => {
      socket.disconnect();
    };
  }, [id, selectedUserId]);

  const sendMessage = (ev: any, file: any = null) => {
    if (ev) ev.preventDefault();

    if (socket) {
      if (file) {
        axiosClient.post('/upload/file', file).then((res) => {
          socket.emit('message', {
            recipient: selectedUserId,
            text: newMessageText,
            file: res.data.file_name,
          });
          setMessage(prev => {
            return [
              ...prev,
              {
                file: res.data.file_name,
                sender: id,
                recipient: selectedUserId,
                id: Date.now()
              }
            ]
          })
        })
      } else {
        socket.emit('message', {
          recipient: selectedUserId,
          text: newMessageText,
        });

        setNewMessageText('');
        setMessage(prev => ([...prev, { 
          text: newMessageText, 
          sender: id, 
          recipient: selectedUserId, 
          id: Date.now() 
        }]));
      }
    }
  };

  const logout = (e: any) => {
    e.preventDefault();
    axiosClient.post('/auth/logout').then(() => {
      setId(null);
      setUsername(null);
    })
  }

  const sendFile = (e: any) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    sendMessage(null, formData);
  }

  useEffect(() => {
    if(divUnderMsg) {
      divUnderMsg.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages]);

  useEffect(() => {
    axiosClient.get('/people').then(res => {
      const allUsers = res.data;
      const offlineUsers = allUsers.filter((user: any) => !usersOnline.some(onlineUser => onlineUser.id === user.id)).filter((user: any) => user.id != id);
      setUsersOffline(offlineUsers);
    })
  }, [usersOnline, id])


  useEffect(() => {
    if (selectedUserId) {
      axiosClient.get(`/messages/${selectedUserId}`).then((res) => {
        const manipulatedData = res.data.message.map((item: any) => {
          return { ...item, sender: item.sender.id, recipient: item.recipient.id }
        })
        setMessage(manipulatedData);
      });
    }
  }, [selectedUserId]);

  const msgWithoutDupes = uniqBy(messages, 'id')

  return (
    <div className='flex h-screen'>
      <div className="bg-white w-1/3 flex flex-col justify-between">
        <div className='overflow-y-auto'>
          <Logo />
          {usersOnline.map((_) => (
            <Contact 
              key={_.id}  
              online={true}
              username={_.username}
              onClick={() => {
                  setSelectedUserId(_.id)
                  setSelectedUser({
                    name: _.username,
                    isOn: true
                  })
                }
              }
              selected={_.id == selectedUserId}
            />
          ))}
          {usersOffline.map((_) => (
            <Contact 
              key={_.id}  
              online={false}
              username={_.username}
              onClick={() => {
                setSelectedUserId(_.id)
                setSelectedUser({
                  name: _.username,
                    isOn: false
                  })
                }
              }
              selected={_.id == selectedUserId}
            />
          ))}
        </div>
        <div className='border-t-2 py-2 pl-2 pr-4 flex justify-between'>
          <div className='flex bg-blue-500 p-1 px-2 gap-2 rounded-md text-white '>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            <h2 className='capitalize'>{username} <span className='lowercase text-gray-200'>(you)</span></h2>
          </div>
          <button className='text-gray-500' onClick={logout}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-blue-50 w-2/3 p-2 flex flex-col">
        {selectedUser && (
          <div className='w-full bg-white shadow-xs border rounded-md px-2 py-2 gap-2  flex items-center '>
            <Avatar username={selectedUser.name} online={selectedUser.isOn} />
           <span className="text-gray-800 capitalize">{selectedUser.name}</span>
          </div>
        )}
        <div className="flex-grow overflow-y-auto">
          {!selectedUserId && (
            <div className="flex flex-grow h-full item-center items-center justify-center">
              <div className="text-gray-400">&larr; select a person</div>
            </div>
          )}
          {!!selectedUserId && (
            <div className='overflow-y-auto'>
              {msgWithoutDupes.map((msg) => (
                <div key={msg.id} className={`${msg.sender == id ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block text-left max-w-[70%] p-2 my-2 rounded-md ${msg.sender == id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'}`} style={{ wordWrap: 'break-word' }}>
                    {msg.text}
                    {msg.file && (
                        <div className="">
                          <a target="_blank" className="flex items-center gap-1 border-b" href={`http://localhost:5003/uploads/${msg.file}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z" clipRule="evenodd" />
                            </svg>
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
          <form className="flex gap-2 mx-2 pt-2" onSubmit={sendMessage} encType='multipart/form-data'>
            <input value={newMessageText} onChange={(e) => setNewMessageText(e.target.value)} type="text" placeholder="Type your message here" className="bg-white rounded-sm flex-grow border p-2" />
            <label className='bg-blue-200 border p-2 text-gray-700 rounded-sm cursor-pointer'>
              <input onChange={sendFile} type="file" className='hidden' />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
              </svg>
            </label>
            <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
