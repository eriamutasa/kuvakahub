/**
 * KuvakaHub Privacy-Safe Analytics & Error Logging Layer for MVP Pilot
 */

export type AnalyticsEventName =
  | "USER_REGISTERED"
  | "PROVIDER_ONBOARDING_COMPLETED"
  | "PROJECT_POSTED"
  | "QUOTATION_SUBMITTED"
  | "PROVIDER_SELECTED"
  | "PROJECT_ACTIVATED"
  | "MILESTONE_STARTED"
  | "EVIDENCE_UPLOADED"
  | "MILESTONE_SUBMITTED"
  | "INSPECTION_ASSIGNED"
  | "INSPECTION_COMPLETED"
  | "MILESTONE_APPROVED"
  | "PAYMENT_APPROVED"
  | "PAYMENT_MARKED_PAID"
  | "PAYMENT_RECEIPT_CONFIRMED"
  | "PAYMENT_DISPUTED"
  | "PROJECT_COMPLETED"
  | "REVIEW_SUBMITTED"
  | "FEEDBACK_SUBMITTED";

export interface AnalyticsEvent {
  id: string;
  eventName: AnalyticsEventName;
  userId?: string;
  userRole?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

class AnalyticsLogger {
  private events: AnalyticsEvent[] = [];

  /**
   * Logs a privacy-safe analytics event for marketplace funnel measurement.
   */
  trackEvent(eventName: AnalyticsEventName, userId?: string, userRole?: string, metadata?: Record<string, any>) {
    // Sanitize metadata to strip passwords, access tokens, or raw credentials
    const cleanMetadata = metadata ? this.sanitizeMetadata(metadata) : undefined;

    const event: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      eventName,
      userId,
      userRole,
      metadata: cleanMetadata,
      timestamp: new Date().toISOString(),
    };

    this.events.unshift(event);
    if (process.env.NODE_ENV === "development") {
      console.log(`[ANALYTICS] ${eventName}`, { userId, userRole, cleanMetadata });
    }
  }

  /**
   * Log operational errors without leaking credentials or tokens
   */
  logError(context: string, error: any, userId?: string) {
    const errorDetails = {
      context,
      message: error?.message || String(error),
      userId,
      timestamp: new Date().toISOString(),
    };

    console.error(`[KUVAKAHUB ERROR] ${context}:`, errorDetails);
  }

  getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  private sanitizeMetadata(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };
    const secretKeys = ["password", "token", "accessToken", "refreshToken", "secret", "privateKey"];
    for (const key of Object.keys(sanitized)) {
      if (secretKeys.some((s) => key.toLowerCase().includes(s))) {
        delete sanitized[key];
      }
    }
    return sanitized;
  }
}

export const analytics = new AnalyticsLogger();
