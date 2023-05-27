'use client'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
const Page = () => {
  const dispatch = useDispatch()
  const media = useSelector((state:any) => state.mediaReducer.media)
  const [rowCommand, setRowCommand] = useState('play 1-1 red')

  const sendCommand = async (strObject: Record<string, any>) => {
    fetch("./api/", {
      method: "POST",
      body: JSON.stringify(strObject),
      headers: {
        "content-type": "application/json",
      },
    })
  }
  const getMedia = async (strObject: Record<string, any>) => {
    fetch("./api/", {
      method: "POST",
      body: JSON.stringify(strObject),
      headers: {
        "content-type": "application/json",
      },
    }).then(val => {
     val.json().then(val1 => {
        dispatch({ type: 'CHANGE_MEDIA', payload: val1.data})
      })

    })
  }
  useEffect(() => {
    document.title='CMPWebNext'
    fetch('./api/?connect=true');
    return () => {
       fetch('./api/?connect=false');
    };
  }, [])

  return (<>
    <h1>CMPWebNext</h1>
    <button className='text-lg bg-red-500' onClick={() => fetch('./api/?connect=true')}>Connect</button>
    <button onClick={() => fetch('./api/?connect=false')}>dis Connect</button>
    <button onClick={() => getMedia({ action: 'getmedia' })}>get all files</button>
    <div>
      <input type='text' value={rowCommand} onChange={e=>setRowCommand(e.target.value)} />
    <button onClick={() => sendCommand({ action: 'endpoint', command: rowCommand })}>Send Command</button>

    </div>
    <div style={{maxHeight:800,maxWidth:300, overflow:'auto'}}>
    <table border={1}>
  <tbody >
    {media.map((val:string, i:Number) => {
      return <tr  key={i.toString()}><td title='Click To Play' onClick={() => sendCommand({ action: 'endpoint', command: 'play 1-1 ' + '"' + val.toString().replaceAll('\\', '/') + '"' })}>{val.toString().replaceAll('\\', '/')}</td></tr>
    })}
  </tbody>
</table>
</div>

  </>)
}

export default Page