import type { Meta, StoryObj } from '@storybook/react';
import { CVUpload } from './CVUpload';

const meta: Meta<typeof CVUpload> = {
  title: 'Components/CVUpload',
  component: CVUpload,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'CV Upload component allows users to upload their CV in PDF or DOCX format. The component automatically parses the file and extracts relevant information.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CVUpload>;

export const Default: Story = {
  args: {
    onCVParsed: (data: any) => {
      console.log('Parsed CV data:', data);
    },
    language: 'en',
  },
};

export const Turkish: Story = {
  args: {
    onCVParsed: (data: any) => {
      console.log('Parsed CV data:', data);
    },
    language: 'tr',
  },
};
