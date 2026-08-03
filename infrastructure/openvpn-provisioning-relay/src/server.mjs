import http from 'node:http';
import { createOpenVpnClient, openVpnConfigFromEnv } from './openvpn-client.mjs';
import { createRelayHandler } from './service.mjs';
import { createStateStore } from './state-store.mjs';

const openVpn = createOpenVpnClient(openVpnConfigFromEnv());
const stateStore = createStateStore({ bucket: process.env.IDEMPOTENCY_BUCKET });
const handler = createRelayHandler({
  openVpn,
  stateStore,
  generationEnabled: process.env.PROFILE_GENERATION_ENABLED === 'true'
});
const port = Number(process.env.PORT || 8080);

http.createServer(async (incoming, outgoing) => {
  try {
    const chunks = [];
    let receivedBytes = 0;
    for await (const chunk of incoming) {
      receivedBytes += chunk.length;
      if (receivedBytes > 4096) {
        outgoing.writeHead(413, {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        });
        outgoing.end(JSON.stringify({ error: 'Relay request is too large.' }));
        return;
      }
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);
    const request = new Request(`http://relay.internal${incoming.url || '/'}`, {
      method: incoming.method,
      headers: incoming.headers,
      body: ['GET', 'HEAD'].includes(incoming.method || 'GET') ? undefined : body
    });
    const response = await handler(request);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    outgoing.writeHead(500, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    });
    outgoing.end(JSON.stringify({ error: 'Relay request failed safely.' }));
  }
}).listen(port, '0.0.0.0');
