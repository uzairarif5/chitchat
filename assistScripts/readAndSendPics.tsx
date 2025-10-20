import { IncomingMessage, ServerResponse } from 'node:http';
import { send500 } from './send500';
import fs from 'node:fs';

export function readAndSendPics(res: ServerResponse<IncomingMessage>, url: string) {
  try {
    const imageData = url.startsWith("/") ? fs.readFileSync(url.substring(1)) : fs.readFileSync(url);
    res.statusCode = 200;
    if (url.endsWith("png")) res.setHeader('Content-Type', 'image/png');
    else if (url.endsWith("jpeg")) res.setHeader('Content-Type', 'image/jpeg');
    else throw new Error("Unknown image type.");
    res.end(imageData);
  } catch (err) { send500(res, err); }
}