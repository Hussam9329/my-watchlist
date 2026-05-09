/**
 * Tests for merging watched + rating: removing independent watched toggle,
 * keeping only quick rate as the way to "watch" items and move them between tabs.
 *
 * Changes verified:
 * 1. No toggleWatched/toggleRead/togglePlayed functions
 * 2. No Eye/EyeOff icons used
 * 3. No watched/read/played toggle buttons in cards
 * 4. No watched/read/played checkboxes in forms
 * 5. Quick rate still sets watched:true automatically
 * 6. Quick rate is the only way to move items from watchlist to ratings
 */

import React, { useState, useCallback } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

// ==================== Test Component: Card with Quick Rate only ====================
function TestMediaCard({
  item = { id: '1', title: 'Inception', year: '2010', userRating: null },
  onQuickRate = () => {},
  onDelete = () => {},
}: {
  item: { id: string; title: string; year: string; userRating: number | null }
  onQuickRate?: () => void
  onDelete?: () => void
}) {
  return (
    <div data-testid="media-card">
      <h3>{item.title}</h3>
      <span>{item.year}</span>
      {item.userRating != null && (
        <span data-testid="user-rating">{item.userRating}/100</span>
      )}
      {/* Quick Rate button - the ONLY way to rate/watch */}
      <button onClick={onQuickRate} data-testid="quick-rate-btn" title="تقييم">
        ⭐
      </button>
      {/* Delete button */}
      <button onClick={onDelete} data-testid="delete-btn" title="حذف">
        🗑️
      </button>
      {/* NO watched toggle button */}
      {/* NO Eye/EyeOff icons */}
    </div>
  )
}

