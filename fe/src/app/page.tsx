"use client"
import { UseUserContext } from "@/context/userContext";
import { axiosClient } from "@/lib/axiosClient";
import { useEffect, useState } from "react";
import Chat from "./Chat";

export default function Home() {
  const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');
	const { setUsername: setLoggedInUsername, setId, id } = UseUserContext();

	const handleSubmit = async(ev: any) => {
		ev.preventDefault()
		const url = isLoginOrRegister === 'register' ? 'register' : 'login'
    try {
      const { data } = await axiosClient.post(`/auth/${url}`, { username, password });
      setLoggedInUsername(username)
      setId(data.data.id)
    } catch (error: any) {
      console.log(error.response)
    }
	}

  if(id) {
    return <Chat />
  }

  return (
    <div className="bg-blue-50 h-screen flex items-center">
			<form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
				<input value={username} onChange={(ev) => setUsername(ev.target.value)} type="text" placeholder="username" className="block w-full rounded-sm p-2 mb-2 border" />
				<input value={password} onChange={(ev) => setPassword(ev.target.value)} type="password" placeholder="password" className="block w-full rounded-sm p-2 mb-2 border" />
				<button className="bg-blue-500 text-white block w-full rounded-sm p-2">{isLoginOrRegister === 'register' ? 'Register' : 'Login'}</button>
				<div className="text-center mt-2">
					{isLoginOrRegister === 'register' && (
						<div>
							Already a member?
							<button className="ml-1" onClick={() => setIsLoginOrRegister('login')}>
								Login here
							</button>
						</div>
					)}
					{isLoginOrRegister === 'login' && (
						<div>
							Dont have an account?
							<button className="ml-1" onClick={() => setIsLoginOrRegister('register')}>
								Register
							</button>
						</div>
					)}
				</div>
			</form>
		</div>
  );
}
