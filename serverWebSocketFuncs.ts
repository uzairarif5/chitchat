import { WebSocketServer } from "ws";
import userInfoStore from "./userInfoStore";
import { IncomingMessage } from "http";
import { wsClientToServerStates, wsServerToClientStates } from "./statesContainer";

export default function addFuncToWWS(wss: WebSocketServer){
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    ws.onerror = console.error;

    ws.onmessage = (event) => {
      let data = event.data;
      let jsonData;
      try{
        //@ts-ignore
        jsonData = JSON.parse(data);
      }
      catch (err){
        console.error(`WebSocketServer; cannot json the input:`,data);
        ws.send(JSON.stringify({status: wsServerToClientStates.ERROR, msg:`Cannot json the input!`}));
        return;
      }
      
      const cookieData = req.headers.cookie!.split("=");
      const wsSTCS = wsServerToClientStates;
      if (cookieData[0] !== "sessionToken") wsSend(ws, wsSTCS.ERROR, "Cookie Error.");
      else if (!("status" in jsonData)) wsSend(ws, wsSTCS.ERROR, "Input does not have 'status' property!");
      else if ("username" in jsonData) {
        try {
          const curToken = userInfoStore.getToken(jsonData.username);
          if (curToken !== cookieData[1]) wsSend(ws, wsSTCS.ERROR, "Cookie-username does not match!");
        }
        catch { wsSend(ws, wsSTCS.ERROR, `Token for "${jsonData.username}" missing in the backend!`); }
      }   
      else wsSend(ws, wsSTCS.ERROR, "Input does not have 'username' property!");

      const wsCTSS = wsClientToServerStates;
      switch (jsonData.status) {
        case wsCTSS.PONG:           userInfoStore.markUserAsAlive(jsonData.username); break;
        case wsCTSS.NEW_CONNECTION: userInfoStore.setWebSocket(jsonData.username, ws); break;
        case wsCTSS.NEW_IMG:        userInfoStore.setImgData(jsonData.username, jsonData.imgData); break;
        case wsCTSS.PASS_OFFER:     userInfoStore.passOffer(jsonData.username, jsonData.toUser, jsonData.offer); break;
        case wsCTSS.PASS_ANSWER:    userInfoStore.passAnswer(jsonData.username, jsonData.toUser, jsonData.answer); break;
        case wsCTSS.PASS_CANDIDATE: userInfoStore.passCandidate(jsonData.username, jsonData.toUser, jsonData.candidate); break;
        case wsCTSS.DO_STUFF:       userInfoStore.doStuff(jsonData.username, jsonData.command); break;
        default: wsSend(ws, wsSTCS.ERROR, "Unknown status!");
      }
    };
  })
}

function wsSend(ws: WebSocket, status: string, msg: string){ ws.send(JSON.stringify({status: status, msg: msg})); }