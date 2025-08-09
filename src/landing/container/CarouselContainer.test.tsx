import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarouselContainer from './CarouselContainer'; // Adjust path as needed

// Define a type for the mocked CarouselItem's props to fix the implicit 'any' error.
interface MockCarouselItemProps {
  rank: number;
  onClick: () => void;
  altText: string;
  imageUrl: string;
}

// --- Mocking the Child Component ---
// We mock CarouselItem to isolate the CarouselContainer's logic.
const mockCarouselItem = jest.fn();
jest.mock('../CarouselItem/CarouselItem', () => (props: MockCarouselItemProps) => {
  // The mock component calls our spy function and renders a simple div
  // that we can interact with in our tests.
  mockCarouselItem(props);
  return (
    <div
      data-testid={`carousel-item-${props.rank}`}
      onClick={props.onClick}
    >
      {props.altText}
    </div>
  );
});

describe('CarouselContainer', () => {
  // More realistic mock data based on the component's logic
  const mockItems = [
    { id: '1', imageUrl: 'https://image.tmdb.org/t/p/w500/poster1.jpg', title: 'Movie One', rank: 1 },
    { id: '2', imageUrl: 'https://image.tmdb.org/t/p/w780/backdrop2.jpg', name: 'Show Two', rank: 2 },
    { id: '3', imageUrl: null, title: 'Movie Three', rank: 3 }, // Item with missing image
    { id: '4', imageUrl: 'https://image.tmdb.org/t/p/w500/poster4.jpg', title: 'Movie Four', rank: 4 },
  ];

  const mockOnItemClick = jest.fn();

  // Clear mocks before each test to ensure a clean state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Test 1: Rendering and Prop Passing ---
  describe('Rendering and Props', () => {
    it('should render the correct number of CarouselItem components', () => {
      render(<CarouselContainer items={mockItems} onItemClick={mockOnItemClick} />);
      // Count DOM nodes instead of mock calls (robust under Strict Mode)
      expect(screen.getAllByTestId(/carousel-item-/i)).toHaveLength(mockItems.length);
    });

    it('should pass the correct props to each CarouselItem based on available data', () => {
      render(<CarouselContainer items={mockItems} onItemClick={mockOnItemClick} />);
      
      // Check props for an item with a poster_path
      expect(mockCarouselItem).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrl: 'https://image.tmdb.org/t/p/w500/poster1.jpg',
          altText: 'Movie One',
          rank: 1,
          onClick: expect.any(Function),
        })
      );

      // Check props for an item with a backdrop_path and name
      expect(mockCarouselItem).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrl: 'https://image.tmdb.org/t/p/w780/backdrop2.jpg',
          altText: 'Show Two',
          rank: 2,
          onClick: expect.any(Function),
        })
      );

      // Check props for the item with a missing image URL
      expect(mockCarouselItem).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrl: 'src/home/container/istockphoto-1147544807-612x612.jpg', // Placeholder URL
          altText: 'Movie Three',
          rank: 3,
          onClick: expect.any(Function),
        })
      );
    });
  });

  // --- Test 2: Click Event Propagation ---
  describe('User Interactions', () => {
    it('should call onItemClick with the correct item when a CarouselItem is clicked', () => {
      render(<CarouselContainer items={mockItems} onItemClick={mockOnItemClick} />);

      // Find the mock item for the second movie (rank 2)
      const itemToClick = screen.getByTestId('carousel-item-2');
      fireEvent.click(itemToClick);

      // Verify the callback was triggered once with the correct item object
      expect(mockOnItemClick).toHaveBeenCalledTimes(1);
      expect(mockOnItemClick).toHaveBeenCalledWith(mockItems[1]);
    });
  });

  describe('Scrolling Logic', () => {
    const scrollByMock = jest.fn();

    beforeEach(() => {
      scrollByMock.mockClear();
      // Mock the DOM measurements that control the scroll logic
      Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: 2000 });
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 500 });
      Object.defineProperty(HTMLElement.prototype, 'scrollLeft', { configurable: true, writable: true, value: 0 });
      HTMLElement.prototype.scrollBy = scrollByMock;
    });

    describe('Initial State', () => {
      it('should not show the left scroll button and show the right one', () => {
        render(<CarouselContainer items={mockItems} onItemClick={mockOnItemClick} />);
        
        expect(screen.queryByLabelText('scroll left')).not.toBeInTheDocument();
        expect(screen.getByLabelText('scroll right')).toBeInTheDocument();
      });
    });

    describe('Scrolling Right', () => {
      it('should show both buttons after scrolling', () => {
        const { container } = render(<CarouselContainer items={mockItems} onItemClick={mockOnItemClick} />);
        const carouselElement = container.querySelector('.carouselContainer');
        
        if (carouselElement) {
          fireEvent.scroll(carouselElement, { target: { scrollLeft: 500 } });
        }

        expect(screen.getByLabelText('scroll left')).toBeInTheDocument();
        expect(screen.getByLabelText('scroll right')).toBeInTheDocument();
      });
    });

    describe('Scrolling to the End', () => {
      it('should hide the right button', () => {
        const { container } = render(<CarouselContainer items={mockItems} onItemClick={mockOnItemClick} />);
        const carouselElement = container.querySelector('.carouselContainer');

        if (carouselElement) {
          fireEvent.scroll(carouselElement, { target: { scrollLeft: 1502 } });
        }

        expect(screen.getByLabelText('scroll left')).toBeInTheDocument();
        expect(screen.queryByLabelText('scroll right')).not.toBeInTheDocument();
      });
    });

    describe('Button Clicks', () => {
      it('should call scrollBy with the correct values', () => {
        const { container } = render(<CarouselContainer items={mockItems} onItemClick={mockOnItemClick} />);
        
        const rightButton = screen.getByLabelText('scroll right');
        fireEvent.click(rightButton);
        expect(scrollByMock).toHaveBeenCalledWith({ left: 500, behavior: 'smooth' });

        const carouselElement = container.querySelector('.carouselContainer');
        if (carouselElement) {
          fireEvent.scroll(carouselElement, { target: { scrollLeft: 500 } });
        }

        const leftButton = screen.getByLabelText('scroll left');
        fireEvent.click(leftButton);
        expect(scrollByMock).toHaveBeenCalledWith({ left: -500, behavior: 'smooth' });
      });
    });
  });
});
