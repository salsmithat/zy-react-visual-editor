import { Button, Input, Modal } from "antd";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { defer } from "../../utils/defer";
import "./index.css";

interface DialogServiceOption {
  title?: string;
  message?: string;
  editType?: "input" | "textarea";
  editReadonly?: boolean;
  editValue?: string;
  onConfirm?: (editValue?: string) => void;
  onCancel?: () => void;
  confirmButton?: boolean | string;
  cancelButton?: boolean | string;
}
let ins: any;
const DialogService = (option: DialogServiceOption) => {
  if (!ins) {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const Service: React.FC<{
      option: DialogServiceOption;
      onRef: (ins: { show: (opt: DialogServiceOption) => void }) => void;
    }> = (props) => {
      const [option, setOption] = useState(props.option);
      const [showFlag, setShowFlag] = useState(false);
      const [editValue, setEditValue] = useState("");
      const handler = {
        onCancel: () => {
          !!option.onCancel && option.onCancel();
          methods.close();
        },
        onConfirm: () => {
          !!option.onConfirm && option.onConfirm(editValue);
          methods.close();
        },
      };
      const inputProps = {
        value: editValue,
        onChange: (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        ) => {
          setEditValue(e.target.value);
        },
      };
      const methods = {
        show: (opt: DialogServiceOption) => {
          setOption(opt);
          setEditValue(opt.editValue || "");
          setShowFlag(true);
        },
        close: () => {
          setShowFlag(false);
        },
      };
      props.onRef(methods);
      useEffect(() => {
        methods.show(props.option);
      }, []);
      return (
        <Modal
          maskClosable
          closable
          title={option.title || "系统提示"}
          onCancel={handler.onCancel}
          footer={
            option.confirmButton || option.cancelButton ? (
              <>
                {option.cancelButton && (
                  <Button onClick={handler.onCancel}>取消</Button>
                )}
                {option.confirmButton && (
                  <Button type="primary" onClick={handler.onConfirm}>
                    确定
                  </Button>
                )}
              </>
            ) : null
          }
          visible={showFlag}
        >
          {option.message}
          {option.editType === "input" && <Input {...inputProps} />}
          {option.editType === "textarea" && (
            <Input.TextArea {...inputProps} rows={15} />
          )}
        </Modal>
      );
    };
    ReactDOM.render(
      <Service option={option} onRef={(val) => (ins = val)} />,
      el
    );
  } else {
    ins.show(option);
  }
};
export const $$dialog = {
  textarea: (
    editValue?: string,
    opt?: Omit<DialogServiceOption, "editValue">
  ): Promise<string | undefined> => {
    const dfd = defer<string | undefined>();
    const option: DialogServiceOption = {
      editValue,
      ...(opt || {}),
      editType: "textarea",
      confirmButton: !opt || !opt.editReadonly,
      cancelButton: !opt || !opt.editReadonly,
      onConfirm: (editValue) => {
        dfd.resolve(editValue);
      },
    };
    DialogService(option);
    return dfd.promise;
  },
};
