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
  updateValue,
  dragstart,
  dragend,
}: {
  focusData: {
    focus: ReactVisualEditorBlock[];
    unfocus: ReactVisualEditorBlock[];
  };
  value: ReactVisualEditorValue;
  updateValue: (value: ReactVisualEditorValue) => void;
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
  commander.useRegistry({
    name: "selectAll",
    keyboard: "ctrl+a",
    followQueue: false,
    execute: () => {
      return {
        redo: () => {
          value.blocks.forEach((block) => {
            block.focus = true;
          });
          updateBlocks(value.blocks);
        },
      };
    },
  });
  commander.useRegistry({
    name: "placeTop",
    keyboard: "ctrl+up",
    execute: () => {
      const before = deepcopy(value.blocks);
      const after = deepcopy(
        (() => {
          const { focus, unfocus } = focusData;
          const maxUnFocusIndex = unfocus.reduce((prev, item) => {
            return Math.max(prev, item.zIndex);
          }, -Infinity);
          const minFocusIndex = focus.reduce((prev, item) => {
            return Math.min(prev, item.zIndex);
          }, Infinity);
          let dur = maxUnFocusIndex - minFocusIndex;
          if (dur >= 0) {
            dur++;
            focus.forEach((block) => (block.zIndex += dur));
          }
          return value.blocks;
        })()
      );
      return {
        redo: () => {
          updateBlocks(after);
        },
        undo: () => {
          updateBlocks(before);
        },
      };
    },
  });
  commander.useRegistry({
    name: "placeBottom",
    keyboard: "ctrl+down",
    execute: () => {
      const before = deepcopy(value.blocks);
      const after = deepcopy(
        (() => {
          const { focus, unfocus } = focusData;
          const minUnFocusIndex = unfocus.reduce((prev, item) => {
            return Math.min(prev, item.zIndex);
          }, Infinity);
          const maxFocusIndex = focus.reduce((prev, item) => {
            return Math.max(prev, item.zIndex);
          }, -Infinity);
          const minFocusIndex = focus.reduce((prev, item) => {
            return Math.min(prev, item.zIndex);
          }, Infinity);
          let dur = maxFocusIndex - minUnFocusIndex;
          if (dur >= 0) {
            dur++;
            focus.forEach((block) => (block.zIndex -= dur));
            if (minFocusIndex - dur < 0) {
              dur = dur - minFocusIndex;
              value.blocks.forEach((block) => (block.zIndex += dur));
            }
          }
          return value.blocks;
        })()
      );
      return {
        redo: () => {
          updateBlocks(after);
        },
        undo: () => {
          updateBlocks(before);
        },
      };
    },
  });
  commander.useRegistry({
    name: "clear",
    execute: () => {
      const before = deepcopy(value.blocks);
      const after = deepcopy([]);
      return {
        redo: () => {
          updateBlocks(after);
        },
        undo: () => {
          updateBlocks(before);
        },
      };
    },
  });
  commander.useRegistry({
    name: "updateValue",
    execute: (newVal: ReactVisualEditorValue) => {
      const before = deepcopy(value);
      const after = deepcopy(newVal);
      return {
        redo: () => {
          updateValue(after);
        },
        undo: () => {
          updateValue(before);
        },
      };
    },
  });
  commander.useRegistry({
    name: "updateBlock",
    execute: (
      newBlock: ReactVisualEditorBlock,
      oldBlock: ReactVisualEditorBlock
    ) => {
      const before = deepcopy(value);
      value.blocks.splice(value.blocks.indexOf(oldBlock), 1, newBlock);
      const after = deepcopy(value);
      return {
        redo: () => {
          updateValue(after);
        },
        undo: () => {
          updateValue(before);
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
    placeTop: () => {
      commander.state.commands.placeTop();
    },
    placeBottom: () => {
      commander.state.commands.placeBottom();
    },
    clear: () => {
      commander.state.commands.clear();
    },
    updateValue: (val: ReactVisualEditorValue) => {
      commander.state.commands.updateValue(val);
    },
    updateBlock: (
      newBlock: ReactVisualEditorBlock,
      oldBlock: ReactVisualEditorBlock
    ) => {
      commander.state.commands.updateBlock(newBlock, oldBlock);
    },
  };
}
