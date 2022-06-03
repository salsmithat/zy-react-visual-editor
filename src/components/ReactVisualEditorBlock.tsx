import classNames from "classnames";
import React, { useEffect, useMemo, useRef } from "react";
import { useUpdate } from "../hooks/useUpdate";
import {
  ReactVisualEditorBlock,
  ReactVisualEditorConfig,
} from "../utils/ReactVisualEditor.utils";
import "./ReactVisualEditorBlock.css";

export const ReactVisualBlock: React.FC<{
  block: ReactVisualEditorBlock;
  config: ReactVisualEditorConfig;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onContextMenu?: (e: React.MouseEvent<HTMLDivElement>) => void;
}> = (props) => {
  const { forceUpdate } = useUpdate();
  const styles = useMemo(() => {
    return {
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: `${props.block.zIndex}`,
      opacity: `${props.block.adjustPosition ? "0" : ""}`,
    };
  }, [
    props.block.top,
    props.block.left,
    props.block.adjustPosition,
    props.block.zIndex,
  ]);
  const classes = useMemo(
    () =>
      classNames([
        "react-visual-editor-block",
        {
          "react-visual-editor-block-focus": props.block.focus,
        },
      ]),
    [props.block.focus]
  );
  const component = props.config.componentMap[props.block.componentKey];
  let render: any;
  if (!!component) {
    render = component.render();
  }
  const elRef = useRef({} as HTMLDivElement);
  useEffect(() => {
    if (props.block.adjustPosition) {
      const { top, left } = props.block;
      const { height, width } = elRef.current.getBoundingClientRect();
      props.block.adjustPosition = false;
      props.block.top = top - height / 2;
      props.block.left = left - width / 2;
      props.block.width = elRef.current.offsetWidth;
      props.block.height = elRef.current.offsetHeight;
      forceUpdate();
    }
  }, []);
  return (
    <div
      className={classes}
      ref={elRef}
      style={styles}
      onMouseDown={props.onMouseDown}
      onContextMenu={props.onContextMenu}
    >
      {render}
    </div>
  );
};
