import type { Meta, StoryObj } from "@storybook/react-vite";
import { InteractiveDemo } from "./InteractiveDemo";

const meta = {
  title: "Landing/InteractiveDemo",
  component: InteractiveDemo,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InteractiveDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PlasticSelected: Story = {
  play: async () => {
    // Default selection is Plastic, so no action is needed
  },
};

export const MetalSelected: Story = {
  play: async ({ canvasElement }) => {
    const canvas = canvasElement;
    const metalButton = canvas.querySelector("button:nth-of-type(2)") as HTMLButtonElement;
    if (metalButton) {
      metalButton.click();
    }
  },
};
