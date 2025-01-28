import dgram from "node:dgram";
import { ReadLine, createInterface } from "node:readline";

const client = dgram.createSocket("udp4");

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.question("Enter message: ", (answer) => {
  client.send(answer, 41234, "localhost", (err) => {
    if (err) {
      console.error(`client send error:\n${err.stack}`);
      client.close();
    }
  });
});


client.on("error", (err) => {
  console.error(`client error:\n${err.stack}`);
  client.close();
});

client.on("message", (msg, rinfo) => {
  console.log(`client got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

client.on("listening", () => {
  const address = client.address();
  console.log(`client listening ${address.address}:${address.port}`);
});
