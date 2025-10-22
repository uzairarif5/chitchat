import { ServerResponse, IncomingMessage } from "node:http";
import { send500, send500JSON, send500JSONWithErr } from "./send500";
import send200 from "./send200";
import componentsStore from "../componentsStore";
import userInfoStore from "../userInfoStore";
import { createUserStates, generalStates } from "../statesContainer";
import { inDevelopment } from "..";

export default function createUser(req: IncomingMessage, res: ServerResponse<IncomingMessage>) {
  try {
    if (req.method != "POST") throw new Error("Method has to be POST");
    
    var body = '';
    req.on('data', (data) => {
      body += data;
      // Too much POST data, kill the connection!
      if (body.length > 3e6) {
        send500JSON(res, {status: generalStates.TOO_MUCH_DATA});
        req.socket.destroy();
      }
    });
    req.on('end', () => onReqDataComplete(res, JSON.parse(body)));

  } catch (err) { send500(res, err); }
}

function onReqDataComplete(res: ServerResponse<IncomingMessage>, body: JSON) {
  if (!("password" in body && "username" in body && "imgData" in body)) send500JSON(res, {status: generalStates.SERVER_ERROR});
  else if(body.password === process.env.password) {
    try { 
      if(typeof(body.username) !== "string") send500JSON(res, {status: createUserStates.USERNAME_NOT_STRING});
      else if(typeof(body.imgData) !== "string") send500JSON(res, {status: createUserStates.IMGDATA_NOT_STRING});
      else if(userInfoStore.checkUserInImgStorage(body.username)) send500JSON(res, {status: createUserStates.USERNAME_TAKEN});
      else{
        userInfoStore.createUser(body.username, body.imgData);
        const token = userInfoStore.getSessionToken(body.username);
        const oneYear = 365 * 24 * 60 * 60;
        if (inDevelopment) {
          res.setHeader('Set-Cookie', `sessionToken=${token}; Max-Age=${oneYear}; SameSite=Lax; Path=/`);
          console.log(`created user ${body.username} with token ${token}.`);
        }
        else res.setHeader('Set-Cookie', `sessionToken=${token}; Max-Age=${oneYear}; HttpOnly; Secure; SameSite=Strict; Path=/`);
        send200(
          res, 
          JSON.stringify({
            status: createUserStates.SUCCESS, 
            mainEl: componentsStore.getComponent("room"),
          }), 
          'text/json'
        );
      }
    }
    catch (err) { send500JSONWithErr(res, err, {status: generalStates.SERVER_ERROR}); }
  }
  else {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'text/json');
    res.end(JSON.stringify({status: createUserStates.NOT_AUTHORIZED}));
  }
}