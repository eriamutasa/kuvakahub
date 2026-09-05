/**
 * KuvakaHub Pilot User Feedback Store
 */

export type FeedbackCategory = "CONFUSING" | "BROKEN" | "FEATURE_SUGGESTION" | "OTHER";

export interface UserFeedbackItem {
  id: string;
  userId?: string;
  userRole?: string;
  category: FeedbackCategory;
  message: string;
  pageContext?: string;
  createdAt: string;
}

class FeedbackStore {
  private feedbackItems: UserFeedbackItem[] = [];

  submitFeedback(data: Omit<UserFeedbackItem, "id" | "createdAt">): UserFeedbackItem {
    const item: UserFeedbackItem = {
      ...data,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.feedbackItems.unshift(item);
    return item;
  }

  getFeedbackForAdmin(): UserFeedbackItem[] {
    return this.feedbackItems;
  }
}

export const feedbackStore = new FeedbackStore();
