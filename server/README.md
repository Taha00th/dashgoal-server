# Dash Goal Server

Socket.IO server for Dash Goal multiplayer football game.

## Deploy to Render.com

1. Push this folder to GitHub
2. Go to [Render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Settings:
   - **Name**: dashgoal-server
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Click "Create Web Service"
7. Copy your server URL (e.g., `https://dashgoal-server.onrender.com`)

## Local Testing (Optional)

```bash
npm install
npm start
```

Server will run on `http://localhost:3000`
