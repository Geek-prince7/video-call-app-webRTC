import React, { useCallback, useState,useEffect } from 'react'
import { useSocket } from '../context/socketProvider';
import { useNavigate } from 'react-router-dom';

const Lobby = () => {
    const [email,setEmail]=useState("");
    const [room,setRoom]=useState("");
    const socket=useSocket();
    const navigate=useNavigate();
    const handleSubmit=useCallback((e)=>{
        e.preventDefault();
        socket.emit('room:join',{email,room})
        

        console.log(email,room)
        console.log(socket)
    },[email,room,socket])

    const handleJoinRoom=useCallback((data)=>{
        const {email,room,response}=data
        console.log(`data from server ${email}`)
        navigate(`/room/${room}`)


    },[navigate])

    useEffect(()=>{
        socket.on('room:success',handleJoinRoom);
        return ()=>{
            socket.off('room:success',handleJoinRoom);
        }
    },[socket,handleJoinRoom])
  return (
    <div>
        <h1>
            Lobby
        </h1>
        <form onSubmit={handleSubmit}>
            <label htmlFor='email'>Email ID </label>
            <input 
                type='email' 
                placeholder='enter email...' 
                name='email' id='email' 
                value={email} 
                onChange={e=>setEmail(e.target.value)}
            />
            <br/>
            <label htmlFor='room'>Room </label>
            <input 
                type='text' 
                placeholder='enter room code...' 
                name='room' 
                id='room' 
                value={room} 
                onChange={e=>setRoom(e.target.value)}
            />
            <br/>

            <button type='submit'>join</button>
        </form>
    </div>
  )
}

export default Lobby;