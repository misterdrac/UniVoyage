import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import type { AdminPendingReview } from '@/services/api/adminApi';
import { Button } from '@/components/ui/button';
import {
  AdminHeader,
  AdminPagination,
  AdminLoadingState,
  AdminEmptyState,
} from '@/components/admin';
import { Star, Check, X, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const AdminReviewsPage: React.FC = () => {
  useDocumentTitle('Admin - Reviews');

  const [reviews, setReviews] = useState<AdminPendingReview[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [actioningId, setActioningId] = useState<number | null>(null)
  const PAGE_SIZE = 10

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await apiService.getPendingReviews({ page, size: PAGE_SIZE })
      setReviews(result.content)
      setTotalPages(result.totalPages)
      setTotalElements(result.totalElements)
    } catch {
      toast.error('Failed to load pending reviews')
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleApprove = async (ratingId: number) => {
    setActioningId(ratingId)
    try {
      await apiService.approveReview(ratingId)
      toast.success('Review approved')
      setReviews((prev) => prev.filter((r) => r.ratingId !== ratingId))
      setTotalElements((prev) => prev - 1)
    } catch {
      toast.error('Failed to approve review')
    } finally {
      setActioningId(null)
    }
  }

  const handleReject = async (ratingId: number) => {
    setActioningId(ratingId)
    try {
      await apiService.rejectReview(ratingId)
      toast.success('Review rejected')
      setReviews((prev) => prev.filter((r) => r.ratingId !== ratingId))
      setTotalElements((prev) => prev - 1)
    } catch {
      toast.error('Failed to reject review')
    } finally {
      setActioningId(null)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--admin-bg-gradient)' }}>
      <AdminHeader
        title="Review Moderation"
        icon={<MessageSquare className="w-4 h-4" style={{ color: 'var(--ds-contrast-fg)' }} />}
        gradientStyle={{ background: 'linear-gradient(to bottom right, var(--admin-gradient-start), var(--admin-gradient-end))' }}
      />

      <main className="p-4 sm:p-6">
        <div className="bg-card rounded-2xl border shadow-lg">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Pending Reviews
              {totalElements > 0 && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">
                  {totalElements}
                </span>
              )}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Destination</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Stars</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Comment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <AdminLoadingState colSpan={6} message="Loading pending reviews..." />
                ) : reviews.length === 0 ? (
                  <AdminEmptyState colSpan={6} message="No pending reviews" />
                ) : (
                  reviews.map((review) => (
                    <tr key={review.ratingId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-foreground">{review.destinationName}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-muted-foreground">{review.userEmail}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`size-3.5 ${star <= review.stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <p className="text-sm text-muted-foreground italic line-clamp-2">"{review.comment}"</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(review.updatedAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(review.ratingId)}
                            disabled={actioningId === review.ratingId}
                            className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
                          >
                            {actioningId === review.ratingId ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Check className="size-3.5" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(review.ratingId)}
                            disabled={actioningId === review.ratingId}
                            className="h-8 px-3 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            {actioningId === review.ratingId ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <X className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentCount={reviews.length}
            totalCount={totalElements}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            itemLabel="reviews"
          />
        </div>
      </main>
    </div>
  )
}

export default AdminReviewsPage;
