import { ServerResponse, IncomingMessage } from "http";

export default function send200(res: ServerResponse<IncomingMessage>, data: string, type: string){
  res.statusCode = 200;
  res.setHeader('Content-Type', type);
  res.end(data);
}