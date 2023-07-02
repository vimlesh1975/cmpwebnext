import React, {useEffect, useState } from 'react'
import io from "socket.io-client";
import { useDispatch, useSelector } from 'react-redux'

const sectohmsm = (totalSeconds) => {
    if (totalSeconds<0){
      totalSeconds=0
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds % 1) * 1000);
    const hmsms = `${hours}:${minutes}:${seconds}.${milliseconds}`;
    return hmsms; // Output: "0:20:34.560"
  };
const OscMessages = () => {
  const oscMessage = useSelector(state => state.OscMessagedReducer.OscMessage);
  const dispatch = useDispatch()

    useEffect(() => {
        // const socket = new io(); // Connect to the socket.io server

        const socket = new (io)('http://localhost:3000', {
          path: "/api/socket/io",
          addTrailingSlash: false,
        });
        console.log(socket)
          // log socket connection
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
      // setConnected(true);
    });

        // Event listeners for socket events
        socket.on("FromAPI", (data) => {
          // Handle the event data
          // console.log(data)
          // setOscMessage((data))
          dispatch({ type: 'CHANGE_OSCMESSAGES', payload: data })

        });
        // Clean up the socket connection
        return () => {
          socket.disconnect();
        };
      }, [])
  return (
    <div>
      {sectohmsm(parseFloat(oscMessage?.args[1]?.value - oscMessage?.args[0]?.value)?.toFixed(2))}

    </div>
  )
}

export default OscMessages