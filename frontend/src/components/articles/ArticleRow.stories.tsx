import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleRow } from "./ArticleRow";

const meta = {
  title: "Articles/ArticleRow",
  component: ArticleRow,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <table className="w-full text-sm text-left">
        <tbody className="divide-y divide-zinc-100">
          <Story />
        </tbody>
      </table>
    ),
  ],
  argTypes: {
    onEdit: { action: "edit" },
  },
} satisfies Meta<typeof ArticleRow>;

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
    },
  ],
  shopFloorFields: [
    {
      id: 2,
      fieldKey: "operator",
      fieldLabel: "Operator",
      fieldType: "text" as const,
      scope: "shop_floor" as const,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const Default: Story = {
  args: {
    article: mockArticle,
    onEdit: () => {},
  },
};

export const Draft: Story = {
  args: {
    article: {
      ...mockArticle,
      status: "draft",
    },
    onEdit: () => {},
  },
};

export const Archived: Story = {
  args: {
    article: {
      ...mockArticle,
      status: "archived",
    },
    onEdit: () => {},
  },
};
