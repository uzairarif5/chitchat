import { randomBytes } from "crypto";
import { wsServerToClientStates } from "./statesContainer";
import { inDevelopment } from ".";

class UserInfoStore{
  imgStorage: {[key: string]: string};
  sessionStorage: {[key: string]: string}; 
  wsStorage: {[key: string]: WebSocket};
  usersAlive: Set<string>;
  usersAddedLastSixSeconds: Set<string>;

  constructor(){
    this.imgStorage = {}
    this.sessionStorage = {}
    this.wsStorage = {}
    this.usersAddedLastSixSeconds = new Set();
    this.usersAlive = new Set();

    setInterval(()=>{
      this.removeDeadUsers();
      this.usersAlive.clear();
      this.sendPings();
    }, 5000);
  }

  //imgData stuff
  checkUserInImgStorage(username: string) { return username in this.imgStorage; }

  setImgData(username: string, imgData: string) { 
    this.imgStorage[username] = imgData; 
    this.sendDataToOthers(
      username, 
      wsServerToClientStates.USER_UPDATED_IMG, 
      JSON.stringify({username: username, imgData: this.imgStorage[username]})
    );
    if (this.wsStorage[username]) 
      this.wsStorage[username].send(JSON.stringify({status: wsServerToClientStates.IMG_UPDATED_SUCCESSFULLY}));
  }

  getImgData(username:string) {
    if (this.checkUserInImgStorage(username)) return this.imgStorage[username];
    else throw new Error("User not in storage.");
  }
  
  getImgStorageAsString() { return JSON.stringify(this.imgStorage); }

  deleteImg(username: string) { 
    if (this.checkUserInImgStorage(username)) delete this.imgStorage[username]; 
    else throw new Error("User not in storage.");
  }

  getAllUsersInImgStorage(){ return Object.keys(this.imgStorage); }

  //token stuff
  checkUserInSessionStorage(username: string) { return username in this.sessionStorage; }

  setSessionToken(username: string){
    const bytes: Buffer<ArrayBufferLike> = randomBytes(16);
    const token = bytes.toString('hex');
    this.sessionStorage[username] = token;
  };

  getSessionToken(username: string){
    if (!this.sessionStorage[username]) throw new Error(`Username "${username}" does not exist in storage.`);
    return this.sessionStorage[username];
  }

  getAllUsersInSessionStorage(){ return Object.keys(this.sessionStorage); }

  //websocket stuff
  setWebSocket(username: string, ws: WebSocket) { 
    this.wsStorage[username] = ws; 
    this.usersAlive.add(username);
    ws.send(JSON.stringify({status: wsServerToClientStates.NEW_CONNECTION_SUCCESSFUL}));
  }

  sendDataToOthers(callerUsrName: string, status: string, data: string){
    for (let user in this.wsStorage) {
      if (user === callerUsrName) continue;
      else if (this.wsStorage[user]) 
        this.wsStorage[user].send(JSON.stringify({status: status, data: data}));
    }
  }

  sendPings(){
    for (let user in this.wsStorage) {
      if (this.wsStorage[user])
        this.wsStorage[user].send(JSON.stringify({status: wsServerToClientStates.PING}));
    } 
  }

  markUserAsAlive(username: string) { userInfoStore.usersAlive.add(username); }

  removeDeadUsers(){
    for (let user in this.wsStorage) {
      if (!this.usersAlive.has(user)) this.removeUser(user);
    }
  }

  getAllUsersInWsStorage(){ return Object.keys(this.wsStorage); }

  //WebRTC stuff
  passOffer(fromUser: string, toUser: string, offer: Object){
    if (this.usersAlive.has(toUser) && this.wsStorage[toUser] && this.wsStorage[toUser].OPEN) 
      this.wsStorage[toUser].send(JSON.stringify({
        status: wsServerToClientStates.OFFER_FROM_SOMEONE, 
        fromUser: fromUser,
        offer: JSON.stringify(offer)
      }));
  }

  passAnswer(fromUser: string, toUser: string, answer: Object){
    if (this.usersAlive.has(toUser) && this.wsStorage[toUser] && this.wsStorage[toUser].OPEN) 
      this.wsStorage[toUser].send(JSON.stringify({
        status: wsServerToClientStates.ANSWER_FROM_SOMEONE,
        fromUser: fromUser,
        answer: JSON.stringify(answer)
      }));
  }
  
  passCandidate(fromUser: string, toUser: string, candidate: Object){
    this.wsStorage[toUser].send(JSON.stringify({
      status: wsServerToClientStates.PASSING_CANDIDATE,
      fromUser: fromUser,
      candidate: JSON.stringify(candidate)
    }));
  }
  
  //general
  createUser(username: string, imgData: string){
    if (username in this.usersAlive) throw new Error(`User ${username} already exists!`);
    this.usersAddedLastSixSeconds.add(username);
    userInfoStore.setImgData(username, imgData);
    userInfoStore.setSessionToken(username);
    setTimeout(() => {
      if (!(username in this.wsStorage)) this.removeUser(username);
    }, 6000);
  }

  removeUser(username: string) {
    let deleted = false;
    if (username in this.wsStorage) {
      this.wsStorage[username].close();
      delete this.wsStorage[username]; 
      deleted = true;
    }
    if (username in this.imgStorage) {
      delete this.imgStorage[username]; 
      deleted = true;
    } 
    if (username in this.sessionStorage) {
      delete this.sessionStorage[username]; 
      deleted = true;
    }

    if (!deleted) return;

    for (let user in this.wsStorage) {
      if (this.usersAlive.has(user) && this.wsStorage[user] && this.wsStorage[user].OPEN) 
        this.wsStorage[user].send(JSON.stringify({status: wsServerToClientStates.USER_DIED, username: username}));
    }

    if (inDevelopment) console.log(`Deleted user ${username}`);
  }

  getAllAliveUsers(){ return this.usersAlive; }

  doStuff(username: string, command: string) {
    switch (command) {
      case "DISPLAY_ALL_ALIVE_USERS":
        console.log(this.getAllAliveUsers());
        break;
      case "DISPLAY_ALL_USERS_IN_IMG_STORAGE":
        console.log(this.getAllUsersInImgStorage());
        break;
      case "DISPLAY_ALL_USERS_IN_SESSION_STORAGE":
        console.log(this.getAllUsersInSessionStorage());
        break;
      case "DISPLAY_ALL_USERS_IN_WS_STORAGE":
        console.log(this.getAllUsersInWsStorage());
        break;
      default:
        console.log(`Unknown command from ${username}!\nCommand: "${command}"`);
    }
  }
}

const userInfoStore = new UserInfoStore();
export default userInfoStore;