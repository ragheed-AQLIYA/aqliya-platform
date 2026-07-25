import { getContactReviewsAndReviewers } from "@/actions/contact-detail-read-actions";
import { ReviewAssignmentPanel } from "@/components/contacts/review-assignment-panel";

interface ReviewsSectionProps {
  contactId: string;
  orgId: string;
  userId: string;
  userRole: string;
}

export async function ReviewsSection({ contactId, orgId, userId: _userId, userRole }: ReviewsSectionProps) {
  const { reviews, availableReviewers } = await getContactReviewsAndReviewers(contactId, orgId, userRole);

  const serializedReviews = reviews.map((r) => ({
    ...r,
    reviewDueDate: r.reviewDueDate?.toISOString() ?? null,
    completedAt: r.completedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    approvals: r.approvals.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
  }));

  return (
    <ReviewAssignmentPanel
      contactId={contactId}
      organizationId={orgId}
      reviews={serializedReviews}
      availableReviewers={availableReviewers}
      userRole={userRole}
    />
  );
}
