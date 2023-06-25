import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/socketProvider'
import ReactPlayer from 'react-player';
import Peer from '../service/Peer';

// make a listener to know someone enters the room

const RoomPage = () => {
    const socket=useSocket();
    const [remoteSocketId,setRemoteSocketId]=useState(null);
    const [myStream,setMyStream]=useState(null);
    const [remoteStream,setRemoteStream]=useState(null);
    const handleCallUser=useCallback(async()=>{
        const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:true})
        const offer=await Peer.getOffer()
        socket.emit("user:offer",{to:remoteSocketId,offer})
        setMyStream(stream)

    },[remoteSocketId,socket])
    const handleJoin=useCallback((data)=>{
        console.log(`${data.email} joined the room`)
        setRemoteSocketId(data.id)
        // handleCallUser()

    },[])
    const handleincomingOffer=useCallback(async({from,offer})=>{
        console.log(`incoming offer from `,from,offer)

        setRemoteSocketId(from)
        const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:true})
        setMyStream(stream)

        const ans=await Peer.getans(offer)
        socket.emit('offer:accept',{to:from,ans})
    },[myStream])

    const sendStreams=useCallback(()=>{
        for(const track of myStream.getTracks()){
            Peer.peer.addTrack(track,myStream)
        }
    },[myStream]);

    const handleRemoteacceptOffer=useCallback(async({from,ans})=>{
        await Peer.setLocalDesc(ans)
        console.log('call accepted from',from,'with ans ',ans)
        sendStreams();
    },[sendStreams])


    const handleNegoNeeded=useCallback(async()=>{
        const offer=await Peer.getOffer()
        socket.emit('nego:needed',{to:remoteSocketId,offer})    

    },[remoteSocketId,socket])

    const handleNego=useCallback(async({from,offer})=>{
        const ans=await Peer.getans(offer)
        socket.emit('nego:done',{to:from,ans})



    },[socket])

    const handleNegoDone=useCallback(async({from,ans})=>{
        await Peer.setLocalDesc(ans)

    },[])

    useEffect(()=>{
        Peer.peer.addEventListener('negotiationneeded',handleNegoNeeded)
        return ()=>{
            Peer.peer.removeEventListener('negotiationneeded',handleNegoNeeded)

        }
    },[handleNegoNeeded])
    
    useEffect(()=>{
        Peer.peer.addEventListener('track',async (ev)=>{
            const RemoteStream=ev.streams;
            console.log('got the tracks')
            setRemoteStream(RemoteStream[0]);
        });
    },[remoteStream])

    useEffect(()=>{
        socket.on('user:joined',handleJoin)
        socket.on('incoming:offer',handleincomingOffer)
        socket.on('remote:offer:accepted',handleRemoteacceptOffer)
        socket.on('nego:needed',handleNego)
        socket.on('nego:done',handleNegoDone)
        return ()=>{
            socket.off('user:joined',handleJoin)
            socket.off('incoming:offer',handleincomingOffer)
            socket.off('remote:offer:accepted',handleRemoteacceptOffer)
            socket.off('nego:needed',handleNego)
            socket.off('nego:done',handleNegoDone)
        }
    },[socket,handleJoin,handleincomingOffer,handleRemoteacceptOffer,handleNego,handleNegoDone])
  return (
    <div>
        <h1>RoomPage</h1>
        <h4>{remoteSocketId?"connected":"no one in room"}</h4>
        {remoteSocketId && <button onClick={handleCallUser}>call</button> }
        {myStream &&
            <button onClick={sendStreams}>Remote video</button>
        }
        {myStream && 
            <>
                <h3>My Stream</h3>
                <ReactPlayer playing muted height="300px" width="500px" url={myStream}/>
            </>
        }
        {remoteStream && 
            <>
                <h3>Remote Stream</h3> 
                <ReactPlayer playing muted height="300px" width="500px" />
            </>
        }

    </div>
  )
}

export default RoomPage