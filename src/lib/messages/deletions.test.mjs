import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { messageSurvives, conversationSurvives } from './deletions.ts';

const marker = { conversation_id: 'chat', message_id: '', through_at: '2026-09-09T00:00:00Z', deleted_at: '2026-09-09T00:01:00Z', entire_conversation: false };
const message = (id, created_at) => ({id, conversation_id: 'chat', created_at});
describe('durable chat deletions', () => {
  it('removes cleared history while preserving messages after the cutoff', () => {
    assert.equal(messageSurvives(message('old', '2026-09-08T00:00:00Z'), [marker]), false);
    assert.equal(messageSurvives(message('new', '2026-09-10T00:00:00Z'), [marker]), true);
  });
  it('rejects deleted messages in inactive conversations and restored caches', () => {
    const item = {...marker, message_id: 'deleted'};
    assert.equal(messageSurvives(message('deleted', '2026-09-10T00:00:00Z'), [item]), false);
    assert.equal(messageSurvives(message('other', '2026-09-10T00:00:00Z'), [item]), true);
  });
  it('group deletion rejects every message, independent of timestamps', () => {
    assert.equal(messageSurvives(message('new', '2026-09-10T00:00:00Z'), [{...marker, entire_conversation: true}]), false);
    assert.equal(messageSurvives({...message('new','2026-09-10T00:00:00Z'),conversation_id:'another'}, [marker]), true);
  });
  it('preserves a message one microsecond after the server cutoff', () => {
    const item = {...marker, through_at: '2026-09-09T00:00:00.123456Z'};
    assert.equal(messageSurvives(message('edge', item.through_at), [item]), false);
    assert.equal(messageSurvives(message('new', '2026-09-09T00:00:00.123457Z'), [item]), true);
  });
  it('does not revive a cleared active sidebar row but accepts a new message', () => {
    assert.equal(conversationSurvives({id:'chat',last_message_at:'2026-09-08T00:00:00Z'}, [marker]), false);
    assert.equal(conversationSurvives({id:'chat',last_message_at:'2026-09-10T00:00:00Z'}, [marker]), true);
  });
});
