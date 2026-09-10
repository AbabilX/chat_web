import assert from "node:assert/strict";
import test from "node:test";
import {
  conversationMatchesName,
  splitConversationSearch,
} from "./conversation-search.ts";

function dm(id, name, extra = {}) {
  return {
    id,
    team_id: "",
    type: "dm",
    is_private: true,
    created_at: "2026-09-01T00:00:00Z",
    unread_count: 0,
    peer_user_id: id,
    peer_user_name: name,
    ...extra,
  };
}

function group(id, name) {
  return {
    id,
    team_id: "",
    type: "group",
    is_private: false,
    created_at: "2026-09-01T00:00:00Z",
    unread_count: 0,
    name,
  };
}

test("name-matched chats stay above message hits and keep input order", () => {
  const conversations = [
    dm("1", "Junayed"),
    dm("2", "Alice"),
    group("3", "Jungle trek"),
  ];
  const hits = {
    2: { snippet: "see you in June", messageId: "m2" },
    3: { snippet: "bring the map", messageId: "m3" },
  };
  const { chats, messages } = splitConversationSearch(
    conversations,
    "Jun",
    (id) => hits[id] ?? null,
  );

  assert.deepEqual(
    chats.map((row) => row.conv.id),
    ["1", "3"],
  );
  assert.deepEqual(
    messages.map((row) => row.conv.id),
    ["2", "3"],
  );
});

test("an empty query returns the idle list as chats, no message section", () => {
  const conversations = [dm("1", "Junayed"), dm("2", "Alice")];
  const { chats, messages } = splitConversationSearch(
    conversations,
    "  ",
    () => ({ snippet: "should not run", messageId: "x" }),
  );
  assert.equal(chats.length, 2);
  assert.equal(messages.length, 0);
});

test("Note to Self matches its title", () => {
  const note = dm("me", "Murad", { is_self: true });
  assert.equal(conversationMatchesName(note, "note"), true);
  assert.equal(conversationMatchesName(note, "xyz"), false);
});
