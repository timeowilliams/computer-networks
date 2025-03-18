# UDP Client-Server Implementation

## Project Overview

A TypeScript implementation of a reliable, TCP-like protocol over UDP, extending a basic UDP client-server system. This project emulates a subset of TCP features, including connection establishment, ordered data transfer, acknowledgments, retransmission of lost packets, and connection teardown.

.
├── src/
│ ├── client.ts # UDP client with reliable protocol logic
│ ├── server.ts # UDP server with reliable protocol logic
│ ├── protocol.ts # Utility functions for packet creation and parsing
│ ├── states.ts # State machine definitions for client and server
│ └── mayhem.ts # Functions to simulate packet loss/delay
├── tsconfig.json # TypeScript configuration
└── package.json # Project dependencies and scripts

### Approach to the Problem

To build a reliable protocol over UDP, we extended the existing basic UDP client-server system with the following features:

Connection Establishment: Implemented a 3-step handshake (SYN, SYN-ACK, ACK) using a state machine.
Ordered Data Transfer: Added sequence numbers to segment messages, ensuring correct order with a stop-and-wait protocol.
Acknowledgments: Included acknowledgment numbers in the packet header to confirm receipt.
Retransmission: Simulated packet loss ("mayhem") by randomly dropping packets and implemented retransmission with timeouts.
Connection Teardown: Added a simple 2-step teardown (FIN, ACK) using the state machine.
Readability: Added console print statements to log packet types, states, and transitions for easy debugging and demonstration.

The protocol header is encoded as JSON in the UDP payload, containing type, seq, ack, and data fields. Utility functions handle packet creation, parsing, and state transitions.

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

## Implementation Steps

1. **Project Setup**

   - Extended the existing UDP setup with new files for protocol logic and state management.

2. **Protocol Design**

- Defined a JSON-based header with type, seq, ack, and data fields.

3. **State Machine**

   - Structured connection setup and teardown as finite state machines in states.ts.

4. **Data Transfer**
   Implemented stop-and-wait with sequence numbers and acknowledgments, splitting large messages into segments if needed.

5. **Retransmission**

   - Added timeouts and retransmission logic, with mayhem.ts simulating packet loss.

6. **Logging**
   - Added console.log statements throughout to display packet types, sequence numbers, and state changes.

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

## Screenshots

1. Connection Establishment 

[Connection Establishment](screenshot1.png)

Shows the client sending SYN, server responding with SYN-ACK, and client sending ACK.

2. Data Transfer

Demonstrates sending ASCII text (e.g., "Hello, World!") from client to server, with sequence numbers and acknowledgments printed.

[Data Transfer](screenshot2.png)

3 Connection Teardown

Shows the client or server sending FIN, followed by an ACK, with states transitioning to CLOSED.

[Connection Teardown](screenshot3.png)

## Challenges & Solutions

When I started building my "TCP over UDP" project, I hit a few bumps. First, I got an "Address in Use" error because both my client and server were fighting over the same port, but I learned to let the client pick a random port instead, which fixed it. Then, I struggled with making UDP reliable since it doesn’t naturally handle lost or out-of-order messages—I didn’t know how to add sequence numbers or retransmission. 

I also had trouble combining my simple original client, which just sent messages, with the new fancy code that had a state machine and reliability features. Finally, my handshake got stuck because the client kept waiting for a reply that never came, and it gave up before I could type "Hello, World!". 

With help, I sorted it out: we freed up the ports, added a packet structure and retransmission logic, merged my old and new code by wrapping my input loop in the state machine, and tweaked the handshake so the client wouldn’t wait unnecessarily. Now, I’ve got a working program that reliably sends "Hello, World!" just like the assignment wanted!