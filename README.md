


# ✈️ Toy-Whats
A full stack clone of WhatsApp. With encrypted message and a 2FA Auth server!!!
Built with Typescript, NodeJS, Express and React.

### Backend
The backend is using Express and the default NodeJS `crypto` library to generate the Hashes, Salts and some keys during the authentication flow.
For the Two-Factor Authentication, we are using the library `otpauth`, that do the worst part for us, so we just have to generate and save the user secret. 

The Chat is built with Socket.io, and it already is receiving the messages encrypted!

All endpoints are commented and they're inside `backend/src/controllers/`

### Frontend
Very simple frontend, built with React (using Vite) and `react-router-dom` for the route management.
It uses React Context to share commom variables and useful code, like the Authentication context and also the Socket connection and the user chats!

Here we are also doing the encryption.
We are not saving the user keys or nonces anywhere. All these info is generated on the fly, using parameters that are exclusive to the chat and messages.

### Useful Links

AES GCM and Auth Tag in practice: https://crypto.stackexchange.com/questions/101574/how-is-aes-gcm-iv-and-auth-tag-used
