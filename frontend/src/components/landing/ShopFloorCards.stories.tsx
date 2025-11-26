import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShopFloorCards } from "./ShopFloorCards";

const meta = {
  title: "Landing/ShopFloorCards",
  component: ShopFloorCards,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ShopFloorCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
