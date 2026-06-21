import { describe, expect, it, jest } from '@jest/globals'

// Mock PDFKit before importing the module
const mockDoc = {
  font: jest.fn().mockReturnThis(),
  fontSize: jest.fn().mockReturnThis(),
  fillColor: jest.fn().mockReturnThis(),
  text: jest.fn().mockReturnThis(),
  moveDown: jest.fn().mockReturnThis(),
  on: jest.fn((event: string, cb: () => void) => {
    // Immediately emit 'end' so the promise resolves
    if (event === 'end') {
      setImmediate(cb)
    }
    return mockDoc
  }),
  end: jest.fn().mockReturnThis(),
  switchToPage: jest.fn().mockReturnThis(),
  bufferedPageRange: jest.fn(() => ({ start: 0, count: 1 })),
  page: { height: 842 },
}

jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => mockDoc)
})

// Increase default timeout for all tests
jest.setTimeout(10000)

import { buildContentStudioPDF } from '../content-export'

describe('buildContentStudioPDF', () => {
  const baseInput = {
    contentId: 'cnt-123',
    title: 'Test Content Title',
    body: 'This is the body content.\n\nIt has multiple paragraphs.\n\n## Section Two\n\n- Item A\n- Item B\n\n### Subsection\n\nFinal paragraph.',
    summary: 'A test summary for the content',
    status: 'PUBLISHED',
    contentType: 'article',
    version: 3,
    locale: 'ar',
    tags: ['test', 'content', 'export'],
    workspaceName: 'Test Workspace',
    createdByName: 'Ahmed',
    reviewedByName: 'Sara',
    approvedByName: 'Mohammad',
    publishedAt: new Date('2026-06-01'),
    createdAt: new Date('2026-05-15'),
    updatedAt: new Date('2026-06-10'),
    exportedAt: new Date('2026-06-21'),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns correct result structure', async () => {
    const result = await buildContentStudioPDF(baseInput)

    expect(result.format).toBe('pdf')
    expect(result.mimeType).toBe('application/pdf')
    expect(result.filename).toContain('content_studio')
    expect(result.filename).toContain('.pdf')
    expect(Buffer.isBuffer(result.content)).toBe(true)
  })

  it('calls pdfkit with correct document info', async () => {
    const PDFDocument = require('pdfkit')
    await buildContentStudioPDF(baseInput)

    expect(PDFDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        size: 'A4',
        info: expect.objectContaining({
          Title: expect.stringContaining('Test Content Title'),
          Author: 'AQLIYA ContentStudio',
        }),
      }),
    )
  })

  it('renders the title and meta information', async () => {
    await buildContentStudioPDF(baseInput)

    const textCalls = mockDoc.text.mock.calls.flat().join(' ')
    expect(textCalls).toContain('Test Content Title')
    expect(textCalls).toContain('Test Workspace')
    expect(textCalls).toContain('v3')
    expect(textCalls).toContain('منشور')
    expect(textCalls).toContain('article')
  })

  it('renders the summary when provided', async () => {
    await buildContentStudioPDF(baseInput)

    const textCalls = mockDoc.text.mock.calls.flat().join(' ')
    expect(textCalls).toContain('A test summary for the content')
  })

  it('renders tags', async () => {
    await buildContentStudioPDF(baseInput)

    const textCalls = mockDoc.text.mock.calls.flat().join(' ')
    expect(textCalls).toContain('test')
    expect(textCalls).toContain('content')
    expect(textCalls).toContain('export')
  })

  it('renders markdown headings as formatted text', async () => {
    const input = {
      ...baseInput,
      body: '# Heading 1\n\n## Heading 2\n\n### Heading 3\n\nNormal text',
    }
    await buildContentStudioPDF(input)

    // Should have called font for body - the markdown headings trigger bold font
    // Just verify no crash and basic text output
    const textCalls = mockDoc.text.mock.calls.flat().join(' ')
    expect(textCalls).toContain('Normal text')
  })

  it('renders works without summary', async () => {
    const input = { ...baseInput, summary: null }
    const result = await buildContentStudioPDF(input)
    expect(result.format).toBe('pdf')
  })

  it('renders works without creator names', async () => {
    const input = {
      ...baseInput,
      createdByName: null,
      reviewedByName: null,
      approvedByName: null,
    }
    const result = await buildContentStudioPDF(input)
    expect(result.format).toBe('pdf')
  })

  it('renders works without published date', async () => {
    const input = { ...baseInput, publishedAt: null }
    const result = await buildContentStudioPDF(input)
    expect(result.format).toBe('pdf')
  })

  it('renders works with empty tags', async () => {
    const input = { ...baseInput, tags: [] }
    const result = await buildContentStudioPDF(input)
    expect(result.format).toBe('pdf')
  })

  it('renders all lifecycle statuses without crash', async () => {
    const statuses = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']
    for (const status of statuses) {
      jest.clearAllMocks()
      const input = { ...baseInput, status }
      const result = await buildContentStudioPDF(input)
      expect(result.format).toBe('pdf')
    }
  })

  it('renders content in empty body', async () => {
    const input = { ...baseInput, body: '' }
    const result = await buildContentStudioPDF(input)
    expect(result.format).toBe('pdf')
  })

  it('includes page numbers', async () => {
    await buildContentStudioPDF(baseInput)

    const textCalls = mockDoc.text.mock.calls.flat().join(' ')
    expect(textCalls).toContain('Page 1')
    expect(textCalls).toContain('AQLIYA ContentStudio')
  })

  it('includes disclaimer text', async () => {
    await buildContentStudioPDF(baseInput)

    const textCalls = mockDoc.text.mock.calls.flat().join(' ')
    expect(textCalls).toContain('الذكاء يساعد')
    expect(textCalls).toContain('AI assists')
  })
})
