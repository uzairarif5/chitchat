import { ServerResponse, IncomingMessage } from "node:http";
import { send500, send500JSON } from "./send500";
import userInfoStore from "../userInfoStore";
import { generalStates } from "../statesContainer";

export default function deleteUser(req: IncomingMessage, res: ServerResponse<IncomingMessage>) {
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
    req.on('end', () => onReqDataComplete(body));

  } catch (err) { send500(res, err); }
}

function onReqDataComplete(username: string) { userInfoStore.removeUser(username); }