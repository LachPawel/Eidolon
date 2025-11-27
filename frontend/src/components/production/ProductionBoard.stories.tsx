import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProductionBoard } from "./ProductionBoard";

const meta = {
  title: "Production/ProductionBoard",
  component: ProductionBoard,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="h-screen p-4 bg-zinc-50">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onAutoSchedule: { action: "auto-schedule" },
    isOptimizing: {
      control: "boolean",
      description: "Whether the board is being optimized",
    },
  },
} satisfies Meta<typeof ProductionBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockEntries = [
  {
    id: 1,
    articleId: 1,
    articleName: "Widget A",
    operatorName: "John Doe",
    quantity: 100,
    status: "PREPARATION" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organization: "Acme Corp",
  },
  {
    id: 2,
    articleId: 2,
    articleName: "Widget B",
    operatorName: "Jane Smith",
    quantity: 150,
    status: "IN PRODUCTION" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organization: "Acme Corp",
  },
  {
    id: 3,
    articleId: 3,
    articleName: "Widget C",
    operatorName: "Bob Johnson",
    quantity: 75,
    status: "READY" as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organization: "Acme Corp",
  },
];

export const Default: Story = {
  args: {
    entries: mockEntries,
    onAutoSchedule: () => {},
    isOptimizing: false,
  },
};

export const Empty: Story = {
  args: {
    entries: [],
    onAutoSchedule: () => {},
    isOptimizing: false,
  },
};

export const Optimizing: Story = {
  args: {
    entries: mockEntries,
    onAutoSchedule: () => {},
    isOptimizing: true,
  },
};

export const ManyEntries: Story = {
  args: {
    entries: [
      ...mockEntries,
      {
        id: 4,
        articleId: 4,
        articleName: "Widget D",
        operatorName: "Alice Brown",
        quantity: 200,
        status: "PREPARATION" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organization: "Acme Corp",
      },
      {
        id: 5,
        articleId: 5,
        articleName: "Widget E",
        operatorName: "Charlie Davis",
        quantity: 120,
        status: "IN PRODUCTION" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organization: "Acme Corp",
      },
    ],
    onAutoSchedule: () => {},
    isOptimizing: false,
  },
};
