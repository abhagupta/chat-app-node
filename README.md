# chat-app

## Installation

```
git clone https://github.com/abhagupta/chat-app-node.git
cd chat-app-node
npm install
```

### Set environment variable for mongo
```
CUSTOMCONNSTR_MONGOLAB_URI=<mongo connection url>  // eg. CUSTOMCONNSTR_MONGOLAB_URI=mongodb://localhost:27017/sandbox-chat-box
PORT=<port number>
```

```
npm start
```

Browse to `http://localhost:<port number>`. If no PORT is set, 8000 is default port.

Deployed Heroku app : https://multiroom-chat-app.herokuapp.com/