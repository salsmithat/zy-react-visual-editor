import { Button, Form, InputNumber, Input, Select } from "antd";
import deepcopy from "deepcopy";
import React, { useEffect, useState } from "react";
import {
  ReactVisualEditorBlock,
  ReactVisualEditorConfig,
  ReactVisualEditorValue,
} from "../utils/ReactVisualEditor.utils";
import {
  ReactVisualEditorProps,
  VisualEditorPropsType,
} from "./ReactVisualBlockProps";
import "./ReactVisualEditorOperator.css";

export const ReactVisualOperator: React.FC<{
  selectBlock?: ReactVisualEditorBlock;
  value: ReactVisualEditorValue;
  updateValue: (val: ReactVisualEditorValue) => void;
  updateBlock: (
    newBlock: ReactVisualEditorBlock,
    oldBlock: ReactVisualEditorBlock
  ) => void;
  config: ReactVisualEditorConfig;
}> = (props) => {
  const [editData, setEditData] = useState({} as any);
  const [form] = Form.useForm();
  useEffect(() => {
    methods.reset();
  }, [props.selectBlock]);
  const methods = {
    apply: () => {
      if (props.selectBlock) {
        props.updateBlock(deepcopy(editData), props.selectBlock);
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
    const component = props.config.componentMap[props.selectBlock.componentKey];
    if (component) {
      render.push(
        ...Object.entries(component.props || {}).map(([propName, propConfig]) =>
          renderEditor(propName, propConfig)
        )
      );
    }
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

function renderEditor(propsName: string, propsConfig: ReactVisualEditorProps) {
  switch (propsConfig.type) {
    case VisualEditorPropsType.text:
      return (
        <Form.Item
          label={propsConfig.name}
          name={["props", propsName]}
          key={`props_${propsName}`}
        >
          <Input />
        </Form.Item>
      );
    case VisualEditorPropsType.select:
      return (
        <Form.Item
          label={propsConfig.name}
          name={["props", propsName]}
          key={`props_${propsName}`}
        >
          <Select options={propsConfig.options} />
        </Form.Item>
      );
    case VisualEditorPropsType.color:
      return (
        <Form.Item
          label={propsConfig.name}
          name={["props", propsName]}
          key={`props_${propsName}`}
        >
          <Input type={"color"} />
        </Form.Item>
      );
  }
}
