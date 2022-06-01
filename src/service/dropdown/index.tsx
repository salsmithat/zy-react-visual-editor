import "./index.css";
import ReactDOM from "react-dom";
import React, { useMemo, useState, useRef, useEffect, useContext } from "react";
import { useCallbackRef } from "../../hooks/useCallbackRef";

interface DropdownOption {
  reference: HTMLElement | { x: number; y: number } | MouseEvent;
  render: () => JSX.Element | JSX.Element[] | React.ReactFragment;
}

const DropdownContext = React.createContext<
  | {
      onClick: () => void;
    }
  | undefined
>(undefined);

const Dropdown: React.FC<{
  option: DropdownOption;
  onRef: (ins: { show: (option: DropdownOption) => void }) => void;
}> = (props) => {
  const elRef = useRef({} as HTMLDivElement);
  const [option, setOption] = useState(props.option);
  const [showFlag, setShowFlag] = useState(false);
  const styles = useMemo(() => {
    let top: number, left: number;
    const { reference } = option;
    if ("addEventListener" in reference) {
      const { top: y, left: x } = reference.getBoundingClientRect();
      top = y;
      left = x;
    } else if ("target" in reference) {
      const { clientX: x, clientY: y } = reference;
      top = y;
      left = x;
    } else {
      top = reference.y;
      left = reference.x;
    }
    return {
      top: `${top}px`,
      left: `${left}px`,
      display: showFlag ? "inline-block" : "none",
    };
  }, [option.reference, showFlag]);
  const methods = {
    show: (opt: DropdownOption) => {
      setOption(opt);
      setShowFlag(true);
    },
    close: () => {
      setShowFlag(false);
    },
  };
  const handler = {
    onClickBody: useCallbackRef((e: MouseEvent) => {
      if (elRef.current.contains(e.target as Node)) {
      } else {
        methods.close();
      }
    }),
    onClickDropdownItem: useCallbackRef(() => {
      methods.close();
    }),
  };
  props.onRef(methods);
  useEffect(() => {
    document.body.addEventListener("click", handler.onClickBody);
    return () => {
      document.body.removeEventListener("click", handler.onClickBody);
    };
  }, []);
  return (
    <DropdownContext.Provider value={{ onClick: handler.onClickDropdownItem }}>
      <div className="dropdown-service" style={styles} ref={elRef}>
        {option.render()}
      </div>
    </DropdownContext.Provider>
  );
};
export const DropdownItem: React.FC<{
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
  icon?: string;
}> = (props) => {
  const dropdown = useContext(DropdownContext);
  const handler = {
    onClick: (e: React.MouseEvent<HTMLDivElement>) => {
      dropdown?.onClick();
      props.onClick && props.onClick(e);
    },
  };
  return (
    <div className="dropdown-item" onClick={handler.onClick}>
      {!!props.icon && <i className={`iconfont ${props.icon}`} />}
      {props.children}
    </div>
  );
};
export const $$dropdown = (() => {
  let ins: any;
  return (option: DropdownOption) => {
    if (!ins) {
      const el = document.createElement("div");
      document.body.appendChild(el);
      ReactDOM.render(
        <Dropdown option={option} onRef={(i) => (ins = i)} />,
        el
      );
    }
    ins.show(option);
  };
})();
