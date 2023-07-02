import { NextApiResponseServerIO } from "@/types/next";
import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

export const config = {
    api: {
        bodyParser: false,
    },
};

const io = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const path = "/api/socket/io";
        console.log(`New Socket.io server... to ${path}`);
        // adapt Next's net Server to http Server
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
        });


        // append SocketIO server to Next.js socket server response
        res.socket.server.io = io;

        // Additional code for OSC handling
        var osc = require('osc');
        var udpPort = new osc.UDPPort({
            localAddress: "127.0.0.1",
            localPort: 6250,
            metadata: true
        });
        udpPort.open();

        udpPort.on("message", function (oscMessage:any, info:any) {
            if (oscMessage.address === '/channel/1/stage/layer/1/file/time') {
                io.emit("FromAPI", oscMessage);
                // io.emit("FromAPI", sectohmsm(parseFloat(oscMessage.args[1].value - oscMessage.args[0].value).toFixed(2)));
            } else if (oscMessage.address === '/channel/1/stage/layer/1/foreground/file/time') {
                // io.emit("FromAPI", sectohmsm(parseFloat(oscMessage.args[1].value - oscMessage.args[0].value).toFixed(2)));
                io.emit("FromAPI", oscMessage);
            }
        });

    }
    res.end();
};



export default io;