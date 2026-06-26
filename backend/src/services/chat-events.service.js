const clientes = new Map();

export function conectarChat(userId, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  if (!clientes.has(userId)) {
    clientes.set(userId, new Set());
  }

  clientes.get(userId).add(res);
  res.write("event: conectado\ndata: {}\n\n");

  // ponytail: conexiones en memoria; si hay varios backends, mover esto a Redis/pubsub.
  const heartbeat = setInterval(() => res.write(": ping\n\n"), 25000);
  const cerrar = () => {
    clearInterval(heartbeat);
    clientes.get(userId)?.delete(res);
    if (clientes.get(userId)?.size === 0) {
      clientes.delete(userId);
    }
  };

  res.on("close", cerrar);
}

export function emitirChat(userId, event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clientes.get(String(userId)) || []) {
    res.write(payload);
  }
}
