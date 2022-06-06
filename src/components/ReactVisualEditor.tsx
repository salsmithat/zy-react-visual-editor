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
import classNames from "classnames";
import { $$dialog } from "../service/dialog/dialog";
import { notification } from "antd";
import { $$dropdown, DropdownItem } from "../service/dropdown";
import {
  ReactVisualBlockResize,
  ReactVisualBlockResizeDirection,
} from "./ReactVisualBlockResize";
import deepcopy from "deepcopy";
import { ReactVisualOperator } from "./ReactVisualEditorOperator";

export const ReactVisualEditor: React.FC<{
  value: ReactVisualEditorValue;
  onChange: (val: ReactVisualEditorValue) => void;
  config: ReactVisualEditorConfig;
}> = (props) => {
  const [preview, setPreview] = useState(false);
  const [selectIndex, setSelectIndex] = useState(-1);
  const [mark, setMark] = useState({
    x: null as null | number,
    y: null as null | number,
  });
  const [dragstart] = useState(() => createEvent());
  const [dragend] = useState(() => createEvent());
  const selectBlock = useMemo(() => {
    return props.value.blocks[selectIndex] as
      | ReactVisualEditorBlock
      | undefined;
  }, [props.value.blocks, selectIndex]);
  const containerRef = useRef(null as HTMLDivElement | null);

  const bodyRef = useRef({} as HTMLDivElement);
  const updateBlocks = (blocks: ReactVisualEditorBlock[]) => {
    props.onChange({
      ...props.value,
      blocks: [...blocks],
    });
  };
  const updateValue = (value: ReactVisualEditorValue) => {
    props.onChange({ ...value });
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
  const showBlockData = (block: ReactVisualEditorBlock) => {
    $$dialog.textarea(JSON.stringify(block, null, 4), {
      editReadonly: true,
      title: "节点数据",
    });
  };
  const importBlockData = async (block: ReactVisualEditorBlock) => {
    const text = await $$dialog.textarea("", {
      title: "请输入导入的节点JSON字符串",
    });
    try {
      const data = JSON.parse(text || "");
      commander.updateBlock(data, block);
    } catch (e) {
      console.log(e);
      notification.open({
        message: "导入失败",
        description: "导入的数据格式不正常，请检查！",
      });
    }
  };
  const containerStyles = useMemo(() => {
    return {
      height: `${props.value.container.height}px`,
      width: `${props.value.container.width}px`,
    };
  }, [props.value.container.height, props.value.container.width]);
  const classes = useMemo(() => {
    return classNames([
      "react-visual-editor",
      {
        "react-visual-editor-preview": preview,
      },
    ]);
  }, [preview]);
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
    block: ReactVisualEditorBlock,
    index: number
  ) => {
    if (preview) {
      return;
    }
    if (e.button === 2) {
      return;
    }
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
    setSelectIndex(block.focus ? index : -1);
    setTimeout(() => {
      blockDragger.innermousedown(e, block);
    }, 0);
  };
  const mousedownContainer = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) {
      return;
    }
    if (!e.shiftKey) {
      clearFocus();
      setSelectIndex(-1);
    }
  };
  const innerDragDate = useRef({
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
    body: {
      startScrollTop: 0,
      moveScrollTop: 0,
    },
    shiftKey: false,
    moveX: 0,
    moveY: 0,
    markLines: {
      x: [] as { left: number; showLeft: number }[],
      y: [] as { top: number; showTop: number }[],
    },
    startPosArray: [] as {
      top: number;
      left: number;
    }[],
    dragging: false,
  });
  const handleMouseMove = useCallbackRef(() => {
    let {
      startX,
      startY,
      startPosArray,
      markLines,
      startTop,
      startLeft,
      moveX,
      moveY,
      body,
      shiftKey,
    } = innerDragDate.current;
    moveY = moveY + body.moveScrollTop - body.startScrollTop;
    if (shiftKey) {
      if (Math.abs(moveX - startX) > Math.abs(moveY - startY)) {
        moveY = startY;
      } else {
        moveX = startX;
      }
    }
    const now = {
      mark: {
        x: null as null | number,
        y: null as null | number,
      },
      top: startTop + moveY - startY,
      left: startLeft + moveX - startX,
    };
    for (let i = 0; i < markLines.y.length; i++) {
      const { top, showTop } = markLines.y[i];
      if (Math.abs(now.top - top) < 5) {
        moveY = top + startY - startTop;

        now.mark.y = showTop;
      }
    }
    for (let i = 0; i < markLines.x.length; i++) {
      const { left, showLeft } = markLines.x[i];
      if (Math.abs(now.left - left) < 5) {
        moveX = left + startX - startLeft;
        now.mark.x = showLeft;
      }
    }
    const durX = moveX - startX;
    const durY = moveY - startY;
    focusData.focus.forEach((block, index) => {
      const { left, top } = startPosArray[index];
      block.top = top + durY;
      block.left = left + durX;
    });
    setMark(now.mark);
    updateBlocks(props.value.blocks);
    if (!innerDragDate.current.dragging) {
      innerDragDate.current.dragging = true;
      dragstart.emit();
    }
  });
  const innermousedown = useCallbackRef(
    (e: React.MouseEvent<HTMLDivElement>, block: ReactVisualEditorBlock) => {
      document.addEventListener("mousemove", innermousemove);
      document.addEventListener("mouseup", innermouseup);
      bodyRef.current.addEventListener("scroll", moveScroll);
      innerDragDate.current = {
        startX: e.clientX,
        startY: e.clientY,
        startLeft: block.left,
        startTop: block.top,
        shiftKey: e.shiftKey,
        startPosArray: focusData.focus.map(({ top, left }) => ({
          top,
          left,
        })),
        dragging: false,
        markLines: (() => {
          const x: { left: number; showLeft: number }[] = [];
          const y: { top: number; showTop: number }[] = [];
          const { unfocus } = focusData;
          unfocus.forEach((b) => {
            y.push({ top: b.top, showTop: b.top });
            y.push({
              top: b.top + b.height / 2 - block.height / 2,
              showTop: b.top + b.height / 2,
            });
            y.push({
              top: b.top - block.height,
              showTop: b.top,
            });
            y.push({
              top: b.top + b.height,
              showTop: b.top + b.height,
            });
            y.push({
              top: b.top + b.height - block.height,
              showTop: b.top + b.height,
            });

            x.push({ left: b.left, showLeft: b.left });
            x.push({
              left: b.left + b.width / 2 - block.width / 2,
              showLeft: b.left + b.width / 2,
            });
            x.push({
              left: b.left - block.width,
              showLeft: b.left,
            });
            x.push({
              left: b.left + b.width,
              showLeft: b.left + b.width,
            });
            x.push({
              left: b.left + b.width - block.width,
              showLeft: b.left + b.width,
            });
          });
          return {
            x,
            y,
          };
        })(),
        moveX: e.clientX,
        moveY: e.clientY,
        body: {
          startScrollTop: bodyRef.current.scrollTop,
          moveScrollTop: bodyRef.current.scrollTop,
        },
      };
    }
  );
  const innermousemove = useCallbackRef((e: MouseEvent) => {
    innerDragDate.current.moveX = e.clientX;
    innerDragDate.current.moveY = e.clientY;
    handleMouseMove();
  });
  const innermouseup = useCallbackRef((e: MouseEvent) => {
    document.removeEventListener("mousemove", innermousemove);
    document.removeEventListener("mouseup", innermouseup);
    bodyRef.current.removeEventListener("scroll", moveScroll);
    setMark({ x: null, y: null });
    if (innerDragDate.current.dragging) {
      dragend.emit();
    }
  });
  const moveScroll = useCallbackRef((e: Event) => {
    innerDragDate.current.body.moveScrollTop = (
      e.target as HTMLDivElement
    ).scrollTop;
    handleMouseMove();
  });

  const blockDragger = {
    innermousedown,
    innermousemove,
    innermouseup,
  };
  const resizeData = useRef({
    startX: 0,
    startY: 0,
    block: {} as ReactVisualEditorBlock,
    body: {
      startScrollTop: 0,
      moveScrollTop: 0,
    },
    moveX: 0,
    moveY: 0,
    direction: {
      horizontal: ReactVisualBlockResizeDirection.start,
      vertical: ReactVisualBlockResizeDirection.start,
    },
    startBlock: {
      top: 0,
      left: 0,
      height: 0,
      width: 0,
    },
    dragging: false,
  });
  const handleResizeMove = useCallbackRef(() => {
    if (!resizeData.current.dragging) {
      resizeData.current.dragging = true;
      dragstart.emit();
    }
    let { moveX, moveY, startX, startY, startBlock, direction, block, body } =
      resizeData.current;

    if (direction.horizontal === ReactVisualBlockResizeDirection.center) {
      moveX = startX;
    }
    if (direction.vertical === ReactVisualBlockResizeDirection.center) {
      moveY = startY;
    }
    let durX = moveX - startX;
    let durY = moveY - startY + body.moveScrollTop - body.startScrollTop;
    if (direction.vertical === ReactVisualBlockResizeDirection.start) {
      durY = -durY;
      block.top = startBlock.top - durY;
    }
    if (direction.horizontal === ReactVisualBlockResizeDirection.start) {
      durX = -durX;
      block.left = startBlock.left - durX;
    }
    const width = startBlock.width + durX;
    const height = startBlock.height + durY;
    block.width = width;
    block.height = height;
    block.hasResize = true;
    updateBlocks(props.value.blocks);
  });
  const resizeMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    direction: {
      horizontal: ReactVisualBlockResizeDirection;
      vertical: ReactVisualBlockResizeDirection;
    },
    block: ReactVisualEditorBlock
  ) => {
    e.stopPropagation();
    document.addEventListener("mousemove", resizeMouseMove);
    document.addEventListener("mouseup", resizeMouseUp);
    bodyRef.current.addEventListener("scroll", resizeScroll);
    resizeData.current = {
      block,
      startX: e.clientX,
      startY: e.clientY,
      moveX: e.clientX,
      moveY: e.clientY,
      body: {
        startScrollTop: bodyRef.current.scrollTop,
        moveScrollTop: bodyRef.current.scrollTop,
      },
      direction,
      startBlock: {
        ...deepcopy(block),
      },
      dragging: false,
    };
  };
  const resizeMouseMove = useCallbackRef((e: MouseEvent) => {
    resizeData.current.moveX = e.clientX;
    resizeData.current.moveY = e.clientY;
    handleResizeMove();
  });
  const resizeMouseUp = useCallbackRef((e: MouseEvent) => {
    document.removeEventListener("mousemove", resizeMouseMove);
    document.removeEventListener("mouseup", resizeMouseUp);
    document.removeEventListener("scroll", resizeScroll);
    if (resizeData.current.dragging) {
      setTimeout(() => {
        dragend.emit();
      });
    }
  });
  const resizeScroll = useCallbackRef((e: Event) => {
    resizeData.current.body.moveScrollTop = (
      e.target as HTMLDivElement
    ).scrollTop;
    handleResizeMove();
  });
  const commander = useVisualCommand({
    value: props.value,
    focusData,
    updateBlocks,
    dragstart,
    dragend,
    updateValue,
  });
  const handler = {
    onContextmenuBlock: (
      e: React.MouseEvent<HTMLDivElement>,
      block: ReactVisualEditorBlock
    ) => {
      e.preventDefault();
      e.stopPropagation();
      $$dropdown({
        reference: e.nativeEvent,
        render: () => (
          <>
            <DropdownItem icon="icon-top" onClick={commander.placeTop}>
              置顶节点
            </DropdownItem>
            <DropdownItem icon="icon-bottom" onClick={commander.placeBottom}>
              置底节点
            </DropdownItem>
            <DropdownItem icon="icon-delete" onClick={commander.delete}>
              删除节点
            </DropdownItem>
            <DropdownItem
              icon="icon-export"
              onClick={() => showBlockData(block)}
            >
              查看数据
            </DropdownItem>
            <DropdownItem
              icon="icon-Import"
              onClick={() => {
                importBlockData(block);
              }}
            >
              导入数据
            </DropdownItem>
          </>
        ),
      });
    },
  };
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
      handler: () => {
        setPreview(!preview);
      },
    },
    {
      label: "导入",
      icon: "icon-Import",
      handler: async () => {
        const text = await $$dialog.textarea("", {
          title: "请输入导入的JSON字符串",
        });
        try {
          const data = JSON.parse(text || "");
          commander.updateValue(data);
        } catch (e) {
          console.log(e);
          notification.open({
            message: "导入失败",
            description: "导入的数据格式不正常，请检查！",
          });
        }
      },
    },
    {
      label: "导出",
      icon: "icon-export",
      handler: () => {
        $$dialog.textarea(JSON.stringify(props.value, null, 4), {
          editReadonly: true,
          title: "导出的JSON数据",
        });
      },
    },
    {
      label: "置顶",
      icon: "icon-top",
      handler: () => {
        commander.placeTop();
      },
      tip: "ctrl+up",
    },
    {
      label: "置底",
      icon: "icon-bottom",
      handler: () => {
        commander.placeBottom();
      },
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
    {
      label: "清空",
      icon: "icon-reset",
      handler: () => {
        commander.clear();
      },
    },
    { label: "关闭", icon: "icon-close", handler: () => {} },
  ];
  return (
    <div className={classes}>
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
      {
        <ReactVisualOperator
          updateBlock={commander.updateBlock}
          updateValue={commander.updateValue}
          selectBlock={selectBlock}
          value={props.value}
        />
      }
      <div className="react-visual-editor-body" ref={bodyRef}>
        <div
          className="react-visual-editor-container"
          ref={containerRef}
          style={containerStyles}
          onMouseDown={mousedownContainer}
        >
          {props.value.blocks.map((block, index) => {
            return (
              <ReactVisualBlock
                onMouseDown={(e) => mousedownBlock(e, block, index)}
                config={props.config}
                key={index}
                block={block}
                onContextMenu={(e) => handler.onContextmenuBlock(e, block)}
              >
                {block.focus &&
                  props.config.componentMap[block.componentKey] &&
                  props.config.componentMap[block.componentKey].resize &&
                  (props.config.componentMap[block.componentKey].resize
                    ?.width ||
                    props.config.componentMap[block.componentKey].resize
                      ?.height) && (
                    <ReactVisualBlockResize
                      onMouseDown={(
                        e: React.MouseEvent<HTMLDivElement>,
                        direction: {
                          horizontal: ReactVisualBlockResizeDirection;
                          vertical: ReactVisualBlockResizeDirection;
                        }
                      ) => {
                        resizeMouseDown(e, direction, block);
                      }}
                      component={props.config.componentMap[block.componentKey]}
                    />
                  )}
              </ReactVisualBlock>
            );
          })}
          {mark.x !== null && (
            <div
              className="react-visual-editor-mark-x"
              style={{ left: `${mark.x}px` }}
            ></div>
          )}
          {mark.y !== null && (
            <div
              className="react-visual-editor-mark-y"
              style={{ top: `${mark.y}px` }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
};
