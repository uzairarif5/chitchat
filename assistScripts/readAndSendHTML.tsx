import { IncomingMessage, ServerResponse } from 'node:http';
import { send500 } from './send500';
import componentsStore from '../componentsStore';
import send200 from './send200';
import { port } from '..';

const inProduction = process.env.NODE_ENV === "production";

export function readAndSendHTML(res: ServerResponse<IncomingMessage>, fileName: string) {
  try {
    let data = componentsStore.getComponent(fileName);
    if (fileName === "home" || fileName === "room") {
      const avatarContainer = componentsStore.getComponent("avatarContainer");
      data = data.replace("%avatarContainer%", avatarContainer);
      const protocol = process.env.PORT ? "wss" : "ws"; // change protocol depending on whether local or on render.com.
      data = data.replace("/*G_SOCKET*/", `g_socket = new WebSocket("${protocol}://localhost:${port}");`);
      if (inProduction) componentsStore.setComponent(fileName, data);
    }
    send200(res, data, 'text/html');
  } catch (err) { send500(res, err); }
}