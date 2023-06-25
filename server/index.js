const {Server, Socket}=require('socket.io')
const io=new Server(8000,{
    cors:true
})

const idToEmailMap=new Map();
const emailToIdMap=new Map();
io.on('connection',socket=>{
    console.log('socket connected -----------------------',socket.id)
    socket.on('room:join',data=>{
        console.log(data)
        const {email,room}=data
        idToEmailMap.set(socket.id,email)
        emailToIdMap.set(email,socket.id)
        io.to(room).emit('user:joined',{email:data.email,id:socket.id})
        socket.join(room)
        io.to(socket.id).emit('room:success',{...data,response:'success'})
    })

    socket.on('user:offer',({to,offer})=>{
        console.log('user:offer',offer);
        io.to(to).emit('incoming:offer',{from:socket.id,offer})
    })

    socket.on('offer:accept',({to,ans})=>{
        console.log('offer:accept',ans);
        io.to(to).emit('remote:offer:accepted',{from:socket.id,ans})
    })

    socket.on('nego:needed',({to,offer})=>{
        console.log('nego:needed',offer);
        io.to(to).emit('nego:needed',{from:socket.id,offer})
    })

    socket.on('nego:done',({to,ans})=>{
        console.log('nego:done',ans);
        io.to(to).emit('nego:done',{from:socket.id,ans})
    })
})