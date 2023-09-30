


# ✈️ Toy-Whats
A full stack clone of WhatsApp. With encrypted message and a 2FA Auth server!!!
Built with Typescript, NodeJS, Express and React.

### Backend
The backend is using Express and the default NodeJS `crypto` library to generate the Hashes, Salts and some keys during the authentication flow.
For the Two-Factor Authentication, we are using the library `otpauth`, that do the worst part for us, so we just have to generate and save the user secret. 

All endpoints are commented and they're inside `backend/src/controllers/`

### Frontend
Very simple frontend, built with React (using Vite) and `react-router-dom` for the route management.
