# ChitChat

This is a personal website for chatting with friends.

## Updates

Versioning is done by using "npm version [new-version] --git-tag-version false".

update 1.4.0:
- Added logo and text in the middle in `room.html`.

update 1.3.8:
- Wait time for websocket to open is now 3 seconds.
- exitroom alert is now defaulted to `true`.

update 1.3.7:
- Fixed overconstrained error, and removed the "websocket open" alert.

update 1.3.6:
- `g_localstream` is set before the `selectionEl`.
- Track is sent to peers after `selectionEl` is set.
- `setRemoteDescription` in `gotOfferFromSomeone` is now awaited.

update 1.3.4 - 1.3.5:
- Improved audio input missing error handling in `setMicSelection`.

update 1.3.0 - 1.3.3:
- Added mobile support.
- Made some css changes.

update 1.2.0:
- Added the option to view and change microphone.

update 1.1.0 - 1.1.3:
- Added `setComponent` function to `ComponentsStoreClass`.
- Websocket will use wss protocol if the app is deployed on render.com.

update 1.0.1 - 1.0.3:
- Using `process.env.PORT` in `index.ts` so my app is deployable in render.

update 1.0.0:
- NODE_ENV with "production" and "development" is now being used correctly. Previously it was flipped.
- Deleted the `DELETED_USER` case from `wsClientToServerStates`. Deleting users will now use http instead of WebSocket.
- Usernames are not editable in `room.html`.
- Password in `home.html` has autocomplete set to `off`.

update 0.1.1 - 0.1.3:
- ".env" is now hidden and the password is changed.

update 0.1.0:
- first commit