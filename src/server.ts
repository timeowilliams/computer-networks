import dgram from 'node:dgram';

const PORT = 41234;
const server = dgram.createSocket('udp4');

// Packet interface (matches client)
interface Packet {
  type: 'SYN' | 'ACK' | 'DATA' | 'FIN';
  seq: number;
  ack: number;
  data?: string;
}

// Server state machine
enum ServerState {
  CLOSED = 'CLOSED',
  SYN_RCVD = 'SYN_RCVD',
  ESTABLISHED = 'ESTABLISHED',
  FIN_RCVD = 'FIN_RCVD'
}

let state = ServerState.CLOSED;
let seqNum = 0; // Server's sequence number
let ackNum = 0; // Expected acknowledgment number
let clientAddress: string | undefined;
let clientPort: number | undefined;

server.on('message', (msg, rinfo) => {
  const packet: Packet = JSON.parse(msg.toString());
  console.log(`Server received: ${JSON.stringify(packet)}`);

  switch (state) {
    case ServerState.CLOSED:
      if (packet.type === 'SYN') {
        console.log('State: CLOSED -> SYN_RCVD');
        state = ServerState.SYN_RCVD;
        clientAddress = rinfo.address;
        clientPort = rinfo.port;
        ackNum = packet.seq + 1;

        const synAckPacket: Packet = { type: 'ACK', seq: seqNum, ack: ackNum };
        server.send(JSON.stringify(synAckPacket), rinfo.port, rinfo.address, (err) => {
          if (err) console.error('Send error:', err);
          else console.log(`Server sending: ${JSON.stringify(synAckPacket)}`);
        });
      }
      break;

    case ServerState.SYN_RCVD:
      if (packet.type === 'ACK' && packet.ack === seqNum + 1) {
        console.log('State: SYN_RCVD -> ESTABLISHED');
        state = ServerState.ESTABLISHED;
        seqNum++;
      }
      break;

    case ServerState.ESTABLISHED:
      if (packet.type === 'DATA') {
        console.log(`Received DATA: seq=${packet.seq}, data="${packet.data}"`);
        ackNum = packet.seq + 1;

        const ackPacket: Packet = { type: 'ACK', seq: seqNum, ack: ackNum };
        server.send(JSON.stringify(ackPacket), rinfo.port, rinfo.address, (err) => {
          if (err) console.error('Send error:', err);
          else console.log(`Server sending: ${JSON.stringify(ackPacket)}`);
        });
      } else if (packet.type === 'FIN') {
        console.log('State: ESTABLISHED -> FIN_RCVD');
        state = ServerState.FIN_RCVD;
        ackNum = packet.seq + 1;

        const ackPacket: Packet = { type: 'ACK', seq: seqNum, ack: ackNum };
        server.send(JSON.stringify(ackPacket), rinfo.port, rinfo.address, (err) => {
          if (err) console.error('Send error:', err);
          else console.log(`Server sending: ${JSON.stringify(ackPacket)}`);
        });
        state = ServerState.CLOSED; // Reset for simplicity
        console.log('Connection closed');
      }
      break;

    case ServerState.FIN_RCVD:
      // Already handled FIN, no further action needed
      break;
  }
});

server.on('listening', () => {
  const address = server.address();
  console.log(`Server listening on ${address.address}:${address.port} (State: ${state})`);
});

server.on('error', (err) => {
  console.error(`Server error:\n${err.stack}`);
  server.close();
});

server.bind(PORT);