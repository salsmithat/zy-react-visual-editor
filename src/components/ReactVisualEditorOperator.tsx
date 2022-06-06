import { Button, Form, InputNumber } from "antd";
import deepcopy from "deepcopy";
import React, { useEffect, useState } from "react";
import {
  ReactVisualEditorBlock,
  ReactVisualEditorValue,
} from "../utils/ReactVisualEditor.utils";
import "./ReactVisualEditorOperator.css";

export const ReactVisualOperator: React.FC<{
  selectBlock?: ReactVisualEditorBlock;
  value: ReactVisualEditorValue;
  updateValue: (val: ReactVisualEditorValue) => void;
  updateBlock: (
    newBlock: ReactVisualEditorBlock,
    oldBlock: ReactVisualEditorBlock
  ) => void;
}> = (props) => {
  const [editData, setEditData] = useState({} as any);
  const [form] = Form.useForm();
  useEffect(() => {
    methods.reset();
  }, [props.selectBlock]);
  const methods = {
    apply: () => {
      if (props.selectBlock) {
      } else {
        props.updateValue({ container: editData, blocks: props.value.blocks });
      }
    },
    reset: () => {
      let data: any;
      if (props.selectBlock) {
        data = deepcopy(props.selectBlock);
      } else {
        data = deepcopy(props.value.container);
      }
      setEditData(data);
      form.resetFields();
      form.setFieldsValue(data);
    },
    onFormValuesChange: (changeValues: any, values: any) => {
      setEditData({
        ...editData,
        ...values,
      });
    },
  };
  let render: JSX.Element[] = [];
  if (!props.selectBlock) {
    render.push(
      React.cloneElement(
        <>
          <Form.Item label="宽度" name="width">
            <InputNumber step={100} min={0} precision={0}></InputNumber>
          </Form.Item>
          <Form.Item label="高度" name="height">
            <InputNumber step={100} min={0} precision={0}></InputNumber>
          </Form.Item>
        </>,
        {
          key: "container",
        }
      )
    );
  } else {
    render.push(<span key="title">编辑block属性</span>);
  }
  return (
    <div className="react-visual-editor-operator">
      <div className="react-visual-editor-operator-title">
        {props.selectBlock ? "编辑元素" : "编辑容器"}
      </div>
      <Form
        layout="vertical"
        form={form}
        onValuesChange={methods.onFormValuesChange}
      >
        {render}
        <Form.Item>
          <Button
            type="primary"
            style={{ marginRight: 8 }}
            onClick={methods.apply}
          >
            应用
          </Button>
          <Button>取消</Button>
        </Form.Item>
      </Form>
    </div>
  );
};
