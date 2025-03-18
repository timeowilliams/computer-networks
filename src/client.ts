import dgram from 'node:dgram';
import { createInterface } from 'node:readline';

const PORT = 41234;
const HOST = 'localhost';
const client = dgram.createSocket('udp4');
const rl = createInterface({ input: process.stdin, output: process.stdout });

// Packet interface
interface Packet {
  type: 'SYN' | 'ACK' | 'DATA' | 'FIN';
  seq: number;
  ack: number;
  data?: string;
}

// Client state machine
enum ClientState {
  CLOSED = 'CLOSED',
  SYN_SENT = 'SYN_SENT',
  ESTABLISHED = 'ESTABLISHED',
  FIN_SENT = 'FIN_SENT',
  CLOSED_AFTER_FIN = 'CLOSED'
}

let state = ClientState.CLOSED;
let seqNum = 0;
let ackNum = 0;
let retryCount = 0;
const MAX_RETRIES = 3;
const TIMEOUT = 2000;

// Send packet with retransmission
function sendPacket(packet: Packet, callback?: () => void, expectResponse: boolean = true) {
  const msg = JSON.stringify(packet);
  console.log(`Client sending: ${msg}`);
  client.send(msg, PORT, HOST, (err) => {
    if (err) {
      console.error(`Send error: ${err.stack}`);
      client.close();
    }
  });

  if (!expectResponse) {
    if (callback) callback(); // Proceed immediately if no response is expected
    return;
  }

  const timer = setTimeout(() => {
    if (retryCount < MAX_RETRIES) {
      console.log(`Timeout, retransmitting (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      retryCount++;
      sendPacket(packet, callback);
    } else {
      console.log('Max retries reached, giving up');
      client.close();
    }
  }, TIMEOUT);

  client.once('message', (msg) => {
    clearTimeout(timer);
    retryCount = 0;
    handleResponse(msg, callback);
  });
}

// Handle server responses
function handleResponse(msg: Buffer, callback?: () => void) {
  const packet: Packet = JSON.parse(msg.toString());
  console.log(`Client received: ${JSON.stringify(packet)}`);

  switch (state) {
    case ClientState.SYN_SENT:
      if (packet.type === 'ACK' && packet.ack === seqNum + 1) {
        console.log('State: SYN_SENT -> ESTABLISHED');
        state = ClientState.ESTABLISHED;
        seqNum++;
        ackNum = packet.seq + 1;

        // Send final ACK of handshake, no response expected
        const ackPacket: Packet = { type: 'ACK', seq: seqNum, ack: ackNum };
        sendPacket(ackPacket, () => {
          console.log('Connection established');
          askForInput();
        }, false); // Key change: don’t expect a response
      }
      break;

    case ClientState.ESTABLISHED:
      if (packet.type === 'ACK' && packet.ack === seqNum) {
        console.log(`ACK received for seq=${packet.ack}`);
        if (callback) callback();
      }
      break;

    case ClientState.FIN_SENT:
      if (packet.type === 'ACK' && packet.ack === seqNum + 1) {
        console.log('State: FIN_SENT -> CLOSED');
        state = ClientState.CLOSED_AFTER_FIN;
        console.log('Connection closed');
        client.close();
        rl.close();
      }
      break;
  }
}

// Start connection
function establishConnection() {
  console.log('State: CLOSED -> SYN_SENT');
  state = ClientState.SYN_SENT;
  const synPacket: Packet = { type: 'SYN', seq: seqNum, ack: 0 };
  sendPacket(synPacket);
}

// Ask for user input
function askForInput() {
  rl.question('Enter message (or "quit" to disconnect): ', (answer) => {
    if (answer.toLowerCase() === 'quit') {
      console.log('State: ESTABLISHED -> FIN_SENT');
      state = ClientState.FIN_SENT;
      const finPacket: Packet = { type: 'FIN', seq: seqNum, ack: 0 };
      sendPacket(finPacket);
    } else {
      const dataPacket: Packet = { type: 'DATA', seq: seqNum, ack: 0, data: answer };
      sendPacket(dataPacket, askForInput);
      seqNum++;
    }
  });
}

client.on('error', (err) => {
  console.error(`Client error:\n${err.stack}`);
  client.close();
});

client.on('listening', () => {
  const address = client.address();
  console.log(`Client listening ${address.address}:${address.port} (State: ${state})`);
});

establishConnection();