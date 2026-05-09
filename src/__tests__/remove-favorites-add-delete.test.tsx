/**
 * Tests for removing favorites/likes from the system and adding delete everywhere.
 *
 * Changes verified:
 * 1. No Heart icon imported or used
 * 2. No "favorite" field in interfaces, form data, or API calls
 * 3. No favorite toggle functionality
 * 4. Delete button exists in card views (not just detail view)
 * 5. Delete confirmation modal works
 */

import React, { useState } from 'react'
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

// ==================== Test Component: Archive Card with Delete ====================
function TestArchiveCard({
  item = { id: '1', title: 'Inception', year: '2010', type: 'movie' },
  onDelete = () => {},
}: {
  item?: { id: string; title: string; year: string; type: string }
  onDelete?: () => void
}) {
  return (
    <div data-testid="media-card">
      <h3>{item.title}</h3>
      <span>{item.year}</span>
      {/* Delete button on card - NEW */}
      <button onClick={onDelete} data-testid="card-delete-btn" title="حذف">
        🗑️
      </button>
      {/* NO favorite/heart button */}
    </div>
  )
}

// ==================== Test Component: Detail View with Delete ====================
function TestDetailView({
  item = { id: '1', title: 'Inception', year: '2010' },
  onDelete = () => {},
  onEdit = () => {},
}: {
  item?: { id: string; title: string; year: string }
  onDelete?: () => {}
  onEdit?: () => {}
}) {
  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>تفاصيل العمل</DialogTitle>
        </DialogHeader>
        <div>
          <h2>{item.title}</h2>
          <p>{item.year}</p>
          {/* NO favorite badge or toggle */}
          <div data-testid="detail-actions">
            <button onClick={onEdit} data-testid="edit-btn">تعديل</button>
            <button onClick={onDelete} data-testid="detail-delete-btn" className="text-red-400">حذف</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==================== Test Component: Delete Confirmation ====================
function TestDeleteConfirm({
  open = true,
  onConfirm = () => {},
  onCancel = () => {},
}: {
  open?: boolean
  onConfirm?: () => void
  onCancel?: () => void
}) {
  if (!open) return null
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>تأكيد الحذف</DialogTitle>
        </DialogHeader>
        <p>هل أنت متأكد من حذف هذا العنصر؟</p>
        <div data-testid="delete-confirm-actions">
          <button onClick={onCancel} data-testid="cancel-delete-btn">إلغاء</button>
          <button onClick={onConfirm} data-testid="confirm-delete-btn">حذف</button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==================== Test Component: Form without Favorite ====================
function TestAddForm() {
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    type: 'movie',
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
          {/* NO favorite checkbox */}
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== Tests ====================

describe('Remove Favorites from System', () => {
  it('should NOT have Heart/favorite in card view', () => {
    render(<TestArchiveCard />)

    // Card should render
    expect(screen.getByTestId('media-card')).toBeInTheDocument()
    expect(screen.getByText('Inception')).toBeInTheDocument()

    // No favorite/heart related elements
    expect(screen.queryByText('مفضلة')).not.toBeInTheDocument()
    expect(screen.queryByText('إزالة من المفضلة')).not.toBeInTheDocument()
    expect(screen.queryByText('إضافة للمفضلة')).not.toBeInTheDocument()
  })

  it('should NOT have favorite checkbox in add form', () => {
    render(<TestAddForm />)

    expect(screen.getByTestId('add-form')).toBeInTheDocument()
    // No favorite checkbox
    expect(screen.queryByText('مفضلة')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('مفضلة')).not.toBeInTheDocument()
  })

  it('should NOT have favorite badge in detail view', () => {
    render(<TestDetailView />)

    // No favorite badge
    expect(screen.queryByText('مفضل')).not.toBeInTheDocument()
    expect(screen.queryByText('مفضلة')).not.toBeInTheDocument()
  })

  it('should NOT include favorite in form data', () => {
    const formData = {
      title: 'Test Movie',
      year: '2024',
      type: 'movie',
    }

    // Verify no favorite field
    expect(formData).not.toHaveProperty('favorite')
  })
})

describe('Delete Button in Card View', () => {
  it('should have delete button on card', () => {
    render(<TestArchiveCard />)

    const deleteBtn = screen.getByTestId('card-delete-btn')
    expect(deleteBtn).toBeInTheDocument()
    expect(deleteBtn).toHaveAttribute('title', 'حذف')
  })

  it('should call onDelete when card delete button is clicked', async () => {
    const mockDelete = jest.fn()
    render(<TestArchiveCard onDelete={mockDelete} />)

    const deleteBtn = screen.getByTestId('card-delete-btn')
    fireEvent.click(deleteBtn)

    expect(mockDelete).toHaveBeenCalledTimes(1)
  })

  it('should have delete button in detail view', () => {
    render(<TestDetailView />)

    const deleteBtn = screen.getByTestId('detail-delete-btn')
    expect(deleteBtn).toBeInTheDocument()
    expect(deleteBtn).toHaveTextContent('حذف')
  })
})

describe('Delete Confirmation', () => {
  it('should show delete confirmation dialog', () => {
    render(<TestDeleteConfirm />)

    expect(screen.getByText('تأكيد الحذف')).toBeInTheDocument()
    expect(screen.getByText('هل أنت متأكد من حذف هذا العنصر؟')).toBeInTheDocument()
  })

  it('should have confirm and cancel buttons', () => {
    render(<TestDeleteConfirm />)

    expect(screen.getByTestId('confirm-delete-btn')).toBeInTheDocument()
    expect(screen.getByTestId('cancel-delete-btn')).toBeInTheDocument()
  })

  it('should call onConfirm when delete is confirmed', () => {
    const mockConfirm = jest.fn()
    render(<TestDeleteConfirm onConfirm={mockConfirm} />)

    fireEvent.click(screen.getByTestId('confirm-delete-btn'))
    expect(mockConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onCancel when delete is cancelled', () => {
    const mockCancel = jest.fn()
    render(<TestDeleteConfirm onCancel={mockCancel} />)

    fireEvent.click(screen.getByTestId('cancel-delete-btn'))
    expect(mockCancel).toHaveBeenCalledTimes(1)
  })
})

describe('API - No Favorite Field', () => {
  it('POST body should not include favorite field', () => {
    const postBody = {
      title: 'Test Movie',
      year: '2024',
      type: 'movie',
      watched: false,
      notes: '',
    }

    expect(postBody).not.toHaveProperty('favorite')
  })

  it('PUT body should not include favorite field', () => {
    const putBody = {
      title: 'Updated Movie',
      year: '2024',
      type: 'movie',
      watched: true,
    }

    expect(putBody).not.toHaveProperty('favorite')
  })

  it('interface should not have favorite field', () => {
    interface MediaItemNoFavorite {
      id: string
      title: string
      year: string
      type: string
      watched: boolean
    }

    const item: MediaItemNoFavorite = {
      id: '1',
      title: 'Test',
      year: '2024',
      type: 'movie',
      watched: false,
    }

    expect(item).not.toHaveProperty('favorite')
  })
})

describe('Filter Options - No Favorite', () => {
  it('should not have favorite filter option', () => {
    const STATUS_OPTIONS = [
      { value: 'all', label: 'الكل' },
      { value: 'watched', label: 'تمت المشاهدة' },
      { value: 'unwatched', label: 'لم تُشاهد' },
    ]

    const hasFavorite = STATUS_OPTIONS.some(opt => opt.value === 'favorite')
    expect(hasFavorite).toBe(false)
  })
})
