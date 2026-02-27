# Zenflow Personal Management App

Zenflow is a personal management application designed to enhance wellness through effective time management and mindfulness practices. The app features a dashboard that integrates various tools to help users maintain a balanced lifestyle.

## Features

- **Dashboard**: A central hub that provides quick access to all features, including the Pomodoro Timer, Meditation Timer, and Steps Tracker.
- **Pomodoro Timer**: Implements the Pomodoro technique with customizable session lengths (25/5/15 minutes) to enhance productivity. Users can start, pause, and reset their sessions.
- **Meditation Timer**: Allows users to select preset durations for meditation sessions, complete with a breathing pulse animation to guide mindfulness practices.
- **Steps Tracker**: Enables users to manually log their steps, calories burned, and distance traveled, while also allowing them to set and adjust daily fitness goals.

## Design

The design system is inspired by nature, featuring earthy greens and warm ambers. The application includes rounded card designs, smooth animations, and typography using the DM Sans font to create a calming user experience.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd Zenflow
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

Local dev (after installing Node.js and npm):
```
npm install
npm run dev
```

Backend server (for auth and persisted logs):

1. Install server dependencies (from project root):

```powershell
cd server
npm install
```

2. Start the backend:

```powershell
npm run start --prefix server
```

3. With the server running (default port 4000), the frontend will call the API at `/api/*` for login and persisting logs.

Notes:
- This is a minimal local demo backend. It stores data in `server/data.json` when MongoDB is unavailable and uses JWTs for session tokens.
- For production use, replace with a proper database and secure secrets.

### Database access

- **MongoDB**: connect using the URI you supplied in `MONGODB_URI` (e.g. with `mongo` shell, Compass, or Atlas UI). Documents reside in the `users`, `logs`, and `metas` collections in the `zenflow` database. Each log entry has `{user,date,type,value}` where `type` is `steps`, `pomodoro` or `meditation`.
- **File fallback**: open `server/data.json` directly – it contains `users`, `logs`, and `meta` objects. Logs are nested by user, date and type.

### Tracking & graphs

When you log in, the dashboard displays graphs of your history:

- **Steps**: daily step counts
- **Pomodoro**: minutes logged from completed sessions
- **Meditation**: minutes logged from meditation timers

Each feature automatically sends a log to the server upon completion, and historical data is visualized with line charts above the feature cards.

Database configuration:

- This server can use MongoDB. Set the `MONGODB_URI` environment variable to point to your MongoDB instance (for example, a MongoDB Atlas connection string) before starting the server.
- Example (PowerShell):

```powershell
$env:MONGODB_URI = 'mongodb+srv://<user>:<pass>@cluster0.xyz.mongodb.net/zenflow?retryWrites=true&w=majority'
npm run start --prefix server
```

If `MONGODB_URI` is not provided, the server will attempt to connect to a local MongoDB at `mongodb://127.0.0.1:27017/zenflow`.

Security notes:
- The server uses JWTs; set `ZENFLOW_SECRET` to a secure secret in production.
- For production, use TLS/HTTPS and a managed database (Atlas, AWS DocumentDB, etc.).

## Future Plans

- Implement user authentication to allow personalized experiences.
- Integrate backend services for data persistence and user management.
- Expand features to include additional wellness tools and community support.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.