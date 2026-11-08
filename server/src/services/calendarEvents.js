import { EventEmitter } from 'node:events';

const events = new EventEmitter();
events.setMaxListeners(0);

const channel = (hostId, roomId) => `${hostId}:${roomId}`;

export const publishCalendarChange = (hostId, roomId) => {
  if (hostId && roomId) events.emit(channel(hostId, roomId), { roomId: String(roomId) });
};

export const subscribeCalendarChanges = (hostId, roomId, listener) => {
  const name = channel(hostId, roomId);
  events.on(name, listener);
  return () => events.off(name, listener);
};
