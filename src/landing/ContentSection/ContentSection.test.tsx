
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContentSection from './ContentSection';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return the key itself for testing
  }),
}));

describe('ContentSection', () => {
  it('should render the title and children correctly', () => {
    const titleKey = 'test.title';
    const childText = 'Test Child';

    render(
      <ContentSection title={titleKey}>
        <p>{childText}</p>
      </ContentSection>
    );

    // Check if the title is rendered (it will be the key due to the mock)
    expect(screen.getByRole('heading', { name: titleKey })).toBeInTheDocument();

    // Check if the children are rendered
    expect(screen.getByText(childText)).toBeInTheDocument();
  });
});
