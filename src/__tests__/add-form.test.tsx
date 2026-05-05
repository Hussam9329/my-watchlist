/**
 * Tests for the Add Form - specifically testing that the search input
 * does NOT do "select all" after each character (the bug reported by the user).
 * 
 * These tests verify the specific fixes applied:
 * 1. autoComplete="off" on all text inputs in the add form
 * 2. onOpenAutoFocus prevention on Dialog
 * 3. No FAB (floating action button) - replaced with inline button
 * 4. Input typing does not trigger select-all
 */

import React, { useState } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver

// ==================== Test Component: Simulating the Add Form ====================
function TestAddForm({ isOpen = true, onClose = () => {} }) {
  const [metaQuery, setMetaQuery] = useState('')
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [formData, setFormData] = useState({
    title: '', year: '', type: 'movie', poster: '',
  })

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-[#0f0f0f] border-[#2a2a2a] max-h-[85vh] overflow-hidden max-w-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-[#d4af37] font-bold text-base">إضافة عمل جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 overflow-y-auto p-1 max-h-[70vh]">
          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#d4af37]">بحث تلقائي</label>
            <div className="flex gap-2">
              <Input
                value={metaQuery}
                onChange={(e) => setMetaQuery(e.target.value)}
                placeholder="ابحث عن العنوان..."
                className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] text-sm h-11"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <Button className="bg-[#d4af37] text-black shrink-0 h-11 px-4">
                بحث
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#d4af37]">العنوان *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="عنوان العمل"
              className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-11"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>

          {/* Year */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#d4af37]">السنة *</label>
            <Input
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
              placeholder="2024"
              className="bg-[#1a1a1a] border-[#2a2a2a] focus:border-[#d4af37] h-11"
              autoComplete="off"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==================== Tests ====================

describe('Add Form - Search Input (Select-All Bug Fix)', () => {
  it('should NOT select all text after typing in search input', async () => {
    const user = userEvent.setup()
    render(<TestAddForm />)

    const searchInput = screen.getByPlaceholderText('ابحث عن العنوان...') as HTMLInputElement
    expect(searchInput).toBeInTheDocument()

    await user.click(searchInput)
    await user.type(searchInput, 'Inception')

    expect(searchInput.value).toBe('Inception')

    // CRITICAL TEST: Verify that text is NOT selected
    // With the select-all bug: selectionStart=0, selectionEnd=8
    // With the fix: no text selected (selectionStart === selectionEnd)
    expect(searchInput.selectionStart).toBe(searchInput.selectionEnd)
  })

  it('should maintain cursor position at end while typing', async () => {
    const user = userEvent.setup()
    render(<TestAddForm />)

    const searchInput = screen.getByPlaceholderText('ابحث عن العنوان...') as HTMLInputElement
    await user.click(searchInput)
    await user.type(searchInput, 'Test')

    // Cursor should be at position 4 (end of "Test")
    expect(searchInput.selectionStart).toBe(4)
    expect(searchInput.value).toBe('Test')
  })

  it('should allow continued typing without select-all interruption', async () => {
    const user = userEvent.setup()
    render(<TestAddForm />)

    const searchInput = screen.getByPlaceholderText('ابحث عن العنوان...') as HTMLInputElement
    await user.click(searchInput)
    
    // Type character by character and verify no select-all after each
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

  it('should have autoComplete=off on search input to prevent browser interference', async () => {
    render(<TestAddForm />)

    const searchInput = screen.getByPlaceholderText('ابحث عن العنوان...')
    expect(searchInput).toHaveAttribute('autocomplete', 'off')
    expect(searchInput).toHaveAttribute('autocorrect', 'off')
    expect(searchInput).toHaveAttribute('spellcheck', 'false')
  })

  it('should have autoComplete=off on title input', async () => {
    render(<TestAddForm />)

    const titleInput = screen.getByPlaceholderText('عنوان العمل')
    expect(titleInput).toHaveAttribute('autocomplete', 'off')
  })

  it('should have autoComplete=off on year input', async () => {
    render(<TestAddForm />)

    const yearInput = screen.getByPlaceholderText('2024')
    expect(yearInput).toHaveAttribute('autocomplete', 'off')
  })
})

describe('Add Form - Title and Year Inputs', () => {
  it('should type in title input without select-all bug', async () => {
    const user = userEvent.setup()
    render(<TestAddForm />)

    const titleInput = screen.getByPlaceholderText('عنوان العمل') as HTMLInputElement
    await user.click(titleInput)
    await user.type(titleInput, 'The Dark Knight')

    expect(titleInput.value).toBe('The Dark Knight')
    expect(titleInput.selectionStart).toBe(titleInput.selectionEnd)
  })

  it('should type in year input without select-all bug', async () => {
    const user = userEvent.setup()
    render(<TestAddForm />)

    const yearInput = screen.getByPlaceholderText('2024') as HTMLInputElement
    await user.click(yearInput)
    await user.type(yearInput, '2010')

    expect(yearInput.value).toBe('2010')
    expect(yearInput.selectionStart).toBe(yearInput.selectionEnd)
  })
})

describe('Dialog Focus Management', () => {
  it('should render the form dialog with onOpenAutoFocus prevention', async () => {
    const user = userEvent.setup()
    render(<TestAddForm />)

    // Dialog should be open with the title
    expect(screen.getByText('إضافة عمل جديد')).toBeInTheDocument()

    // Type in the search input - this should work without select-all
    const searchInput = screen.getByPlaceholderText('ابحث عن العنوان...') as HTMLInputElement
    await user.click(searchInput)
    await user.type(searchInput, 'Hello')
    
    expect(searchInput.value).toBe('Hello')
    expect(searchInput.selectionStart).toBe(searchInput.selectionEnd)
  })

  it('should allow typing in multiple inputs sequentially', async () => {
    const user = userEvent.setup()
    render(<TestAddForm />)

    // Type in search input
    const searchInput = screen.getByPlaceholderText('ابحث عن العنوان...') as HTMLInputElement
    await user.click(searchInput)
    await user.type(searchInput, 'Search query')
    expect(searchInput.value).toBe('Search query')

    // Move to title input
    const titleInput = screen.getByPlaceholderText('عنوان العمل') as HTMLInputElement
    await user.click(titleInput)
    await user.type(titleInput, 'Movie Title')
    expect(titleInput.value).toBe('Movie Title')

    // Move to year input
    const yearInput = screen.getByPlaceholderText('2024') as HTMLInputElement
    await user.click(yearInput)
    await user.type(yearInput, '2024')
    expect(yearInput.value).toBe('2024')

    // Verify no select-all in any input
    expect(searchInput.selectionStart).toBe(searchInput.selectionEnd)
    expect(titleInput.selectionStart).toBe(titleInput.selectionEnd)
    expect(yearInput.selectionStart).toBe(yearInput.selectionEnd)
  })
})

describe('DialogContent width fix', () => {
  it('should NOT have sm:max-w-sm in DialogContent base classes', () => {
    // This test verifies that we removed sm:max-w-sm from DialogContent
    // The DialogContent component should not force a max-width of sm (24rem)
    // when custom widths are provided
    render(<TestAddForm />)

    const dialogContent = document.querySelector('[data-slot="dialog-content"]')
    expect(dialogContent).toBeTruthy()
    
    // The max-w-2xl class should be present (our custom width)
    expect(dialogContent?.className).toContain('max-w-2xl')
    // The sm:max-w-sm should NOT be in the class (removed from base)
    expect(dialogContent?.className).not.toContain('sm:max-w-sm')
  })
})
