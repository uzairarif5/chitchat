import { ServerResponse, IncomingMessage } from "node:http";
import { send500JSON } from "./send500";
import send200 from "./send200";
import userInfoStore from "../userInfoStore";
import { generalStates, checkUserStates } from "../statesContainer";

export default function checkUser(req: IncomingMessage, res: ServerResponse<IncomingMessage>) {
  if (req.method != "POST") {
    send500JSON(res, {status: generalStates.NOT_POST}); 
    return;
  }

  try {
    var body = '';
    req.on('data', (data) => {
      body += data;
      // Too much POST data, kill the connection!
      if (body.length > 3e6) {
        send500JSON(res, {status: generalStates.TOO_MUCH_DATA});
        req.socket.destroy();
      }
    });
    req.on('end', () => {
      const username = body;
      if (!req.headers.cookie) {
        userInfoStore.removeUser(username); //incase user was created
        send500JSON(res, {status: generalStates.COOKIE_ISSUE}); 
      }
      else onReqDataComplete(req, res, username);
    });

  } 
  catch (err) {
    console.error(err); 
    send500JSON(res, {status: generalStates.SERVER_ERROR});
  }
}

function onReqDataComplete(req: IncomingMessage, res: ServerResponse<IncomingMessage>, username: string) {
  try {
    const cookieData = req.headers.cookie!.split("=");
    if (cookieData![0] !== "sessionToken") 
      send500JSON(res, {status: checkUserStates.SESSION_TOKEN_MISSING});
    else if (!userInfoStore.checkUserInSessionStorage(username)) 
      send500JSON(res, {status: checkUserStates.USER_NOT_IN_SESSION_STORAGE});
    else if (userInfoStore.getSessionToken(username) === cookieData![1])
      send200(res, JSON.stringify({status: checkUserStates.SUCCESS}), 'text/json');
    else 
      send500JSON(res, {status: checkUserStates.SESSION_TOKEN_USERNAME_MISMATCH});
  } 
  catch (err) { 
    console.error(err); 
    userInfoStore.removeUser(username); //incase user was created
    send500JSON(res, {status: generalStates.SERVER_ERROR});
  }
}