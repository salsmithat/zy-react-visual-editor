import { createVisualConfig } from "./ReactVisualEditor.utils";
import { Button, Input } from "antd";

export const visualConfig = createVisualConfig();
visualConfig.registryComponent("text", {
  name: "文本",
  preview: () => <span>预览文本</span>,
  render: () => <span>渲染文本</span>,
});
visualConfig.registryComponent("button", {
  name: "按钮",
  preview: () => <Button type="primary">预览按钮</Button>,
  render: ({ size }) => (
    <Button type="primary" style={size}>
      渲染按钮
    </Button>
  ),
  resize: {
    width: true,
    height: true,
  },
});
visualConfig.registryComponent("input", {
  name: "输入框",
  preview: () => <Input />,
  render: ({ size }) => <Input style={size} />,
  resize: {
    width: true,
  },
});
