/**
 * Tests for the search input focus/cursor bug fix.
 *
 * Root cause: ResponsiveModal was defined INSIDE the component body,
 * creating a new function reference on every render. React saw a different
 * component type and unmounted/remounted the entire modal, causing the
 * input to lose focus and cursor position.
 *
 * Fix: Move ResponsiveModal OUTSIDE the component body and pass isMobile
 * as a prop. This ensures React treats it as the same component across
 * re-renders, preventing unmount/remount cycles.
 *
 * Additional improvement: Added debounced auto-search so the user
 * doesn't need to click a search button.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

// ==================== STABLE ResponsiveModal (outside component) ====================
// This simulates the fix: ResponsiveModal is defined OUTSIDE the parent component
function ResponsiveModal({
  open,
  onOpenChange,
  title,
  children,
  isMobile = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  isMobile?: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#0f0f0f] border-[#2a2a2a] max-h-[85vh] overflow-hidden max-w-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-[#d4af37] font-bold text-base">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

// ==================== FIXED version (the NEW stable pattern) ====================
function FixedAddForm() {
  const [metaQuery, setMetaQuery] = useState('')
  const [title, setTitle] = useState('')

  return (
    <ResponsiveModal open={true} onOpenChange={() => {}} title="إضافة عمل جديد" isMobile={false}>
      <div className="space-y-5 overflow-y-auto p-1 max-h-[70vh]">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#d4af37]">بحث تلقائي</label>
          <div className="relative">
            <Input
              value={metaQuery}
              onChange={(e) => setMetaQuery(e.target.value)}
              placeholder="اكتب اسم الفيلم أو المسلسل... (بحث تلقائي)"
              className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-sm h-11 pl-10"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#d4af37]">العنوان *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان العمل"
            className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-11"
            autoComplete="off"
          />
        </div>
      </div>
    </ResponsiveModal>
  )
}

// ==================== Debounced Auto-Search Test Component ====================
function SearchWithDebounce() {
  const [metaQuery, setMetaQuery] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 50))
    setResults([`Result for: ${q}`])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!metaQuery.trim()) { setResults([]); return }
    timerRef.current = setTimeout(() => doSearch(metaQuery), 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [metaQuery, doSearch])

  return (
    <div>
      <Input
        value={metaQuery}
        onChange={(e) => setMetaQuery(e.target.value)}
        placeholder="ابحث..."
        autoComplete="off"
        data-testid="debounced-search"
      />
      {loading && <span data-testid="loading">جارٍ البحث...</span>}
      {results.map((r, i) => <div key={i} data-testid="result">{r}</div>)}
    </div>
  )
}

// ==================== Tests ====================

describe('Search Input Focus Fix - Stable Component Reference', () => {
  it('should NOT select all text after typing in search input (fixed version)', async () => {
    const user = userEvent.setup()
    render(<FixedAddForm />)

    const searchInput = screen.getByPlaceholderText('اكتب اسم الفيلم أو المسلسل... (بحث تلقائي)') as HTMLInputElement
    expect(searchInput).toBeInTheDocument()

    await user.click(searchInput)
    await user.type(searchInput, 'Inception')

    expect(searchInput.value).toBe('Inception')
    // CRITICAL: text should NOT be selected after typing
    expect(searchInput.selectionStart).toBe(searchInput.selectionEnd)
  })

  it('should maintain cursor position at end of typed text', async () => {
    const user = userEvent.setup()
    render(<FixedAddForm />)

    const searchInput = screen.getByPlaceholderText('اكتب اسم الفيلم أو المسلسل... (بحث تلقائي)') as HTMLInputElement
    await user.click(searchInput)
    await user.type(searchInput, 'Test')

    // Cursor should be at position 4 (end of "Test")
    expect(searchInput.selectionStart).toBe(4)
    expect(searchInput.selectionEnd).toBe(4)
  })

  it('should allow typing character by character without select-all', async () => {
    const user = userEvent.setup()
    render(<FixedAddForm />)

    const searchInput = screen.getByPlaceholderText('اكتب اسم الفيلم أو المسلسل... (بحث تلقائي)') as HTMLInputElement
    await user.click(searchInput)

    await user.type(searchInput, 'A')
    expect(searchInput.value).toBe('A')
    expect(searchInput.selectionStart).toBe(searchInput.selectionEnd)

    await user.type(searchInput, 'B')
    expect(searchInput.value).toBe('AB')
    expect(searchInput.selectionStart).toBe(searchInput.selectionEnd)

    await user.type(searchInput, 'C')
    expect(searchInput.value).toBe('ABC')
    expect(searchInput.selectionStart).toBe(searchInput.selectionEnd)
  })

  it('should allow typing in title input without select-all', async () => {
    const user = userEvent.setup()
    render(<FixedAddForm />)

    const titleInput = screen.getByPlaceholderText('عنوان العمل') as HTMLInputElement
    await user.click(titleInput)
    await user.type(titleInput, 'The Dark Knight')

    expect(titleInput.value).toBe('The Dark Knight')
    expect(titleInput.selectionStart).toBe(titleInput.selectionEnd)
  })

  it('should allow switching between inputs without losing text', async () => {
    const user = userEvent.setup()
    render(<FixedAddForm />)

    const searchInput = screen.getByPlaceholderText('اكتب اسم الفيلم أو المسلسل... (بحث تلقائي)') as HTMLInputElement
    await user.click(searchInput)
    await user.type(searchInput, 'Inception')
    expect(searchInput.value).toBe('Inception')

    const titleInput = screen.getByPlaceholderText('عنوان العمل') as HTMLInputElement
    await user.click(titleInput)
    await user.type(titleInput, 'Movie Title')
    expect(titleInput.value).toBe('Movie Title')

    // Search input should still have its value
    expect(searchInput.value).toBe('Inception')
  })

  it('should have correct autoComplete attributes on search input', () => {
    render(<FixedAddForm />)

    const searchInput = screen.getByPlaceholderText('اكتب اسم الفيلم أو المسلسل... (بحث تلقائي)')
    expect(searchInput).toHaveAttribute('autocomplete', 'off')
    expect(searchInput).toHaveAttribute('autocorrect', 'off')
    expect(searchInput).toHaveAttribute('spellcheck', 'false')
  })
})

describe('ResponsiveModal - Stable Reference', () => {
  it('should keep input value after parent re-renders', async () => {
    function Wrapper() {
      const [count, setCount] = useState(0)
      const [inputVal, setInputVal] = useState('')
      return (
        <div>
          <button onClick={() => setCount(n => n + 1)} data-testid="force-rerender">
            Re-render ({count})
          </button>
          <ResponsiveModal open={true} onOpenChange={() => {}} title="Test" isMobile={false}>
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="test input"
              autoComplete="off"
              data-testid="modal-input"
            />
          </ResponsiveModal>
        </div>
      )
    }

    const user = userEvent.setup()
    render(<Wrapper />)

    const input = screen.getByTestId('modal-input') as HTMLInputElement
    await user.click(input)
    await user.type(input, 'Hello')
    expect(input.value).toBe('Hello')

    // Force a re-render of the parent by clicking the button
    // The button is outside the modal overlay, so we use fireEvent
    const rerenderBtn = screen.getByTestId('force-rerender')
    fireEvent.click(rerenderBtn)

    // Input should still have its value after re-render
    const inputAfterRerender = screen.getByTestId('modal-input') as HTMLInputElement
    expect(inputAfterRerender.value).toBe('Hello')
  })
})

describe('Debounced Auto-Search', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should not search immediately on typing', () => {
    render(<SearchWithDebounce />)

    const input = screen.getByTestId('debounced-search')
    fireEvent.change(input, { target: { value: 'Inception' } })

    // Should NOT show results immediately (debounce period)
    expect(screen.queryByTestId('result')).not.toBeInTheDocument()
  })

  it('should search after debounce period', async () => {
    render(<SearchWithDebounce />)

    const input = screen.getByTestId('debounced-search')
    fireEvent.change(input, { target: { value: 'Inception' } })

    // Fast forward past debounce time (300ms)
    await act(async () => {
      jest.advanceTimersByTime(400)
    })

    await waitFor(() => {
      expect(screen.getByTestId('result')).toBeInTheDocument()
    })
  })

  it('should clear results when input is cleared', () => {
    render(<SearchWithDebounce />)

    const input = screen.getByTestId('debounced-search')
    fireEvent.change(input, { target: { value: 'Inception' } })

    act(() => {
      jest.advanceTimersByTime(400)
    })

    // Clear input
    fireEvent.change(input, { target: { value: '' } })

    act(() => {
      jest.advanceTimersByTime(400)
    })

    expect(screen.queryByTestId('result')).not.toBeInTheDocument()
  })
})

describe('Search Input - Arabic Text Support', () => {
  it('should handle Arabic text input without select-all', async () => {
    const user = userEvent.setup()
    render(<FixedAddForm />)

    const searchInput = screen.getByPlaceholderText('اكتب اسم الفيلم أو المسلسل... (بحث تلقائي)') as HTMLInputElement
    await user.click(searchInput)
    await user.type(searchInput, 'فيلم')

    expect(searchInput.value).toBe('فيلم')
    expect(searchInput.selectionStart).toBe(searchInput.selectionEnd)
  })
})