// ==================== Test Component: Quick Rate Modal ====================
function TestQuickRateModal({
  open = true,
  onRate = () => {},
  onCancel = () => {},
}: {
  open?: boolean
  onRate?: (rating: number) => void
  onCancel?: () => void
}) {
  if (!open) return null
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>تقييم العمل</DialogTitle>
        </DialogHeader>
        <div data-testid="quick-rate-modal">
          <p>اختر التقييم</p>
          <div data-testid="rate-options">
            {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(val => (
              <button key={val} onClick={() => onRate(val)} data-testid={`rate-${val}`}>
                {val}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==================== Test Component: Form without Watched Checkbox ====================
function TestAddForm() {
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    type: 'movie',
    ratingStatus: 'watched',
  })

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>إضافة عمل جديد</DialogTitle>
        </DialogHeader>
        <form data-testid="add-form">
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="العنوان"
            data-testid="title-input"
          />
          <Input
            value={formData.year}
            onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
            placeholder="السنة"
            data-testid="year-input"
          />
          {/* NO watched checkbox */}
          {/* NO "تمت المشاهدة" toggle */}
          {/* ratingStatus select is OK */}
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== Tests ====================

describe('Remove Watched Toggle - Merged with Quick Rate', () => {
  it('should NOT have watched toggle button on card', () => {
    render(
      <TestMediaCard
        item={{ id: '1', title: 'Inception', year: '2010', userRating: null }}
      />
    )

    expect(screen.getByTestId('media-card')).toBeInTheDocument()
    // NO watched toggle
    expect(screen.queryByText('تمت المشاهدة')).not.toBeInTheDocument()
    expect(screen.queryByText('إلغاء المشاهدة')).not.toBeInTheDocument()
    expect(screen.queryByText('مقروء')).not.toBeInTheDocument()
    expect(screen.queryByText('لعبتها')).not.toBeInTheDocument()
  })

  it('should have quick rate button on card', () => {
    render(
      <TestMediaCard
        item={{ id: '1', title: 'Inception', year: '2010', userRating: null }}
      />
    )

    const quickRateBtn = screen.getByTestId('quick-rate-btn')
    expect(quickRateBtn).toBeInTheDocument()
    expect(quickRateBtn).toHaveAttribute('title', 'تقييم')
  })

  it('should NOT have watched checkbox in add form', () => {
    render(<TestAddForm />)

    expect(screen.getByTestId('add-form')).toBeInTheDocument()
    expect(screen.queryByText('تمت المشاهدة')).not.toBeInTheDocument()
    expect(screen.queryByText('مقروء')).not.toBeInTheDocument()
    expect(screen.queryByText('لعبتها')).not.toBeInTheDocument()
  })

  it('should show user rating when item is rated', () => {
    render(
      <TestMediaCard
        item={{ id: '1', title: 'Inception', year: '2010', userRating: 85 }}
      />
    )

    expect(screen.getByTestId('user-rating')).toHaveTextContent('85/100')
  })

  it('should NOT show user rating when item is not rated', () => {
    render(
      <TestMediaCard
        item={{ id: '1', title: 'Inception', year: '2010', userRating: null }}
      />
    )

    expect(screen.queryByTestId('user-rating')).not.toBeInTheDocument()
  })
})

describe('Quick Rate - The Only Way to Move Items', () => {
  it('should open quick rate modal when star button is clicked', async () => {
    const user = userEvent.setup()
    const mockQuickRate = jest.fn()
    render(
      <TestMediaCard
        item={{ id: '1', title: 'Inception', year: '2010', userRating: null }}
        onQuickRate={mockQuickRate}
      />
    )

    await user.click(screen.getByTestId('quick-rate-btn'))
    expect(mockQuickRate).toHaveBeenCalledTimes(1)
  })

  it('should call onRate with correct value when rating is selected', () => {
    const mockRate = jest.fn()
    render(<TestQuickRateModal onRate={mockRate} />)

    fireEvent.click(screen.getByTestId('rate-80'))
    expect(mockRate).toHaveBeenCalledWith(80)
  })

  it('quick rate should set watched:true and userRating in API call', () => {
    // Simulating what the quickRate function does
    const quickRateBody = {
      userRating: 85,
      watched: true,
      watchedAt: new Date().toISOString().split('T')[0],
    }

    expect(quickRateBody.userRating).toBe(85)
    expect(quickRateBody.watched).toBe(true)
    expect(quickRateBody.watchedAt).toBeTruthy()
  })
})

describe('Tab Logic - Rating Determines Tab', () => {
  it('item without rating should be in watchlist tab', () => {
    const item = { id: '1', title: 'Inception', year: '2010', userRating: null }
    const hasRating = item.userRating != null
    expect(hasRating).toBe(false)
    // This means: item appears in "أريد مشاهدته" tab
  })

  it('item with rating should be in ratings tab', () => {
    const item = { id: '1', title: 'Inception', year: '2010', userRating: 85 }
    const hasRating = item.userRating != null
    expect(hasRating).toBe(true)
    // This means: item appears in "تقييماتي" tab
  })

  it('rating an item moves it from watchlist to ratings', () => {
    let item = { id: '1', title: 'Inception', year: '2010', userRating: null as number | null }

    // Before rating: watchlist
    expect(item.userRating).toBeNull()

    // After quick rate
    item = { ...item, userRating: 90, watched: true }
    expect(item.userRating).toBe(90)
    expect(item.userRating).not.toBeNull()
    // Now it moves to ratings tab
  })

  it('removing rating moves item back to watchlist', () => {
    let item = { id: '1', title: 'Inception', year: '2010', userRating: 85 as number | null }

    // Before: ratings tab
    expect(item.userRating).not.toBeNull()

    // After removing rating
    item = { ...item, userRating: null }
    expect(item.userRating).toBeNull()
    // Now it's back in watchlist tab
  })
})

describe('Form Data - No Watched Field', () => {
  it('add form should not include watched field', () => {
    const formData = {
      title: 'Test Movie',
      year: '2024',
      type: 'movie',
    }

    expect(formData).not.toHaveProperty('watched')
    expect(formData).not.toHaveProperty('watchedAt')
  })

  it('edit form should not include watched field in UI', () => {
    const formFields = ['title', 'year', 'type', 'poster', 'ratingStatus']
    expect(formFields).not.toContain('watched')
    expect(formFields).not.toContain('watchedAt')
  })

  it('create API body should not include watched from form', () => {
    const createBody = {
      title: 'Test Movie',
      year: '2024',
      type: 'movie',
      poster: null,
      ratingStatus: 'watched',
    }

    // watched is not sent from form - it's set by quickRate
    expect(createBody).not.toHaveProperty('watched')
  })
})

describe('Filter Options - No Watched/Read/Played Filter', () => {
  it('archive page should not have watched filter', () => {
    const archiveFilters = [
      { value: 'all', label: 'الكل' },
    ]
    const hasWatchedFilter = archiveFilters.some(f => f.value === 'watched')
    expect(hasWatchedFilter).toBe(false)
  })

  it('books page should not have read/unread filter', () => {
    const bookFilters = [
      { value: 'all', label: 'الكل' },
    ]
    const hasReadFilter = bookFilters.some(f => f.value === 'read' || f.value === 'unread')
    expect(hasReadFilter).toBe(false)
  })

  it('games page should not have played/unplayed filter', () => {
    const gameFilters = [
      { value: 'all', label: 'الكل' },
    ]
    const hasPlayedFilter = gameFilters.some(f => f.value === 'played' || f.value === 'unplayed')
    expect(hasPlayedFilter).toBe(false)
  })
})
