import React from 'react';
import { render, screen } from '@testing-library/react';
import FaqSection from '../FaqSection/FaqSection';
import FaqItem from '../FaqItem/FaqItem'; // Import the component to be mocked

// Mock the FaqItem component to simplify the FaqSection test.
// We only want to test that FaqSection renders the correct number of items,
// not the inner workings of FaqItem itself (that's for its own test file).
jest.mock('../FaqItem/FaqItem', () => {
  // The mock component will just display the question prop it receives.
  return jest.fn(({ question }) => <div>{question}</div>);
});

// Mock the i18next library used by the child component
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: any) => key, // The mock t function returns the key, so we can check for it
  }),
}));

describe('FaqSection', () => {
  const mockFaqs = [
    { question: 'faq.question1', answer: 'faq.answer1' },
    { question: 'faq.question2', answer: 'faq.answer2' },
    { question: 'faq.question3', answer: 'faq.answer3' },
  ];

  beforeEach(() => {
    // Clear mock calls before each test to ensure isolation
    (FaqItem as jest.Mock).mockClear();
  });

  it('should render the correct number of FaqItem components', () => {
    // Render the FaqSection with our mock data
    render(<FaqSection faqs={mockFaqs} />);

    // Check that FaqItem was called 3 times
    expect(FaqItem).toHaveBeenCalledTimes(mockFaqs.length);
  });

  it('should pass the correct props to each FaqItem component', () => {
    render(<FaqSection faqs={mockFaqs} />);

  mockFaqs.forEach((faq) => {
      expect(FaqItem).toHaveBeenCalledWith(
        expect.objectContaining({
          question: faq.question,
          answer: faq.answer,
        }),
        undefined // Explicitly expect undefined for the second argument
      );
    });

    // An alternative check: ensure the questions (which our mock FaqItem renders) are in the document
    expect(screen.getByText('faq.question1')).toBeInTheDocument();
    expect(screen.getByText('faq.question2')).toBeInTheDocument();
    expect(screen.getByText('faq.question3')).toBeInTheDocument();
  });

  it('should render nothing if the faqs prop is an empty array', () => {
    // Render with an empty array
    const { container } = render(<FaqSection faqs={[]} />);

    // The container for the FAQs should have no child elements
    expect(container.querySelector('.faqContainer')?.childElementCount).toBe(0);
  });
});
