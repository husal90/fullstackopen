# Phonebook backend

Backend for the Full Stack Open phonebook (part 3). It serves the React
frontend from `dist/` and the API under `/api/persons`, with data stored in
MongoDB Atlas.

Online application: https://phonebook-backend-6woq.onrender.com

(The free Render instance sleeps when idle, so the first request after a pause can take about a minute.)

## Scripts

- `npm start` – run the server (`PORT` and `MONGODB_URI` come from the environment or `.env`)
- `npm run dev` – run with automatic restart on file changes
- `node mongo.js <password> [<name> <number>]` – list or add entries from the command line

See `.env.example` for the environment variables.
