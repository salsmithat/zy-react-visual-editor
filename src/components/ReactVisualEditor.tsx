import {
  createVisualBlock,
  ReactVisualEditorBlock,
  ReactVisualEditorComponent,
  ReactVisualEditorConfig,
  ReactVisualEditorValue,
} from "../utils/ReactVisualEditor.utils";
import "./ReactVisualEditor.css";
import React, { ReactComponentElement, useMemo, useRef } from "react";
import { ReactVisualBlock } from "./ReactVisualEditorBlock";
import { useCallbackRef } from "../hooks/useCallbackRef";

export const ReactVisualEditor: React.FC<{
  value: ReactVisualEditorValue;
  onChange: (val: ReactVisualEditorValue) => void;
  config: ReactVisualEditorConfig;
}> = (props) => {
  const containerRef = useRef({} as HTMLDivElement);
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
        containerRef.current.addEventListener("dragenter", container.dragenter);
        containerRef.current.addEventListener("dragover", container.dragover);
        containerRef.current.addEventListener("dragleave", container.dragleave);
        containerRef.current.addEventListener("drop", container.drop);
        dragData.current.dragComponent = dragComponent;
      }
    ),
    dragend: useCallbackRef((e: React.DragEvent<HTMLDivElement>) => {
      containerRef.current.removeEventListener(
        "dragenter",
        container.dragenter
      );
      containerRef.current.removeEventListener("dragover", container.dragover);
      containerRef.current.removeEventListener(
        "dragleave",
        container.dragleave
      );
      containerRef.current.removeEventListener("drop", container.drop);
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
      props.onChange({
        ...props.value,
        blocks: [
          ...props.value.blocks,
          createVisualBlock({
            top: e.offsetY,
            left: e.offsetX,
            component: dragData.current.dragComponent!,
          }),
        ],
      });
    }),
  };
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
      <div className="react-visual-editor-head">head</div>
      <div className="react-visual-editor-operator">operator</div>
      <div className="react-visual-editor-body">
        <div
          className="react-visual-editor-container"
          ref={containerRef}
          style={containerStyles}
        >
          {props.value.blocks.map((block, index) => {
            return (
              <ReactVisualBlock
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
