import { describe, it, expect } from 'vitest';
import { ErrorBoundary } from '../components/ErrorBoundary';

describe('ErrorBoundary Architecture', () => {
  it('correctly updates state to hasError: true when an error is caught', () => {
    const testError = new Error('Test rendering crash');
    const derivedState = ErrorBoundary.getDerivedStateFromError(testError);

    expect(derivedState.hasError).toBe(true);
    expect(derivedState.error).toBe(testError);
  });
});
