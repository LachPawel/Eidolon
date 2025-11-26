import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleList } from "./ArticleList";

const meta = {
  title: "ShopFloor/ArticleList",
  component: ArticleList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onSelectArticle: { action: "select" },
  },
} satisfies Meta<typeof ArticleList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedArticleId: null,
    onSelectArticle: () => {},
  },
};

export const Selected: Story = {
  args: {
    selectedArticleId: 1,
    onSelectArticle: () => {},
  },
};
