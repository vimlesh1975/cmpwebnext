
import React, { useState, useEffect } from 'react'
import { endpoint, videoLayers } from './common'
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { VscTrash, VscMove } from "react-icons/vsc";
import { FaPlay, FaStop } from "react-icons/fa";


const layerNumberList = videoLayers

const VideoPlaylist = () => {
    const oscMessage = useSelector(state => state.OscMessagedReducer.OscMessage);
    const [layerNumber, setLayerNumber] = useState(1);
    const dispatch = useDispatch()
    const media = useSelector(state => state.mediaReducer.media)
    const playlist = useSelector(state => state.playlistReducer.playlist)
    const currentFile = useSelector(state => state.currentFileReducer.currentFile);
    const [currentFileinlist, setCurrentFileinlist] = useState();
    const [filename, setfilename] = useState('amb');
    const [searchText, setSearchText] = useState('');
    const [switched, setSwitched] = useState(false);
    const [playlistMode, setPlaylistMode] = useState(true);


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
    const searchedMedia =
        media?.filter((value) => {
            return (value.toLowerCase().search(searchText.toLowerCase()) > -1)
        })

    const onDragEnd = (result) => {
        const aa = [...playlist]
        if (result.destination != null) {
            aa.splice(result.destination?.index, 0, aa.splice(result.source?.index, 1)[0])
            dispatch({ type: 'CHANGE_PLAYLIST', payload: aa })
            if (currentFile === result.source?.index) {
                dispatch({ type: 'CHANGE_CURRENT_FILE', payload: result.destination?.index })
            }
            else if ((currentFile >= result.destination?.index) && (currentFile < result.source?.index)) {
                dispatch({ type: 'CHANGE_CURRENT_FILE', payload: currentFile + 1 })
            }
            else if ((currentFile <= result.destination?.index) && (currentFile > result.source?.index)) {
                dispatch({ type: 'CHANGE_CURRENT_FILE', payload: currentFile - 1 })
            }
        }
    }

    const deletePage = (e) => {
        const updatedPlaylist = playlist.filter((_, i) => {
            return (parseInt(e.target.getAttribute('key1')) !== i)
        });
        dispatch({ type: 'CHANGE_PLAYLIST', payload: [...updatedPlaylist] })

    }
    const onDoubleClickMediafile = e => {
        const updatedPlaylist = [...playlist];
        updatedPlaylist.push({ fileName: e.target.innerText });


        dispatch({ type: 'CHANGE_PLAYLIST', payload: [...updatedPlaylist] })

    }
    const changelayerNumber = e => {
        setLayerNumber(e.target.value);
    }
    const setfilenameAndCueonPreview = e => {
        setfilename(((e.target.innerText).replaceAll('\\', '/')).split('.')[0]);
    }
    const scrub = val => {
        endpoint(`call 1-1 seek ${val}`)
    }

    const next = (command, newfile) => {
        const newfilename = (playlist[newfile].fileName).replaceAll('\\', '/').split('.')[0];
        setfilename(newfilename);
        dispatch({ type: 'CHANGE_CURRENT_FILE', payload: newfile });
        endpoint(`${command} 1-1 "${newfilename}"`)
    }

    const swithtoNext = () => {
        if (playlistMode) {
            if ((parseFloat(oscMessage?.args[1]?.value - oscMessage?.args[0]?.value)?.toFixed(2)) * 25 < 25) {
                const newfile = (playlist.length - 1 === currentFile) ? 0 : currentFile + 1;
                next('play', newfile);
                setSwitched(true);
                resetSwitch()
            }
        }

    }

    const resetSwitch = () => {
        setTimeout(() => {
            setSwitched(false);
        }, 4000);
    }

    useEffect(() => {
        if (!switched) {
            swithtoNext()
        }
        return () => {
            // clearInterval(timer);
        }
    }, [oscMessage]);

    const filenamewithoutExtension = (filename) => {
        return filename.replaceAll('\\', '/').split('.')[0]
    }

    const startPlaylist = () => {
        endpoint(`play 1-1 "${filenamewithoutExtension(playlist[currentFile].fileName)}"`)
        setPlaylistMode(true)
    }
    const stopPlaylist = () => {
        endpoint(`stop 1-1`)
        setPlaylistMode(false)
    }
    window.chNumber = 1;
    return (<div style={{ display: 'flex' }}>
        <div style={{ border: '1px solid black' }}>
            <b>Layer: </b>  <select onChange={e => changelayerNumber(e)} value={layerNumber}>
                {layerNumberList.map((val) => { return <option key={uuidv4()} value={val}>{val}</option> })}
            </select><br />
            <div style={{ width: 400 }}>
                File: <input style={{ width: 320 }} onChange={(e) => setfilename(e.target.value)} value={filename}></input>
                <br /> <button className='palyButton' onClick={() => endpoint(`load ${window.chNumber}-${layerNumber} "${filename}"`)}>Cue</button>
                <button className='palyButton' onClick={() => endpoint(`play ${window.chNumber}-${layerNumber} "${filename}"`)}> Play</button>
                <button className='stopButton' onClick={() => endpoint(`pause ${window.chNumber}-${layerNumber}`)}>Pause</button>
                <button className='stopButton' onClick={() => endpoint(`resume ${window.chNumber}-${layerNumber}`)}>Resume</button>
                <button className='stopButton' onClick={() => endpoint(`stop ${window.chNumber}-${layerNumber}`)}>Stop</button>
                <button className='palyButton' onClick={() => {
                    endpoint(`play ${window.chNumber}-${layerNumber} "${filename}" loop`);
                    setPlaylistMode(false);
                }}>Loop Play</button>

            </div>
            <button onClick={refreshMedia}>Refresh Media</button>{searchedMedia.length} files<br />
            <span>search:</span><input style={{ width: 320 }} type='text' onChange={e => setSearchText(e.target.value)} />
            <div style={{ maxHeight: '750px', maxWidth: '400px', overflow: 'scroll' }}>
                <table border='1' >
                    <tbody>
                        {searchedMedia.map((val, i) => {
                            return <tr key={uuidv4()}><td
                                style={{ backgroundColor: currentFileinlist === i ? 'green' : 'white', color: currentFileinlist === i ? 'white' : 'black' }}
                                onDoubleClick={e => onDoubleClickMediafile(e)}
                                onClick={(e) => {
                                    setfilenameAndCueonPreview(e)
                                    setCurrentFileinlist(i)
                                }
                                }>{val}</td></tr>
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        <div>
            <b>Playlist Mode<input type='checkbox' checked={playlistMode} onChange={() => setPlaylistMode(!playlistMode)} /></b>{playlistMode.toString()}
            <button onClick={startPlaylist}>Start Playlist</button>
            <button onClick={stopPlaylist}>Stop Playlist</button>

            <br />
            <button onClick={() => {
                const newfile = (playlist.length - 1 === currentFile) ? 0 : currentFile + 1;
                next('load', newfile);
            }}>Next Cue</button>
            <button onClick={() => {
                const newfile = (playlist.length - 1 === currentFile) ? 0 : currentFile + 1;
                next('play', newfile);
            }}>Next Play</button>
            <button onClick={() => {
                const newfile = (currentFile !== 0) ? currentFile - 1 : playlist.length - 1;
                next('load', newfile);
            }}>Previous Cue</button>
            <button onClick={() => {
                const newfile = (currentFile !== 0) ? currentFile - 1 : playlist.length - 1;
                next('play', newfile);
            }}>Previous Play</button>
            <input style={{ width: 400 }} type='range' onChange={e => scrub(e.target.value)} max={(oscMessage?.args[1]?.value * 25).toFixed(2)} value={(oscMessage?.args[0]?.value * 25).toFixed(2)}/>
            <div style={{ height: 850, width: 470, overflow: 'scroll', border: '1px solid black' }}>

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable-1" type="PERSON">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                style={{ backgroundColor: snapshot.isDraggingOver ? 'yellow' : 'yellowgreen' }}
                                {...provided.droppableProps}
                            >
                                <table border='1'>
                                    <tbody>
                                        {playlist?.map((val, i) => {
                                            return (
                                                <Draggable draggableId={"draggable" + i} key={val + i} index={i}>
                                                    {(provided, snapshot) => (
                                                        <tr
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                backgroundColor: snapshot.isDragging ? 'red' : 'white',
                                                                boxShadow: snapshot.isDragging ? "0 0 .4rem #666" : "none",
                                                                // margin: '10px'
                                                            }}
                                                        >
                                                            <td>{i + 1}</td><td {...provided.dragHandleProps}><VscMove /></td>
                                                            <td style={{ minWidth: 250, maxWidth: 250, backgroundColor: currentFile === i ? 'green' : 'white', color: currentFile === i ? 'white' : 'black' }}
                                                                onClick={(e) => {
                                                                    dispatch({ type: 'CHANGE_CURRENT_FILE', payload: i });
                                                                    setfilenameAndCueonPreview(e)

                                                                }} key1={i} key2={'vimlesh'}  >{val.fileName}
                                                            </td>
                                                            <td><button key1={i} onClick={() => {
                                                                endpoint(`load ${window.chNumber}-${layerNumber} "${((val.fileName).replaceAll('\\', '/')).split('.')[0]}"`);
                                                                dispatch({ type: 'CHANGE_CURRENT_FILE', payload: i });
                                                                setfilename((val.fileName).replaceAll('\\', '/').split('.')[0])
                                                            }} >Cue</button></td>
                                                            <td><button key1={i} onClick={() => {
                                                                endpoint(`play ${window.chNumber}-${layerNumber} "${((val.fileName).replaceAll('\\', '/')).split('.')[0]}"`);
                                                                dispatch({ type: 'CHANGE_CURRENT_FILE', payload: i });
                                                                setfilename((val.fileName).replaceAll('\\', '/').split('.')[0])
                                                            }} ><FaPlay /></button></td>
                                                            <td><button key1={i} onClick={() => endpoint(`Stop ${window.chNumber}-${layerNumber}`)} ><FaStop /></button></td>
                                                            <td><button key1={i} onClick={(e) => deletePage(e)} ><VscTrash style={{ pointerEvents: 'none' }} /></button></td>

                                                        </tr>
                                                    )
                                                    }
                                                </Draggable>
                                            )
                                        })}
                                        {provided.placeholder}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

        </div>
    </div>)
}

export default VideoPlaylist
