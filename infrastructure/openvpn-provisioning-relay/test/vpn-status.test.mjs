import assert from 'node:assert/strict';
import test from 'node:test';
import { createOpenVpnClient } from '../src/openvpn-client.mjs';
import { createRelayHandler } from '../src/service.mjs';

const request = identities => new Request('https://relay.test/v1/vpn-status', {method:'POST',body:JSON.stringify({identities})});
test('concurrent status calls share one read; exact identity filtering; no writes', async () => {
  let reads = 0;
  const handler = createRelayHandler({
    openVpn: {sessions: async () => { reads++; await new Promise(r=>setTimeout(r,10)); return ['muha-epic', 'other-org']; },
      generateProfile: () => assert.fail('must not generate')},
    stateStore: {reserve: () => assert.fail('must not reserve'),mark:()=>assert.fail('must not write')}
  });
  const responses = await Promise.all(Array.from({length:30},()=>handler(request(['muha-epic','muha']))));
  assert.equal(reads,1);
  for(const response of responses) {
    assert.equal(response.status,200);
    const body = await response.json();
    assert.deepEqual(body.sessions,[{identity:'muha-epic',connected:true},{identity:'muha',connected:false}]);
    assert(!JSON.stringify(body).includes('other-org'));
  }
  assert.equal((await handler(request(['../unsafe']))).status,400);
  assert.equal(reads,1);
});
test('failure is unavailable, never disconnected; failures are cached too', async () => {
  let reads=0;
  const handler=createRelayHandler({openVpn:{sessions:async()=>{reads++;throw new Error('sensitive upstream error')}},stateStore:{}});
  for(let n=0;n<4;n++) {
    const result=await handler(request(['muha-epic']));
    assert.equal(result.status,503);
    assert.deepEqual(await result.json(),{error:'VPN_STATUS_UNAVAILABLE'});
  }
  assert.equal(reads,1);
});
test('OpenVPN session adapter only logs in and GETs status, dropping private details', async () => {
  const calls=[];
  const client=createOpenVpnClient({username:'test',password:'test'}, {transport:async request=>{
    calls.push(request);
    return {status:200,body:JSON.stringify(request.path.includes('login')?{auth_token:'test-token'}:{
      vpn_daemons:{daemon1:{}},vpn_clients:[{username:'muha-epic',daemon_id:'daemon1',real_address:'private',commonname:'private-cert'}]
    })};
  }});
  assert.deepEqual(await client.sessions(),['muha-epic']);
  assert.deepEqual(calls.map(c=>c.path),['/api/auth/login/userpassword','/api/vpn/status']);
  assert.equal(calls[1].method,'GET');
});
test('malformed or partial snapshots cannot imply disconnect', async () => {
  for(const payload of [{}, {vpn_clients:[]}, {vpn_clients:[],vpn_daemons:{}},
    {vpn_clients:[{commonname:'muha-epic'}],vpn_daemons:{daemon1:{}}}]) {
    const client=createOpenVpnClient({username:'test',password:'test'}, {transport:async request=>({status:200,
      body:JSON.stringify(request.path.includes('login')?{auth_token:'test'}:payload)})});
    await assert.rejects(client.sessions());
  }
});
