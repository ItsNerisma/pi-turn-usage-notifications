import assert from "node:assert/strict";
import test from "node:test";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import registerUsageTicker from "../extensions/index.ts";

type TurnEndHandler = (event: { message: { usage: { output: number } }; turnIndex: number }, ctx: {
  mode: string;
  ui: {
    theme: { getFgAnsi: (color: string) => string };
    notify: (message: string, level: string) => void;
  };
}) => Promise<void>;

function usageTicker(): TurnEndHandler {
  let handler: TurnEndHandler | undefined;
  registerUsageTicker({
    on(event, candidate) {
      if (event === "turn_end") handler = candidate as TurnEndHandler;
    },
  } as unknown as ExtensionAPI);
  assert.ok(handler);
  return handler;
}

test("notifies usage only in TUI mode", async () => {
  const handler = usageTicker();
  const notifications: string[] = [];
  const ui = {
    theme: { getFgAnsi: () => "" },
    notify: (message: string) => notifications.push(message),
  };
  const event = { message: { usage: { output: 42 } }, turnIndex: 0 };

  await handler(event, { mode: "rpc", ui });
  assert.deepEqual(notifications, []);

  await handler(event, { mode: "tui", ui });
  assert.equal(notifications.length, 1);
  assert.match(notifications[0], /T1.*OUT 42/);
});
