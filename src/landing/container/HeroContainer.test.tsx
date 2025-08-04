import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signInWithEmailAndPassword } from 'firebase/auth';
import HeroContainer from './HeroContainer';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
}));

jest.mock('../../services/firebase', () => ({
  auth: {},
}));

// Mock the Hero presentational component
jest.mock('../../landing/Hero/Hero', () => {
  return jest.fn(({ email, error, isLoading, handleEmailChange, handleSignInClick }) => (
    <div data-testid="hero-presentation">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          role="textbox"
          name="email"
          value={email}
          onChange={handleEmailChange}
          className={error ? 'error-border' : email && !error ? 'success-border' : ''}
          data-testid="email-input"
        />
      </div>
      {error && <div data-testid="error-message">{error}</div>}
      <button
        role="button"
        onClick={handleSignInClick}
        disabled={isLoading}
        data-testid="get-started-button"
      >
        {isLoading ? 'Loading...' : 'Get Started'}
      </button>
    </div>
  ));
});

const mockNavigate = jest.fn();
const mockT = jest.fn();
const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as jest.MockedFunction<typeof signInWithEmailAndPassword>;

describe('HeroContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    
    // Set up default translation mock responses
    mockT.mockImplementation((key: string) => {
      const translations: { [key: string]: string } = {
        'hero.emailValidationError': 'Please enter a valid email address',
        'hero.emailSignInError': 'Please enter a valid email address',
      };
      return translations[key] || key;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Email Input', () => {
    it('should render email input field', () => {
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      expect(emailInput).toBeInTheDocument();
    });

    it('should update email value when typing', async () => {
      const user = userEvent.setup();
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should handle empty email input', () => {
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      expect(emailInput).toHaveValue('');
    });

    it('should handle special characters in email input', async () => {
      const user = userEvent.setup();
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      
      await user.type(emailInput, 'test.email+tag@example-domain.co.uk');
      
      expect(emailInput).toHaveValue('test.email+tag@example-domain.co.uk');
    });
  });

  describe('Form Validation', () => {
    it('should show error message for invalid email format', async () => {
      const user = userEvent.setup();
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      
      await user.type(emailInput, 'invalid-email');
      
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a valid email address');
      expect(mockT).toHaveBeenCalledWith('hero.emailValidationError');
    });

    it('should show error message for email without @ symbol', async () => {
      const user = userEvent.setup();
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      
      await user.type(emailInput, 'invalidemail.com');
      
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a valid email address');
    });

    it('should show error message for email without domain', async () => {
      const user = userEvent.setup();
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      
      await user.type(emailInput, 'test@');
      
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a valid email address');
    });

    it('should show error message for email without TLD', async () => {
      const user = userEvent.setup();
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      
      await user.type(emailInput, 'test@example');
      
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a valid email address');
    });

    it('should clear error when valid email is entered', async () => {
      const user = userEvent.setup();
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      
      // First enter invalid email
      await user.type(emailInput, 'invalid');
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      
      // Clear and enter valid email
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@example.com');
      
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('should not show error for empty email field initially', () => {
      render(<HeroContainer />);
      
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('should apply success styling for valid email', async () => {
      const user = userEvent.setup();
      render(<HeroContainer />);
      
      const emailInput = screen.getByTestId('email-input');
      
      await user.type(emailInput, 'valid@example.com');
      
      expect(emailInput).toHaveClass('success-border');
      expect(emailInput).not.toHaveClass('error-border');
    });

    it('should apply error styling for invalid email', async () => {
      const user = userEvent.setup();
      render(<HeroContainer />);
      
      const emailInput = screen.getByTestId('email-input');
      
      await user.type(emailInput, 'invalid-email');
      
      expect(emailInput).toHaveClass('error-border');
      expect(emailInput).not.toHaveClass('success-border');
    });

    it('should validate various valid email formats', async () => {
      const user = userEvent.setup();
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.info',
        'a@b.co'
      ];

      for (const email of validEmails) {
        const { unmount } = render(<HeroContainer />);
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        
        await user.type(emailInput, email);
        
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
        
        // Cleanup for next iteration
        unmount();
      }
    });
  });

  describe('Get Started Button', () => {
    it('should render Get Started button', () => {
      render(<HeroContainer />);
      
      const button = screen.getByRole('button', { name: /get started/i });
      expect(button).toBeInTheDocument();
    });

    it('should be clickable when not loading', () => {
      render(<HeroContainer />);
      
      const button = screen.getByRole('button', { name: /get started/i });
      expect(button).not.toBeDisabled();
    });

    it('should show validation error when clicked with invalid email', async () => {
      const user = userEvent.setup();
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const button = screen.getByRole('button', { name: /get started/i });
      
      await user.type(emailInput, 'invalid-email');
      await user.click(button);
      
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a valid email address');
      expect(mockT).toHaveBeenCalledWith('hero.emailSignInError');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show validation error when clicked with empty email', async () => {
      const user = userEvent.setup();
      render(<HeroContainer />);
      
      const button = screen.getByRole('button', { name: /get started/i });
      
      await user.click(button);
      
      expect(screen.getByTestId('error-message')).toHaveTextContent('Please enter a valid email address');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show loading state when processing', async () => {
      const user = userEvent.setup();
      mockSignInWithEmailAndPassword.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const button = screen.getByRole('button', { name: /get started/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.click(button);
      
      await waitFor(() => {
        expect(button).toHaveTextContent('Loading...');
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Firebase Authentication and Navigation', () => {
    it('should navigate to login page on successful authentication', async () => {
      const user = userEvent.setup();
      mockSignInWithEmailAndPassword.mockResolvedValue({} as any);
      
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const button = screen.getByRole('button', { name: /get started/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { 
          state: { email: 'test@example.com' } 
        });
      });
    });

    it('should navigate to login page on wrong password error', async () => {
      const user = userEvent.setup();
      const wrongPasswordError = { code: 'auth/wrong-password', message: 'Wrong password' };
      mockSignInWithEmailAndPassword.mockRejectedValue(wrongPasswordError);
      
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const button = screen.getByRole('button', { name: /get started/i });
      
      await user.type(emailInput, 'existing@example.com');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { 
          state: { email: 'existing@example.com' } 
        });
      });
    });

    it('should navigate to login page on invalid credential error', async () => {
      const user = userEvent.setup();
      const invalidCredentialError = { code: 'auth/invalid-credential', message: 'Invalid credential' };
      mockSignInWithEmailAndPassword.mockRejectedValue(invalidCredentialError);
      
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const button = screen.getByRole('button', { name: /get started/i });
      
      await user.type(emailInput, 'existing@example.com');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { 
          state: { email: 'existing@example.com' } 
        });
      });
    });

    it('should navigate to signup page on user not found error', async () => {
      const user = userEvent.setup();
      const userNotFoundError = { code: 'auth/user-not-found', message: 'User not found' };
      mockSignInWithEmailAndPassword.mockRejectedValue(userNotFoundError);
      
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const button = screen.getByRole('button', { name: /get started/i });
      
      await user.type(emailInput, 'newuser@example.com');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/signup', { 
          state: { email: 'newuser@example.com' } 
        });
      });
    });

    it('should show error message for other Firebase errors', async () => {
      const user = userEvent.setup();
      const networkError = { code: 'auth/network-request-failed', message: 'Network error occurred' };
      mockSignInWithEmailAndPassword.mockRejectedValue(networkError);
      
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const button = screen.getByRole('button', { name: /get started/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Network error occurred');
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should call Firebase auth with correct parameters', async () => {
      const user = userEvent.setup();
      mockSignInWithEmailAndPassword.mockResolvedValue({} as any);
      
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const button = screen.getByRole('button', { name: /get started/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.click(button);
      
      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
          {}, // mocked auth object
          'test@example.com',
          'dummy-password'
        );
      });
    });

    it('should clear error state before attempting sign in', async () => {
      const user = userEvent.setup();
      mockSignInWithEmailAndPassword.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const button = screen.getByRole('button', { name: /get started/i });
      
      // First create an error
      await user.type(emailInput, 'invalid');
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      
      // Clear and enter valid email
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      
      // Click button to start sign in
      await user.click(button);
      
      // Error should be cleared during sign in process
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('should reset loading state after authentication completes', async () => {
      const user = userEvent.setup();
      mockSignInWithEmailAndPassword.mockResolvedValue({} as any);
      
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const button = screen.getByRole('button', { name: /get started/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.click(button);
      
      await waitFor(() => {
        expect(button).toHaveTextContent('Get Started');
        expect(button).not.toBeDisabled();
      });
    });

    it('should reset loading state after authentication fails', async () => {
      const user = userEvent.setup();
      const networkError = { code: 'auth/network-request-failed', message: 'Network error' };
      mockSignInWithEmailAndPassword.mockRejectedValue(networkError);
      
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const button = screen.getByRole('button', { name: /get started/i });
      
      await user.type(emailInput, 'test@example.com');
      await user.click(button);
      
      await waitFor(() => {
        expect(button).toHaveTextContent('Get Started');
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user flow for existing user', async () => {
      const user = userEvent.setup();
      const wrongPasswordError = { code: 'auth/wrong-password', message: 'Wrong password' };
      mockSignInWithEmailAndPassword.mockRejectedValue(wrongPasswordError);
      
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const button = screen.getByRole('button', { name: /get started/i });
      
      // 1. Enter email
      await user.type(emailInput, 'existing@example.com');
      expect(emailInput).toHaveValue('existing@example.com');
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      
      // 2. Click Get Started
      await user.click(button);
      
      // 3. Should navigate to login
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { 
          state: { email: 'existing@example.com' } 
        });
      });
    });

    it('should handle complete user flow for new user', async () => {
      const user = userEvent.setup();
      const userNotFoundError = { code: 'auth/user-not-found', message: 'User not found' };
      mockSignInWithEmailAndPassword.mockRejectedValue(userNotFoundError);
      
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const button = screen.getByRole('button', { name: /get started/i });
      
      // 1. Enter email
      await user.type(emailInput, 'newuser@example.com');
      
      // 2. Click Get Started
      await user.click(button);
      
      // 3. Should navigate to signup
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/signup', { 
          state: { email: 'newuser@example.com' } 
        });
      });
    });

    it('should handle email validation and correction flow', async () => {
      const user = userEvent.setup();
      mockSignInWithEmailAndPassword.mockResolvedValue({} as any);
      
      render(<HeroContainer />);
      
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const button = screen.getByRole('button', { name: /get started/i });
      
      // 1. Enter invalid email
      await user.type(emailInput, 'invalid');
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      
      // 2. Try to submit with invalid email
      await user.click(button);
      expect(mockNavigate).not.toHaveBeenCalled();
      
      // 3. Correct the email
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@example.com');
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      
      // 4. Submit with valid email
      await user.click(button);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { 
          state: { email: 'valid@example.com' } 
        });
      });
    });
  });
});