import type { Meta, StoryObj } from "@storybook/react-vite";
import { AutoScheduleButton } from "./AutoScheduleButton";

const meta = {
  title: "Production/AutoScheduleButton",
  component: AutoScheduleButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onClick: { action: "clicked" },
    isPending: {
      control: "boolean",
      description: "Whether the button is in a pending/loading state",
    },
  },
} satisfies Meta<typeof AutoScheduleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onClick: () => {},
    isPending: false,
  },
};

export const Pending: Story = {
  args: {
    onClick: () => {},
    isPending: true,
  },
};
