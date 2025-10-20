import { createServer } from 'node:http';
import { readAndSendHTML } from './assistScripts/readAndSendHTML';
import { readAndSendPics } from './assistScripts/readAndSendPics';
import createUser from './assistScripts/createUser';
import deleteUser from './assistScripts/deleteUser';
import checkUser from './assistScripts/checkUser';
import send200 from './assistScripts/send200';
import { WebSocketServer } from "ws";
import addFuncToWWS from './serverWebSocketFuncs';
import userInfoStore from './userInfoStore';

// process.env.PORT is defined in render
const hostname = process.env.PORT ? '0.0.0.0' : '127.0.0.1';
export const port = process.env.PORT ? parseInt(process.env.PORT) : 3333;
export const inDevelopment = process.env.NODE_ENV === "development";

const server = createServer((req, res) => {
  let url: string = "";

  if(!req.url) res.end();
  else url = req.url;

  if (inDevelopment) console.log("urlReq:", url);

  if (url === "/") readAndSendHTML(res, 'home');
  else if (url === "/room") readAndSendHTML(res, 'room');
  else if (url === "/favicon.ico") readAndSendPics(res, 'pics/cupWhite.png');
  else if (url === "/createUser") createUser(req, res);
  else if (url === "/deleteUser") deleteUser(req, res);
  else if (url === "/checkUser") checkUser(req, res);
  else if (url === "/getAllUsersPic") send200(res, userInfoStore.getImgStorageAsString(), 'text/json');
  else if (url.includes("pics")) readAndSendPics(res, url);
  else res.end();
});

const socket = new WebSocketServer({ server }, () => console.log("Web socket opened!"));
addFuncToWWS(socket);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});