import type { Meta, StoryObj } from "@storybook/react-vite";
import { FeaturesSectionWithHoverEffects } from "./FeaturesSection";

const meta = {
  title: "Landing/FeaturesSection",
  component: FeaturesSectionWithHoverEffects,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FeaturesSectionWithHoverEffects>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
