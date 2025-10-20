import { IncomingMessage, ServerResponse } from 'node:http';
import { send500 } from './send500';
import componentsStore from '../componentsStore';
import send200 from './send200';
import { port } from '..';

export function readAndSendHTML(res: ServerResponse<IncomingMessage>, fileName: string) {
  try {
    let data = componentsStore.getComponent(fileName);
    if (fileName === "home" || fileName === "room") {
      const avatarContainer = componentsStore.getComponent("avatarContainer");
      data = data.replace("%avatarContainer%", avatarContainer);
      data = data.replace("/*G_SOCKET*/", `g_socket = new WebSocket("ws://localhost:${port}");`);
    }
    send200(res, data, 'text/html');
  } catch (err) { send500(res, err); }
}