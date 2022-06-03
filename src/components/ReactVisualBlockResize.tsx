import React from "react";
import { ReactVisualEditorComponent } from "../utils/ReactVisualEditor.utils";

export enum ReactVisualBlockResizeDirection {
  start = "start",
  center = "center",
  end = "end",
}
export const ReactVisualBlockResize: React.FC<{
  component: ReactVisualEditorComponent;
  onMouseDown: (
    e: React.MouseEvent<HTMLDivElement>,
    direction: {
      horizontal: ReactVisualBlockResizeDirection;
      vertical: ReactVisualBlockResizeDirection;
    }
  ) => void;
}> = (props) => {
  const render: JSX.Element[] = [];
  if (props.component.resize?.height) {
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-top"
        key="top"
        onMouseDown={(e) =>
          props.onMouseDown(e, {
            horizontal: ReactVisualBlockResizeDirection.center,
            vertical: ReactVisualBlockResizeDirection.start,
          })
        }
      ></div>
    );
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-bottom"
        key="bottom"
        onMouseDown={(e) =>
          props.onMouseDown(e, {
            horizontal: ReactVisualBlockResizeDirection.center,
            vertical: ReactVisualBlockResizeDirection.end,
          })
        }
      ></div>
    );
  }
  if (props.component.resize?.width) {
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-left"
        key="left"
        onMouseDown={(e) =>
          props.onMouseDown(e, {
            horizontal: ReactVisualBlockResizeDirection.start,
            vertical: ReactVisualBlockResizeDirection.center,
          })
        }
      ></div>
    );
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-right"
        key="right"
        onMouseDown={(e) =>
          props.onMouseDown(e, {
            horizontal: ReactVisualBlockResizeDirection.end,
            vertical: ReactVisualBlockResizeDirection.center,
          })
        }
      ></div>
    );
  }
  if (props.component.resize?.width && props.component.resize?.height) {
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-top-left"
        key="top-left"
        onMouseDown={(e) =>
          props.onMouseDown(e, {
            horizontal: ReactVisualBlockResizeDirection.start,
            vertical: ReactVisualBlockResizeDirection.start,
          })
        }
      ></div>
    );
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-top-right"
        key="top-right"
        onMouseDown={(e) =>
          props.onMouseDown(e, {
            horizontal: ReactVisualBlockResizeDirection.end,
            vertical: ReactVisualBlockResizeDirection.start,
          })
        }
      ></div>
    );
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-bottom-left"
        key="bottom-left"
        onMouseDown={(e) =>
          props.onMouseDown(e, {
            horizontal: ReactVisualBlockResizeDirection.start,
            vertical: ReactVisualBlockResizeDirection.end,
          })
        }
      ></div>
    );
    render.push(
      <div
        className="react-visual-block-resize react-visual-block-resize-bottom-right"
        key="bottom-right"
        onMouseDown={(e) =>
          props.onMouseDown(e, {
            horizontal: ReactVisualBlockResizeDirection.end,
            vertical: ReactVisualBlockResizeDirection.end,
          })
        }
      ></div>
    );
  }
  return <>{render}</>;
};
