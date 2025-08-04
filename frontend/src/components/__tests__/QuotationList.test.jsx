import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent, mockQuotation } from '../test/utils'
import QuotationList from '../components/QuotationList'

// Mock the hooks
vi.mock('../hooks/useQuotationsQuery', () => ({
  useQuotations: () => ({
    data: [mockQuotation],
    isLoading: false,
    error: null,
  }),
  useCreateQuotation: () => ({
    mutate: vi.fn(),
    isLoading: false,
  }),
  useUpdateQuotation: () => ({
    mutate: vi.fn(),
    isLoading: false,
  }),
  useDeleteQuotation: () => ({
    mutate: vi.fn(),
    isLoading: false,
  }),
}))

describe('QuotationList', () => {
  const defaultProps = {
    quotations: [mockQuotation],
    onQuotationAction: vi.fn(),
    onCreateNew: vi.fn(),
    searchQuery: '',
    onSearchChange: vi.fn(),
    isLoading: false,
    error: null,
  }

  it('renders quotation list correctly', () => {
    renderWithProviders(<QuotationList {...defaultProps} />)
    
    expect(screen.getByText('QUO-001')).toBeInTheDocument()
    expect(screen.getByText('Test Customer')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    renderWithProviders(
      <QuotationList {...defaultProps} isLoading={true} />
    )
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows error state', () => {
    renderWithProviders(
      <QuotationList {...defaultProps} error={{ message: 'Test error' }} />
    )
    
    expect(screen.getByText(/test error/i)).toBeInTheDocument()
  })

  it('handles search input', async () => {
    const user = userEvent.setup()
    const onSearchChange = vi.fn()
    
    renderWithProviders(
      <QuotationList {...defaultProps} onSearchChange={onSearchChange} />
    )
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'test')
    
    expect(onSearchChange).toHaveBeenCalledWith('test')
  })

  it('calls onCreateNew when create button is clicked', async () => {
    const user = userEvent.setup()
    const onCreateNew = vi.fn()
    
    renderWithProviders(
      <QuotationList {...defaultProps} onCreateNew={onCreateNew} />
    )
    
    const createButton = screen.getByText(/create new/i)
    await user.click(createButton)
    
    expect(onCreateNew).toHaveBeenCalled()
  })

  it('handles quotation actions', async () => {
    const user = userEvent.setup()
    const onQuotationAction = vi.fn()
    
    renderWithProviders(
      <QuotationList {...defaultProps} onQuotationAction={onQuotationAction} />
    )
    
    // Find and click action button (assuming there's a view button)
    const actionButton = screen.getByRole('button', { name: /view/i })
    await user.click(actionButton)
    
    expect(onQuotationAction).toHaveBeenCalledWith('view', mockQuotation)
  })
})
