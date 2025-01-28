# UDP Client-Server Implementation

## Project Overview
A TypeScript implementation of a UDP client-server system, demonstrating basic network communication using the User Datagram Protocol.

## Technology Choices
- **Language**: TypeScript (chosen for type safety and familiarity)
- **Runtime**: Node.js
- **Key Packages**:
  - `dgram` (Node.js built-in UDP module)
  - `tsx` (for running TypeScript files)
  - `readline` (for handling user input)

## Initial Setup Guidance (provided by Claude)

### Project Structure Setup
```bash
npm init -y
npm install typescript @types/node
npm install -D ts-node
```

### TypeScript Configuration
The `tsconfig.json` was configured with best practices for a Node.js TypeScript project:
- ES2020 as target JavaScript version
- Strict type checking enabled
- Source maps for debugging
- Node.js-style module resolution
- Various safety checks (unused variables, switch fallthrough)

### Key Architectural Differences between Client and Server

Server needs specific port binding:
```typescript
const server = dgram.createSocket('udp4');
server.bind(PORT); // Server NEEDS to bind to a specific port
```

Client uses dynamic port allocation:
```typescript
const client = dgram.createSocket('udp4');
// Client does NOT need to bind! It will automatically get a random available port
```

### Input Handling Implementation
Combined readline module with UDP client:
```typescript
import dgram from 'dgram';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Setup readline question/input handling
function askForInput() {
    rl.question('Enter message: ', (message) => {
        client.send(message, PORT, 'localhost', (err) => {
            if (err) console.error('Failed to send:', err);
            else console.log('Message sent to server');
        });
        askForInput();
    });
}
```

## Implementation Steps

1. **Project Setup**
   - Created new project structure
   - Set up TypeScript configuration with `tsconfig.json`
   - Created separate files for client (`client.ts`) and server (`server.ts`)

2. **Initial Development**
   ```bash
   npm tsx server.ts  # Terminal 1
   npm tsx client.ts  # Terminal 2
   ```

3. **Challenges & Solutions**
   - **Challenge**: "Address in Use" error when running client
   - **Solution**: Removed binding in client code, allowing dynamic port assignment
   - **Key Learning**: UDP clients don't need to bind to specific ports

4. **Input Handling**
   - Implemented readline interface for user input
   - Combined UDP communication with interactive terminal input
   - Successfully established two-way communication

## Project Structure
```
.
├── src/
│   ├── client.ts
│   └── server.ts
├── tsconfig.json
└── package.json
```

## Core Features
- UDP server listening on specific port
- UDP client with dynamic port assignment
- Interactive user input handling
- Two-way message communication

## Running the Project
1. Start the server:
   ```bash
   npm tsx src/server.ts
   ```
2. Start the client in a separate terminal:
   ```bash
   npm tsx src/client.ts
   ```

## Learning Resources
- [Node.js dgram Documentation](https://nodejs.org/api/dgram.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js readline Documentation](https://nodejs.org/api/readline.html)

## Acknowledgments
Special thanks to Claude AI for providing guidance on:
- TypeScript project structure
- UDP client/server architecture differences
- Input handling implementation
- Debugging "Address in Use" errors
- Best practices for TypeScript configuration



### My thoughts while working on this project:

Ok, choosing TypeScript - since it's a language I'm a bit more comfortable with compared to Python. 

I'm going to ask Claude - to give me some guidance on how to set up a general TS project structure for setting up a UDP server and client.


Ok - taking a look at the documentation for NodeJS on the website.

https://nodejs.org/api/dgram.html

Ok - so I'm going to create a new project and install the dgram package.

Looks like the dgram package is built-in to NodeJS, so I can just import it.

So I'm going to create a new file called client.ts and a new file called server.ts.

I'm going to create a new file called tsconfig.json w/ standard configuration. 

I also am going to use a dependency called tsx to run the TypeScript files.

In two separate terminals, I'm going to run the following commands:

npm tsx server.ts
npm tsx client.ts

This should start the server and client.

New error! Server in USE! Ok - took a look back at the docs and instead set up the client to just send a message to the server/not bind. 

Successfully sent message to server!

Now I'm going to add the logic to listen to input from the client. Combining the NodeJS readline package and the TypeScript ReadLine interface.

Successfully received message from server!