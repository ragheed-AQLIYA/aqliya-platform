export interface Reviewer {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Review {
  id: string;
  reviewType: string;
  status: string;
  reviewerId: string;
  reviewerName: string | null;
  reason: string | null;
  reviewerNotes: string | null;
  reviewDueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  approvals: {
    id: string;
    approverName: string | null;
    status: string;
    note: string | null;
    createdAt: string;
  }[];
}
