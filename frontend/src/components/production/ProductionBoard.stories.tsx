import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProductionBoard } from "./ProductionBoard";
import { Providers } from "@/components/Providers";

const meta = {
  title: "Production/ProductionBoard",
  component: ProductionBoard,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Providers>
        <div className="h-screen p-4 bg-zinc-50">
          <Story />
        </div>
      </Providers>
    ),
  ],
} satisfies Meta<typeof ProductionBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
