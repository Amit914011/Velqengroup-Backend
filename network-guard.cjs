const net = require('net');
const isProd = process.env.NODE_ENV === 'production';
const blockExternal = process.env.BLOCK_EXTERNAL === 'true' || !isProd;
const allowedHosts = new Set(
  (process.env.ALLOWED_OUTBOUND_HOSTS || '').split(',').map(h => h.trim().toLowerCase()).filter(Boolean)
);
function isLoopback(host) {
  if (!host) return true;
  const h = String(host).toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '0.0.0.0' || h.startsWith('127.');
}
if (blockExternal) {
  const origConnect = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function (...args) {
    let opt = Array.isArray(args[0]) ? args[0][0] : args[0];
    let host = (typeof opt === 'object' && opt !== null) ? (opt.host || opt.hostname || '127.0.0.1') : (typeof args[1] === 'string' ? args[1] : '127.0.0.1');
    let port = (typeof opt === 'object' && opt !== null) ? (opt.port || 0) : (typeof args[0] === 'number' ? args[0] : 0);
    if (!isLoopback(host) && !allowedHosts.has(String(host).toLowerCase())) {
      console.error(`[network-guard] BLOCKED connection to host: ${host} port: ${port}`);
      const err = Object.assign(new Error(`Blocked by network-guard: ${host}:${port}`), { code: 'ENETUNREACH' });
      process.nextTick(() => { this.emit('error', err); this.destroy(); });
      return this;
    }
    return origConnect.apply(this, args);
  };
}
