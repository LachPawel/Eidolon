import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProductionVisual } from "./ProductionVisual";

const meta = {
  title: "Landing/ProductionVisual",
  component: ProductionVisual,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProductionVisual>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
