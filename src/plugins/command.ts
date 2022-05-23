import { KeyboardCode } from "./keyboardCode";
import { useCallback, useState, useRef, useEffect } from "react";
export interface CommandExecute {
  undo?: () => void;
  redo: () => void;
}

interface Command {
  name: string;
  keyboard: string | string[];
  execute: (...args: any[]) => CommandExecute;
  init?: () => () => void | undefined;
  followQueue?: boolean;
}

export function useCommander() {
  const [state] = useState(() => ({
    current: -1,
    queue: [] as CommandExecute[],
    commandArray: [] as { current: Command }[],
    commands: {} as Record<string, (...args: any[]) => void>,
    destroyList: [] as (() => void | undefined)[],
  }));
  const useRegistry = useCallback((command: Command) => {
    //eslint-disable-next-line
    const commandRef = useRef(command);
    commandRef.current = command;
    //eslint-disable-next-line
    useState(() => {
      if (state.commands[command.name]) {
        const existIndex = state.commandArray.findIndex(
          (item) => item.current.name === command.name
        );
        state.commandArray.splice(existIndex, 1);
      }
      state.commandArray.push(commandRef);
      state.commands[command.name] = (...args: any[]) => {
        const { redo, undo } = commandRef.current.execute(...args);
        redo();
        if (commandRef.current.followQueue === false) {
          return;
        }
        let { queue, current } = state;
        if (queue.length > 0) {
          queue = queue.slice(0, current + 1);
          state.queue = queue;
        }
        queue.push({ undo, redo });
        state.current = current + 1;
      };
    });
  }, []);
  const [keyboardEvent] = useState(() => {
    const onkeydown = (e: KeyboardEvent) => {
      if (document.activeElement !== document.body) {
        return;
      }
      const { keyCode, shiftKey, altKey, ctrlKey, metaKey } = e;
      let keyString: string[] = [];
      if (ctrlKey || metaKey) keyString.push("ctrl");
      if (shiftKey) keyString.push("shift");
      if (altKey) keyString.push("alt");
      keyString.push(String(KeyboardCode[keyCode]));
      const keyNames = keyString.join("+");
      state.commandArray.forEach(({ current: { keyboard, name } }) => {
        if (!keyboard) {
          return;
        }
        const keys = Array.isArray(keyboard) ? keyboard : [keyboard];
        if (keys.indexOf(keyNames) > -1) {
          state.commands[name]();
          e.stopPropagation();
          e.preventDefault();
        }
      });
    };
    const init = () => {
      window.addEventListener("keydown", onkeydown, true);
      return () => window.removeEventListener("keydown", onkeydown, true);
    };
    return { init };
  });
  const useInit = useCallback(() => {
    //eslint-disable-next-line
    useState(() => {
      state.commandArray.forEach(
        (command) =>
          !!command.current.init &&
          state.destroyList.push(command.current.init())
      );
      state.destroyList.push(keyboardEvent.init());
    });
    //eslint-disable-next-line
    useRegistry({
      name: "undo",
      keyboard: "ctrl+z",
      followQueue: false,
      execute: () => {
        return {
          redo: () => {
            if (state.current === -1) {
              return;
            }
            const queueItem = state.queue[state.current];
            if (!!queueItem) {
              !!queueItem.undo && queueItem.undo();
              state.current--;
            }
          },
        };
      },
    });
    //eslint-disable-next-line
    useRegistry({
      name: "redo",
      keyboard: ["ctrl+y", "ctrl+shift+z"],
      followQueue: false,
      execute: () => {
        return {
          redo: () => {
            if (state.current === -1) {
              return;
            }
            const queueItem = state.queue[state.current + 1];
            if (!!queueItem) {
              queueItem.redo();
              state.current++;
            }
          },
        };
      },
    });
    //eslint-disable-next-line
    useEffect(() => {
      return () => {
        state.destroyList.forEach((fn) => !!fn && fn());
      };
    }, []);
  }, []);
  return {
    state,
    useRegistry,
    useInit,
  };
}
