import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProductionStats } from "./ProductionStats";

const meta = {
  title: "Production/ProductionStats",
  component: ProductionStats,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-6xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProductionStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    stats: {
      activeJobs: 12,
      efficiency: 87,
      bottleneckStage: "Assembly",
      completedJobs: 45,
    },
  },
};

export const HighEfficiency: Story = {
  args: {
    stats: {
      activeJobs: 15,
      efficiency: 98,
      bottleneckStage: "None",
      completedJobs: 120,
    },
  },
};

export const LowEfficiency: Story = {
  args: {
    stats: {
      activeJobs: 8,
      efficiency: 42,
      bottleneckStage: "Quality Check",
      completedJobs: 28,
    },
  },
};

export const NoStats: Story = {
  args: {},
};
