'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useTranslation } from 'react-i18next'
import {
  useListDocuments,
  getGetDocumentThumbnailUrl,
} from '@/lib/api/documents/documents'
import { useEditorUiStore } from '@/lib/stores/editorUiStore'
import { ScrollArea } from '@/components/ui/scroll-area'

const THUMBNAIL_DPR =
  typeof window !== 'undefined'
    ? Math.min(Math.ceil(window.devicePixelRatio || 1), 3)
    : 2

// Fixed row height: thumbnail (aspect 3:4 in ~150px width ≈ 200px) + page number + padding
const ROW_HEIGHT = 230
const OVERSCAN = 5

export function Navigator() {
  const { data: documents = [] } = useListDocuments()
  const totalPages = documents.length
  const currentDocumentId = useEditorUiStore((state) => state.currentDocumentId)
  const selectedDocumentIds = useEditorUiStore(
    (state) => state.selectedDocumentIds,
  )
  const handleDocumentSelection = useEditorUiStore(
    (state) => state.handleDocumentSelection,
  )
  const clearDocumentSelection = useEditorUiStore(
    (state) => state.clearDocumentSelection,
  )
  const currentDocumentIndex = documents.findIndex(
    (d) => d.id === currentDocumentId,
  )
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const { t } = useTranslation()

  const virtualizer = useVirtualizer({
    count: totalPages,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  })

  const allSelected =
    totalPages > 0 && selectedDocumentIds.size === totalPages

  const handleSelectAll = () => {
    if (allSelected) {
      clearDocumentSelection()
    } else {
      useEditorUiStore.setState({
        selectedDocumentIds: new Set(documents.map((d) => d.id)),
        selectionAnchorIndex: 0,
      })
    }
  }

  return (
    <div
      data-testid='navigator-panel'
      data-total-pages={totalPages}
      className='bg-muted/50 flex h-full min-h-0 w-full flex-col border-r'
    >
      <div className='border-border border-b px-2 py-1.5'>
        <p className='text-muted-foreground text-xs tracking-wide uppercase'>
          {t('navigator.title')}
        </p>
        <p className='text-foreground text-xs font-semibold'>
          {totalPages
            ? t('navigator.pages', { count: totalPages })
            : t('navigator.empty')}
        </p>
      </div>

      <div className='text-muted-foreground flex items-center gap-1.5 px-2 py-1.5 text-xs'>
        {totalPages > 0 ? (
          <>
            <span className='bg-secondary text-secondary-foreground px-2 py-0.5 font-mono text-[10px]'>
              #{currentDocumentIndex + 1}
            </span>
            {selectedDocumentIds.size > 0 && (
              <span className='text-primary font-medium'>
                {t('navigator.selected', { count: selectedDocumentIds.size })}
              </span>
            )}
            <button
              className='hover:text-foreground ml-auto text-[10px] underline-offset-2 hover:underline'
              onClick={handleSelectAll}
            >
              {allSelected
                ? t('navigator.deselectAll')
                : t('navigator.selectAll')}
            </button>
          </>
        ) : (
          <span>{t('navigator.prompt')}</span>
        )}
      </div>

      <ScrollArea className='min-h-0 flex-1' viewportRef={viewportRef}>
        <div
          className='relative w-full'
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const doc = documents[virtualRow.index]
            return (
              <div
                key={doc?.id ?? virtualRow.index}
                className='absolute left-0 w-full px-1.5 pb-1'
                style={{
                  height: ROW_HEIGHT,
                  top: 0,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <PagePreview
                  index={virtualRow.index}
                  documentId={doc?.id}
                  selected={doc?.id === currentDocumentId}
                  checked={doc ? selectedDocumentIds.has(doc.id) : false}
                  onSelect={(e) => {
                    if (doc) {
                      handleDocumentSelection(
                        doc.id,
                        virtualRow.index,
                        documents,
                        {
                          shiftKey: e.shiftKey,
                          ctrlKey: e.ctrlKey || e.metaKey,
                        },
                      )
                    }
                  }}
                />
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

type PagePreviewProps = {
  index: number
  documentId?: string
  selected: boolean
  checked: boolean
  onSelect: (e: React.MouseEvent) => void
}

function PagePreview({
  index,
  documentId,
  selected,
  checked,
  onSelect,
}: PagePreviewProps) {
  const src = documentId
    ? getGetDocumentThumbnailUrl(documentId, { size: 200 * THUMBNAIL_DPR })
    : undefined

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect(e as unknown as React.MouseEvent)
        }
      }}
      data-testid={`navigator-page-${index}`}
      data-page-index={index}
      data-selected={selected}
      className='bg-card data-[selected=true]:border-primary relative flex h-full w-full cursor-pointer flex-col gap-0.5 rounded border border-transparent p-1.5 text-left shadow-sm hover:border-border select-none'
    >
      {checked && (
        <div className='bg-primary absolute top-2 right-2 z-10 flex size-4 items-center justify-center rounded-full'>
          <svg
            className='size-2.5 text-white'
            viewBox='0 0 10 10'
            fill='currentColor'
          >
            <path d='M8.5 2.5L4 7.5 1.5 5' stroke='currentColor' strokeWidth='1.5' fill='none' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </div>
      )}
      <div className='flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded'>
        {src ? (
          <img
            src={src}
            alt={`Page ${index + 1}`}
            loading='lazy'
            className='max-h-full max-w-full rounded object-contain'
          />
        ) : (
          <div className='bg-muted h-full w-full rounded' />
        )}
      </div>
      <div className='text-muted-foreground flex shrink-0 items-center text-xs'>
        <div className='text-foreground mx-auto font-semibold'>{index + 1}</div>
      </div>
    </div>
  )
}
