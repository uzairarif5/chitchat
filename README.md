# ChitChat

This is a personal website for chatting with friends.

## Updates

Versioning is done by using "npm version [new-version] --git-tag-version false".

update 1.0.0:
- NODE_ENV with "production" and "development" is now being used correctly. Previously it was flipped.
- Deleted the `DELETED_USER` case from `wsClientToServerStates`. Deleting users will now use http instead of WebSocket.
- Usernames are not editable in `room.html`.
- Password in `home.html` has autocomplete set to `off`.

update 0.1.1 - 0.1.3:
- ".env" is now hidden and the password is changed.

update 0.1.0:
- first commit