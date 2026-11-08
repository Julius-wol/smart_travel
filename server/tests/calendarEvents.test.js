import { publishCalendarChange, subscribeCalendarChanges } from '../src/services/calendarEvents.js';

test('calendar updates reach only the matching Host and room', () => {
  const received = [];
  const stop = subscribeCalendarChanges('host-a', 'room-a', event => received.push(event.roomId));
  publishCalendarChange('host-b', 'room-a');
  publishCalendarChange('host-a', 'room-b');
  publishCalendarChange('host-a', 'room-a');
  stop();
  publishCalendarChange('host-a', 'room-a');
  expect(received).toEqual(['room-a']);
});
