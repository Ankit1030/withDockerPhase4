const { Server } = require('socket.io');

const login = require('../controllers/login');
const {getAllfreeDrivers} = require('../controllers/rides/confirmed_ride')

global.counter = 0;
global.incrementNotification = function() {

    
    global.counter += 1;
    console.log("COUNTER VALUE CHANGED",global.counter);
    return global.counter;
};
global.io;
const initialize = (server) => {

    global.io = new Server(server,{
        cors:{
            origin:'*'
            // origin:['http://localhost:4500','http://localhost:4200'],
            // methods:['GET','POST'],
            // credentials:true
        }
    })

    global.io.on('connection', (socket)=>{
        // console.log("SOCKET",socket);
        console.log("SOCKET SOCKET  SOCKET  SOCKET  SOCKET  SOCKET Connection established--------------****************", socket.id);

        socket.on("getNotification",async (data)=>{
            if(global.counter > 0){
                global.io.emit('setNotification',global.counter)
            }
        })
       
        // 1. send all drivers details of that specific city
        // socket.on("getAllfreeDrivers", async (data)=>{
        //     console.log("getAllfreeDrivers",data);
        //     const result = await getAllfreeDrivers(data)
        //     // console.log("----------------------------------------------------------");
        //     // console.log("SOCKET has listened",result);
        //     // // return
        //     // console.log("----------------------------------------------------------");
        //     io.emit("receiveAllfreeDrivers",result)  
        // })
        
        //2. AssignMe 
        // socket.on("AssignSpecificDriver",async(data)=>{
        //     console.log("SOCKET CONNECTION STARTED----------------------------");
        //     console.log('AssignSpecificDriver',data);
        // })

    })

    
    }
 
    module.exports = { initialize }