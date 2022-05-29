import {
  createVisualBlock,
  ReactVisualEditorBlock,
  ReactVisualEditorComponent,
  ReactVisualEditorConfig,
  ReactVisualEditorValue,
} from "../utils/ReactVisualEditor.utils";
import "./ReactVisualEditor.css";
import "./iconfont.css";
import React, { useMemo, useRef, useState } from "react";
import { ReactVisualBlock } from "./ReactVisualEditorBlock";
import { useCallbackRef } from "../hooks/useCallbackRef";
import { useVisualCommand } from "./ReactVisualEditorCommand";
import { createEvent } from "../plugins/event";

export const ReactVisualEditor: React.FC<{
  value: ReactVisualEditorValue;
  onChange: (val: ReactVisualEditorValue) => void;
  config: ReactVisualEditorConfig;
}> = (props) => {
  const [preview, setPreview] = useState(false);
  const [editing, setEditing] = useState(false);
  const [dragstart] = useState(() => createEvent());
  const [dragend] = useState(() => createEvent());
  const containerRef = useRef(null as HTMLDivElement | null);
  const updateBlocks = (blocks: ReactVisualEditorBlock[]) => {
    props.onChange({
      ...props.value,
      blocks: [...blocks],
    });
  };

  const focusData = useMemo(() => {
    const focus: ReactVisualEditorBlock[] = [];
    const unfocus: ReactVisualEditorBlock[] = [];
    props.value.blocks.forEach((block) => {
      (block.focus ? focus : unfocus).push(block);
    });
    return {
      focus,
      unfocus,
    };
  }, [props.value.blocks]);
  const clearFocus = (external?: ReactVisualEditorBlock) => {
    (!!external
      ? focusData.focus.filter((item) => item !== external)
      : focusData.focus
    ).forEach((block) => {
      block.focus = false;
    });
    updateBlocks(props.value.blocks);
  };
  const containerStyles = useMemo(() => {
    return {
      height: `${props.value.container.height}px`,
      width: `${props.value.container.width}px`,
    };
  }, [props.value.container.height, props.value.container.width]);
  const dragData = useRef({
    dragComponent: null as null | ReactVisualEditorComponent,
  });
  const block = {
    dragstart: useCallbackRef(
      (
        e: React.DragEvent<HTMLDivElement>,
        dragComponent: ReactVisualEditorComponent
      ) => {
        if (containerRef.current) {
          containerRef.current.addEventListener(
            "dragenter",
            container.dragenter
          );
          containerRef.current.addEventListener("dragover", container.dragover);
          containerRef.current.addEventListener(
            "dragleave",
            container.dragleave
          );
          containerRef.current.addEventListener("drop", container.drop);
          dragData.current.dragComponent = dragComponent;
          dragstart.emit();
        }
      }
    ),
    dragend: useCallbackRef((e: React.DragEvent<HTMLDivElement>) => {
      if (containerRef.current) {
        containerRef.current.removeEventListener(
          "dragenter",
          container.dragenter
        );
        containerRef.current.removeEventListener(
          "dragover",
          container.dragover
        );
        containerRef.current.removeEventListener(
          "dragleave",
          container.dragleave
        );
        containerRef.current.removeEventListener("drop", container.drop);
      }
    }),
  };
  const container = {
    dragenter: useCallbackRef((e: DragEvent) => {
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "move";
      }
    }),
    dragover: useCallbackRef((e: DragEvent) => {
      e.preventDefault();
    }),
    dragleave: useCallbackRef((e: DragEvent) => {
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "none";
      }
    }),
    drop: useCallbackRef((e: DragEvent) => {
      updateBlocks([
        ...props.value.blocks,
        createVisualBlock({
          top: e.offsetY,
          left: e.offsetX,
          component: dragData.current.dragComponent!,
        }),
      ]);
      setTimeout(() => {
        dragend.emit();
      });
    }),
  };
  const mousedownBlock = (
    e: React.MouseEvent<HTMLDivElement>,
    block: ReactVisualEditorBlock
  ) => {
    if (e.shiftKey) {
      if (focusData.focus.length <= 1) {
        block.focus = true;
      } else {
        block.focus = !block.focus;
      }
      updateBlocks(props.value.blocks);
    } else {
      if (!block.focus) {
        block.focus = true;
        clearFocus(block);
      }
    }
    setTimeout(() => {
      blockDragger.innermousedown(e);
    }, 0);
  };
  const mousedownContainer = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) {
      return;
    }
    if (!e.shiftKey) {
      clearFocus();
    }
  };
  const innerDragDate = useRef({
    startX: 0,
    startY: 0,
    startPosArray: [] as {
      top: number;
      left: number;
    }[],
    dragging: false,
  });
  const innermousedown = useCallbackRef(
    (e: React.MouseEvent<HTMLDivElement>) => {
      document.addEventListener("mousemove", innermousemove);
      document.addEventListener("mouseup", innermouseup);
      innerDragDate.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosArray: focusData.focus.map(({ top, left }) => ({
          top,
          left,
        })),
        dragging: false,
      };
    }
  );
  const innermousemove = useCallbackRef((e: MouseEvent) => {
    const { startX, startY, startPosArray } = innerDragDate.current;
    const { clientX: moveX, clientY: moveY } = e;
    const durX = moveX - startX;
    const durY = moveY - startY;
    focusData.focus.forEach((block, index) => {
      const { left, top } = startPosArray[index];
      block.top = top + durY;
      block.left = left + durX;
    });
    updateBlocks(props.value.blocks);
    if (!innerDragDate.current.dragging) {
      innerDragDate.current.dragging = true;
      dragstart.emit();
    }
  });
  const innermouseup = useCallbackRef((e: MouseEvent) => {
    document.removeEventListener("mousemove", innermousemove);
    document.removeEventListener("mouseup", innermouseup);
    if (innerDragDate.current.dragging) {
      dragend.emit();
    }
  });

  const blockDragger = {
    innermousedown,
    innermousemove,
    innermouseup,
  };
  const commander = useVisualCommand({
    value: props.value,
    focusData,
    updateBlocks,
    dragstart,
    dragend,
  });
  const buttons: {
    label: string | (() => string);
    icon: string | (() => string);
    tip?: string | (() => string);
    handler: () => void;
  }[] = [
    {
      label: "撤销",
      icon: "icon-back",
      handler: () => {
        commander.undo();
      },
      tip: "ctrl+z",
    },
    {
      label: "重做",
      icon: "icon-forward",
      handler: () => {
        commander.redo();
      },
      tip: "ctrl+y,ctrl+shift+z",
    },
    {
      label: () => (preview ? "编辑" : "预览"),
      icon: () => (preview ? "icon-edit" : "icon-browse"),
      handler: () => {},
    },
    { label: "导入", icon: "icon-Import", handler: () => {} },
    { label: "导出", icon: "icon-export", handler: () => {} },
    {
      label: "置顶",
      icon: "icon-top",
      handler: () => {},
      tip: "ctrl+up",
    },
    {
      label: "置底",
      icon: "icon-bottom",
      handler: () => {},
      tip: "ctrl+down",
    },
    {
      label: "删除",
      icon: "icon-delete",
      handler: () => {
        commander.delete();
      },
      tip: "ctrl+d,backspace,delete",
    },
    { label: "清空", icon: "icon-reset", handler: () => {} },
    { label: "关闭", icon: "icon-close", handler: () => {} },
  ];
  return (
    <div className="react-visual-editor">
      <div className="react-visual-editor-menu">
        {props.config.componentArray.map((component) => {
          return (
            <div
              className="react-visual-editor-menu-item"
              key={component.key}
              draggable
              onDragStart={(e) => block.dragstart(e, component)}
              onDragEnd={block.dragend}
            >
              {component.preview()}
              <div className="react-visual-editor-menu-item-name">
                {component.name}
              </div>
            </div>
          );
        })}
      </div>
      <div className="react-visual-editor-head">
        {buttons.map((btn, index) => {
          const label =
            typeof btn.label === "function" ? btn.label() : btn.label;
          const icon = typeof btn.icon === "function" ? btn.icon() : btn.icon;
          return (
            <div
              key={typeof btn.label === "function" ? btn.label() : btn.label}
              className="react-visual-editor-head-btn"
              onClick={() => btn.handler()}
            >
              <i className={`iconfont ${icon}`} />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
      <div className="react-visual-editor-operator">operator</div>
      <div className="react-visual-editor-body">
        <div
          className="react-visual-editor-container"
          ref={containerRef}
          style={containerStyles}
          onMouseDown={mousedownContainer}
        >
          {props.value.blocks.map((block, index) => {
            return (
              <ReactVisualBlock
                onMouseDown={(e) => mousedownBlock(e, block)}
                config={props.config}
                key={index}
                block={block}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
