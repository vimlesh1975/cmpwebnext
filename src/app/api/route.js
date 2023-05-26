import { CasparCG, CasparCGSocket, Options, AMCP } from 'casparcg-connection';
import dirTree from  "directory-tree";
import { NextResponse } from 'next/server'

var mediaPath = 'c:/casparcg/_media';
var templatePath;
var logPath;

var media = [];

const refreshMedia = () => {
  aa.getCasparCGPaths().then((aa1) => {
      mediaPath = aa1.absoluteMedia;
      templatePath = aa1.absoluteTemplate;
      logPath = aa1.absoluteLog;
      media = []
      var tree = dirTree(mediaPath, {}, (item, PATH, stats) => {
          // console.log(item.path, item.name)
          // console.log(item)
          var itempath = (item.path).substring(mediaPath.length)
          media.push(itempath)
      });
      console.log(media.length)

  }).catch((aa2) => console.log(aa2));
}

var aa;
export const connect = async () => {
  aa = new CasparCG("127.0.0.1", 5250)
  aa.queueMode = Options.QueueMode.SEQUENTIAL;

  aa.onConnectionChanged = () => {
    console.log(aa.connected)
    // io.emit('connectionStatus', (aa.connected).toString())
  }

  aa.onConnected = () => {
    refreshMedia()
    aa.getCasparCGVersion().then((aa1) => {
        console.log('version', aa1)
  
    }).catch((aa2) => console.log(aa2));
  
    // io.emit('connectionStatus', (aa.connected).toString())
  }
}
// GET method
export function GET(req, res) {
  // Handle GET request
  if (req.url === 'http://localhost:3000/api?connect=true') {
    connect();
  }
  if (req.url === 'http://localhost:3000/api?connect=false') {
    aa.disconnect()
  }
  return new Response('')
}
export async function POST(req, res) {
  const body = await req.json()
  console.log(body);
  if (body.action==='endpoint'){
    aa.do(new AMCP.CustomCommand(body.command))
    return new Response('')
  }
  if (body.action==='getmedia'){
    // refreshMedia();
    
      return  NextResponse.json({data:media})
 
   
  }
  
  return new Response('')
}

