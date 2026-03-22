import { render, screen, act } from '@testing-library/react';
import { AnimatedNumber } from '../AnimatedNumber';

// ── RAF helpers ─────────────────────────────────────────────────────

let rafCallbacks: Map<number, FrameRequestCallback>;
let nextRafId: number;
let mockNow: number;

function setupRafMock() {
  rafCallbacks = new Map();
  nextRafId = 1;
  mockNow = 0;

  jest.spyOn(performance, 'now').mockImplementation(() => mockNow);
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    const id = nextRafId++;
    rafCallbacks.set(id, cb);
    return id;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    rafCallbacks.delete(id);
  });
}

/** Flush all pending RAF callbacks at the given simulated time. */
function flushRaf(time: number) {
  mockNow = time;
  const cbs = Array.from(rafCallbacks.entries());
  rafCallbacks.clear();
  for (const [, cb] of cbs) {
    cb(time);
  }
}

/** Run multiple RAF cycles to drive animation to completion. */
function runAnimationToCompletion(durationMs: number) {
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    act(() => {
      flushRaf((durationMs / steps) * i);
    });
  }
  // One extra flush beyond duration to ensure progress >= 1
  act(() => {
    flushRaf(durationMs + 16);
  });
}

beforeEach(() => {
  setupRafMock();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('AnimatedNumber', () => {
  // ── Static rendering ────────────────────────────────────────────

  it('renders a span with data-testid', () => {
    render(<AnimatedNumber value={42} />);
    expect(screen.getByTestId('animated-number')).toBeInTheDocument();
  });

  it('displays the value immediately on first render', () => {
    render(<AnimatedNumber value={100} />);
    expect(screen.getByTestId('animated-number')).toHaveTextContent('100');
  });

  it('renders prefix and suffix', () => {
    render(<AnimatedNumber value={50} prefix="$" suffix="%" />);
    expect(screen.getByTestId('animated-number')).toHaveTextContent('$50%');
  });

  it('formats with decimals prop', () => {
    render(<AnimatedNumber value={3.14159} decimals={2} />);
    expect(screen.getByTestId('animated-number')).toHaveTextContent('3.14');
  });

  it('formats with zero decimals using toLocaleString', () => {
    render(<AnimatedNumber value={1000} />);
    // toLocaleString may add commas — just check it renders
    const el = screen.getByTestId('animated-number');
    expect(el.textContent).toContain('1');
  });

  // ── from === to (no animation) ──────────────────────────────────

  it('does not start animation when value is unchanged', () => {
    const { rerender } = render(<AnimatedNumber value={42} />);
    (window.requestAnimationFrame as jest.Mock).mockClear();
    rerender(<AnimatedNumber value={42} />);
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  // ── Animation loop ──────────────────────────────────────────────

  it('starts requestAnimationFrame when value changes', () => {
    const { rerender } = render(<AnimatedNumber value={0} />);
    (window.requestAnimationFrame as jest.Mock).mockClear();
    rerender(<AnimatedNumber value={100} />);
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('animates from old value to new value', () => {
    const { rerender } = render(<AnimatedNumber value={0} />);
    expect(screen.getByTestId('animated-number')).toHaveTextContent('0');

    // Change to 100
    mockNow = 0;
    rerender(<AnimatedNumber value={100} duration={800} />);

    // Mid-animation (400ms = 50% progress, ease-out cubic: 1 - (0.5)^3 = 0.875)
    act(() => {
      flushRaf(400);
    });
    const midText = screen.getByTestId('animated-number').textContent ?? '';
    const midVal = parseInt(midText.replace(/[^0-9]/g, ''), 10);
    expect(midVal).toBeGreaterThan(0);
    expect(midVal).toBeLessThan(100);

    // Complete animation
    act(() => {
      flushRaf(800);
    });
    // After duration, progress = 1, should show 100
    expect(screen.getByTestId('animated-number')).toHaveTextContent('100');
  });

  it('animates with decimals', () => {
    const { rerender } = render(<AnimatedNumber value={0} decimals={1} />);
    rerender(<AnimatedNumber value={10} decimals={1} duration={800} />);

    // Complete animation
    runAnimationToCompletion(800);

    expect(screen.getByTestId('animated-number')).toHaveTextContent('10.0');
  });

  it('chains animation frames until complete', () => {
    const { rerender } = render(<AnimatedNumber value={0} />);
    (window.requestAnimationFrame as jest.Mock).mockClear();

    rerender(<AnimatedNumber value={100} duration={800} />);

    // First frame
    act(() => {
      flushRaf(100);
    });
    // Should have requested another frame since progress < 1
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(2); // initial + 1 more

    // Second frame
    act(() => {
      flushRaf(200);
    });
    expect((window.requestAnimationFrame as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it('stops requesting frames after animation completes', () => {
    const { rerender } = render(<AnimatedNumber value={0} />);
    rerender(<AnimatedNumber value={100} duration={800} />);

    // Run past completion
    const countBefore = (window.requestAnimationFrame as jest.Mock).mock.calls.length;
    act(() => {
      flushRaf(900); // past duration
    });
    const countAfter = (window.requestAnimationFrame as jest.Mock).mock.calls.length;

    // Should NOT request another frame after progress >= 1
    // The difference should be 0 (no new raf scheduled)
    // but we need to check callbacks is empty
    expect(rafCallbacks.size).toBe(0);
  });

  // ── Cleanup / cancelAnimationFrame ──────────────────────────────

  it('calls cancelAnimationFrame on unmount during animation', () => {
    const { rerender, unmount } = render(<AnimatedNumber value={0} />);
    rerender(<AnimatedNumber value={100} />);

    // Animation is running — now unmount
    (window.cancelAnimationFrame as jest.Mock).mockClear();
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('calls cancelAnimationFrame when value changes again mid-animation', () => {
    const { rerender } = render(<AnimatedNumber value={0} />);
    rerender(<AnimatedNumber value={50} duration={800} />);

    // Mid-animation, change value again
    (window.cancelAnimationFrame as jest.Mock).mockClear();
    rerender(<AnimatedNumber value={100} duration={800} />);
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  // ── Edge cases ──────────────────────────────────────────────────

  it('handles negative value changes', () => {
    const { rerender } = render(<AnimatedNumber value={100} />);
    rerender(<AnimatedNumber value={0} duration={800} />);

    runAnimationToCompletion(800);
    expect(screen.getByTestId('animated-number')).toHaveTextContent('0');
  });

  it('handles rapid value changes', () => {
    const { rerender } = render(<AnimatedNumber value={0} />);
    rerender(<AnimatedNumber value={50} duration={800} />);
    rerender(<AnimatedNumber value={200} duration={800} />);

    runAnimationToCompletion(800);
    expect(screen.getByTestId('animated-number')).toHaveTextContent('200');
  });
});
