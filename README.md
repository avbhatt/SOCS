# EECS498: Social Computing Final Project
Web Accessibility Helper
Adit Bhatt, Angelina Fahs, Christina Liu, Ian McKenzie

## Setup
### Prerequisites
- `git`
- `node`
- `npm`
- `web-ext`
  - `npm install -g web-ext`
  - Used to easily run brand new instances of the browser
- [Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/)
  - Not required, but all tests were done on this browser so there may be bugs using other browsers

### Local Testing
1. Clone the entire repository
  - `git clone https://github.com/avbhatt/SOCS.git`
2. Navigate to the root folder `SOCS`
3. To set up the npm dependencies, type `npm install` from the root directory
  - Confirm that all packages from `package.json` were installed correctly
4. Run the node server with `node index.js`
5. Navigate to the `plugin` folder within `SOCS`
6. Begin two instances of the Firefox Developer Edition using `web-ext`
  - `web-ext run --firefox="/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox-bin"`
    - The value for option `--firefox` will change depending on where Firefox Developer Edition is installed
    - This opens the browser with the extension preinstalled as per the `manifest.json`
    - This command does not exit until the browser is closed, so two command terminals are necessary to start two instances
7. Change one browser to helper view via the popup
8. Navigate both browsers to the same website
  - Static webpages such as Wikipedia articles work better
  - Our extension does not work on browser pages that are not websites (the new tab page, setting pages, etc.)
9. Hit *I Need Help* on the User view
  - This should begin a chat with the waiting helper by sending a default message
10. Chat

## Architecture
### Server
#### `index.js`
- Starts `mongo` connection by loading `mongo.js` file
#### `mongo.js`
- Exports functions:
  - `server_init`
    - Connects to `mongo` database (information is below) and initializes `express` server by loading `express.js` file
  - `storeData`
    - Stores entry into database while checking and removing duplicate information
  - `storeDataSimple`
    - Store entry without any checks
  - `deleteData`
    - Delete all that match pattern
  - `updateData`
    - Update one entry that matches pattern with passed in update
  - `updateEntityType`
    - Update entity to User or Helper depending on passed in type
  - `updateEntityWebsite`
    - Update entity's current website
  - `updateEntityStatus`
    - Update entity's chatting or waiting status
  - `updateAnnVote`
    - Change number of up/downvotes of an annotation
  - `removeEntity`
    - Delete all entities associated with certain ID; used on client disconnect
  - `getEntityInfo`
    - Get all information about given entity given ID
  - `getWaitingUser`
    - Checks if users are waiting for help; used when helper appears on page *after* user requests help
  - `getHelper`
    - Get available helper; used when helper is already on page when user requests help
  - `getWebsiteAnnotations`
    - Get sorted list of annotations for a given website
#### `express.js`
- Set up server settings such as ports, parsing, and cors
- Export functions:
  - `init_socket_server`
    - Server responsible for collecting and sending messages
    - Initializes `socket.io` connection
    - Listens for socket messages
      - `join`
        - Received when client first starts
      - `message`
        - Received when client sends messages
        - Checks if this is first connection attempt or if callbackID already present
      - `disconnecting`
        - Automatically received when client begins to disconnect
        - Cleanup procedures by removing entities
      - `close`
        - Received on chat conversations ending
  - `init_http_server`
    - Server responsible for handling HTTP requests
    - Endpoints
      - `/getAnnotations`
        - Replies with `mongo` response to `getWebsiteAnnotations` given website
      - `/postAnnotation`
        - Calls `mongo` function `storeData` with provided annotation
      - `/updateAnnVote`
        - Calls `mongo` function `changeAnnVote`
      - `/getEntityInfo`
        - Replies with `mongo` response to `getEntityInfo` given ID or with "Does Not Exist"
      - `/updateEntityType`
        - Calls `mongo` function `updateEntityType` with provided ID and type
        - Also checks if users waiting for helper on given site
      - `/updateEntityWebsite`
        - Calls `mongo` function `updateEntityWebsite` with provided ID and website
- Helper functions
  - `get_date`
    - Returns well formatted current time
  - `send_msg`
    - Calls `mongo` function `storeData` to save message log
  - `waitingUserCheck`
    - Checks if users are waiting for a helper
    - Triggered when helper joins website
### Extension
All components communicate with `background.js` using the `message` webExtension API.
#### `background.js`
The bulk of the work is done in this script.

- Connects to socket server and emits `join` message to link to specific chat room
- `POST` to `/updateEntityType` to set default type to User
- Handles website updates by `POST` to `/updateEntityWebsite` with new URL
- Handles messages from below extension components
  - `type_change`
    - Used to switch from helper to user view and vice-versa
  - `message_send`
    - Used when send is clicked in chat interface
  - `check_popup`
    - Respond with current entity  type
  - `annotation_submitted`
    - Used when annotation form is submitted
  - `close`
    - Trigger annotation submission
- Handles `socket.io` `message` by sending extension message to `chat`
- Handles annotation submissions by `POST` to `/postAnnotations` with annotation content

#### `popup/options.[js,css,html]`
Dropdown for changing between user and helper. Sends updated type to `background` in message.
#### `sidebar/chat.js`
Handles message input by sending message to `background` dealing with message content. Also handles close button and help button.

Receives messages from `background` with message replies and updates UI to display.
#### `sidebar/annotation-list.js`
Fetches annotations for a website on website updates via `GET` request to `/getAnnotations` and updates the sidebar with these annotations

#### `sidebar/sidebar.[css,html]`
Creates buttons, divs, lists needed for chat and annotation interface. In-line style used to change display types dynamically.

#### `sidebar/submit_annotation.js`
Handles the annotation submission form by sending message to `annotation-form.js` upon clicking the submit annotation button.

#### `annotation-form.js`
Content script that creates the annotation submission form as a modal. Sends the annotation content to `background` in message.

## Resources
[Browser Extensions](https://developer.mozilla.org/en-US/Add-ons/WebExtensions)

[Socket.IO](https://socket.io/)

[ExpressJS](https://expressjs.com/)

## Database Info
- DB name: wah_db
- Username: ianphilm
- URI: [mongodb://server:wah123@ds127044.mlab.com:27044/wah_db](https://mlab.com/databases/wah_db/collections/)
- Documents
  - `active_entities`
  - `message_logs`
  - `annotations`
