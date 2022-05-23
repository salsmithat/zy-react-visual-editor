import { useCommander } from "../plugins/command";
import {
  ReactVisualEditorBlock,
  ReactVisualEditorValue,
} from "../utils/ReactVisualEditor.utils";
import {} from "lodash";
import deepcopy from "deepcopy";

export function useVisualCommand({
  focusData,
  value,
  updateBlocks,
}: {
  focusData: {
    focus: ReactVisualEditorBlock[];
    unfocus: ReactVisualEditorBlock[];
  };
  value: ReactVisualEditorValue;
  updateBlocks: (blocks: ReactVisualEditorBlock[]) => void;
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
  return {
    delete: () => {
      commander.state.commands.delete();
    },
  };
}
