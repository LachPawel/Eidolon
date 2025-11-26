import type { Meta, StoryObj } from "@storybook/react-vite";
import { EntryForm } from "./EntryForm";

const meta = {
  title: "ShopFloor/EntryForm",
  component: EntryForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof EntryForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockArticle = {
  id: 1,
  name: "Injection Molded Casing",
  organization: "Acme Corp",
  status: "active" as const,
  attributeFields: [],
  shopFloorFields: [
    {
      id: 1,
      fieldKey: "operator",
      fieldLabel: "Operator Name",
      fieldType: "text" as const,
      scope: "shop_floor" as const,
      validation: { required: true },
    },
    {
      id: 2,
      fieldKey: "quantity",
      fieldLabel: "Quantity Produced",
      fieldType: "number" as const,
      scope: "shop_floor" as const,
      validation: { required: true, min: 1 },
    },
    {
      id: 3,
      fieldKey: "quality_check",
      fieldLabel: "Quality Check Passed",
      fieldType: "boolean" as const,
      scope: "shop_floor" as const,
    },
    {
      id: 4,
      fieldKey: "shift",
      fieldLabel: "Shift",
      fieldType: "select" as const,
      scope: "shop_floor" as const,
      validation: { required: true, options: ["Morning", "Afternoon", "Night"] },
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const Default: Story = {
  args: {
    article: mockArticle,
  },
};

export const NoFields: Story = {
  args: {
    article: {
      ...mockArticle,
      shopFloorFields: [],
    },
  },
};
