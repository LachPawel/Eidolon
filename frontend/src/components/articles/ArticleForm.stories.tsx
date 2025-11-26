import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleForm } from "./ArticleForm";

const meta = {
  title: "Articles/ArticleForm",
  component: ArticleForm,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    onClose: { action: "close" },
  },
} satisfies Meta<typeof ArticleForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockArticle = {
  id: 1,
  name: "Injection Molded Casing",
  organization: "Acme Corp",
  status: "active" as const,
  attributeFields: [
    {
      id: 1,
      fieldKey: "material",
      fieldLabel: "Material",
      fieldType: "text" as const,
      scope: "attribute" as const,
      validation: { required: true },
    },
  ],
  shopFloorFields: [
    {
      id: 2,
      fieldKey: "operator",
      fieldLabel: "Operator",
      fieldType: "text" as const,
      scope: "shop_floor" as const,
      validation: { required: false },
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const Create: Story = {
  args: {
    initialData: null,
    onClose: () => {},
  },
};

export const Edit: Story = {
  args: {
    initialData: mockArticle,
    onClose: () => {},
  },
};
