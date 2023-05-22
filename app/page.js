import React from 'react'

const page = () => {
const connect=async()=>{
   'use server'
}
  return (<>
    <h1>CMPWebNext</h1>
    <button onClick={connect}>Connect</button>
  </>)
}

export default page