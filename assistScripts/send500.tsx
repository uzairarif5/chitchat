import { ServerResponse, IncomingMessage } from "http";
import { inProduction } from "..";

export function send500(
  res: ServerResponse<IncomingMessage>, 
  err: any, 
  customMessage: string = "error or something"
){
  if (inProduction) console.error(err);
  res.statusCode = 500;
  res.setHeader('Content-Type', 'text/plain');
  res.end(customMessage);
}

export function send500JSONWithErr(res: ServerResponse<IncomingMessage>, err: any, json: Object){
  if (inProduction) console.error(err);
  res.statusCode = 500;
  res.setHeader('Content-Type', 'text/json');
  res.end(JSON.stringify(json));
}

export function send500JSON(res: ServerResponse<IncomingMessage>, json: Object){
  res.statusCode = 500;
  res.setHeader('Content-Type', 'text/json');
  res.end(JSON.stringify(json));
}