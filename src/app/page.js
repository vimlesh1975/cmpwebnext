'use client'
import React, { useEffect, useState } from 'react'
import {  useDispatch } from 'react-redux'
import { endpoint } from './components/common'
import OscMessages from './components/OscMessages'
import VideoPlaylist from './components/VideoPlaylist'
const Page = () => {
  const dispatch = useDispatch()
  const [rowCommand, setRowCommand] = useState('play 1-1 red')
  const refreshMedia = async () => {
    fetch("./api/", {
      method: "POST",
      body: JSON.stringify({ action: 'getmedia' }),
      headers: {
        "content-type": "application/json",
      },
    }).then(val => {
      val.json().then(val1 => {
        dispatch({ type: 'CHANGE_MEDIA', payload: val1.data })
      })
    })
  }
  useEffect(() => {
    document.title = 'CMPWebNext'
    fetch('./api/?connect=true').then(refreshMedia());
    
    return () => {
      //  fetch('./api/?connect=false');
    };
  }, [])

  return (<>
    <h1>CMPWebNext 1</h1>
    <button className='rounded-full' onClick={() => fetch('./api/?connect=true')}>Connect</button>
    <button onClick={() => fetch('./api/?connect=false')}>dis Connect</button>
    <button onClick={() => endpoint('clear 1')}>Stop Channel</button>
    {/* <button onClick={() => getMedia({ action: 'getmedia' })}>get all files</button> */}
    <div>
      <input type='text' value={rowCommand} onChange={e => setRowCommand(e.target.value)} />
      <button onClick={() => endpoint(rowCommand)}>Send Command</button>

    </div>
      <OscMessages />
    <div>
      <VideoPlaylist />
    </div>
  </>)
}

export default Page