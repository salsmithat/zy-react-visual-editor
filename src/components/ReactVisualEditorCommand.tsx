import { useRef } from "react";
import { useCommander } from "../plugins/command";
import {
  ReactVisualEditorBlock,
  ReactVisualEditorValue,
} from "../utils/ReactVisualEditor.utils";
import deepcopy from "deepcopy";
import { useCallbackRef } from "../hooks/useCallbackRef";

export function useVisualCommand({
  focusData,
  value,
  updateBlocks,
  dragstart,
  dragend,
}: {
  focusData: {
    focus: ReactVisualEditorBlock[];
    unfocus: ReactVisualEditorBlock[];
  };
  value: ReactVisualEditorValue;
  updateBlocks: (blocks: ReactVisualEditorBlock[]) => void;
  dragstart: { on: (cb: () => void) => void; off: (cb: () => void) => void };
  dragend: { on: (cb: () => void) => void; off: (cb: () => void) => void };
}) {
  const commander = useCommander();
  commander.useRegistry({
    name: "delete",
    keyboard: ["delete", "ctrl+d", "backspace"],
    execute() {
      const before = deepcopy(value.blocks);
      const after = deepcopy(focusData.unfocus);
      // const data=
      return {
        redo: () => {
          updateBlocks(deepcopy(after));
        },
        undo: () => {
          updateBlocks(deepcopy(before));
        },
      };
    },
  });
  //eslint-disable-next-line
  const dragData = useRef({ before: null as null | ReactVisualEditorBlock[] });
  const handler = {
    dragstart: useCallbackRef(
      () => (dragData.current.before = deepcopy(value.blocks))
    ),
    dragend: useCallbackRef(() => commander.state.commands.drag()),
  };
  commander.useRegistry({
    name: "drag",
    init() {
      dragData.current = { before: null };
      dragstart.on(handler.dragstart);
      dragend.on(handler.dragend);
      return () => {
        dragstart.off(handler.dragstart);
        dragend.off(handler.dragend);
      };
    },
    execute: () => {
      let before = deepcopy(dragData.current.before!);
      let after = deepcopy(value.blocks);
      return {
        redo: () => {
          updateBlocks(deepcopy(after));
        },
        undo: () => {
          updateBlocks(deepcopy(before));
        },
      };
    },
  });
  commander.useInit();
  return {
    delete: () => {
      commander.state.commands.delete();
    },
    undo: () => {
      commander.state.commands.undo();
    },
    redo: () => {
      commander.state.commands.redo();
    },
  };
}
