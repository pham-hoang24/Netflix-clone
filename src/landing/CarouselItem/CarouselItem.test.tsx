
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarouselItem from './CarouselItem';
import placeholder from '../../home/container/istockphoto-1147544807-612x612.jpg';

describe('CarouselItem', () => {
  const mockOnClick = jest.fn();

  const defaultProps = {
    imageUrl: 'https://example.com/image.jpg',
    altText: 'Test Image',
    onClick: mockOnClick,
    rank: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Image Rendering', () => {
    it('should render the image with the correct src and alt attributes', () => {
      render(<CarouselItem {...defaultProps} />);
      const imgElement = screen.getByRole('img');
      expect(imgElement).toHaveAttribute('src', defaultProps.imageUrl);
      expect(imgElement).toHaveAttribute('alt', defaultProps.altText);
    });

    it('should use a placeholder image if imageUrl is empty', () => {
      render(<CarouselItem {...defaultProps} imageUrl="" />);
      const imgElement = screen.getByRole('img');
      expect(imgElement).toHaveAttribute('src', placeholder);
    });
  });

  describe('Click Handling', () => {
    it('should call the onClick prop when the item is clicked', () => {
      render(<CarouselItem {...defaultProps} />);
      const itemElement = screen.getByRole('img').parentElement;
      if (itemElement) {
        fireEvent.click(itemElement);
      }
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Rank Display', () => {
    it('should display the rank correctly', () => {
      render(<CarouselItem {...defaultProps} />);
      expect(screen.getByText(defaultProps.rank.toString())).toBeInTheDocument();
    });
  });
});
