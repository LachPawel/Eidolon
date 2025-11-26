import type { Meta, StoryObj } from "@storybook/react-vite";
import { FieldBuilder } from "./FieldBuilder";

const meta = {
  title: "Articles/FieldBuilder",
  component: FieldBuilder,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onUpdate: () => {},
    onRemove: () => {},
  },
} satisfies Meta<typeof FieldBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    field: {
      fieldKey: "color",
      fieldLabel: "Color",
      fieldType: "text",
      scope: "attribute",
      validation: { required: true },
    },
  },
};

export const Number: Story = {
  args: {
    field: {
      fieldKey: "weight",
      fieldLabel: "Weight",
      fieldType: "number",
      scope: "attribute",
      validation: { required: false, min: 0, max: 100 },
    },
  },
};

export const Select: Story = {
  args: {
    field: {
      fieldKey: "material",
      fieldLabel: "Material",
      fieldType: "select",
      scope: "attribute",
      validation: { required: true, options: ["Plastic", "Metal", "Wood"] },
    },
  },
};
