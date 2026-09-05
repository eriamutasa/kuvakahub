import { APP_NAME } from "./constants";

/**
 * Normalizes phone numbers to standard E.164 format.
 * Converts local Zim numbers like '0771234567' to '+263771234567'.
 */
export function normalizeE164Phone(rawPhone: string, defaultCountryCode = "263"): string {
  if (!rawPhone) return "";
  // Strip spaces, dashes, brackets
  let cleaned = rawPhone.replace(/[\s\-\(\)]/g, "");

  // If starts with +, extract digits
  if (cleaned.startsWith("+")) {
    return `+${cleaned.replace(/\D/g, "")}`;
  }

  // If starts with 0 (e.g. 0771234567), strip leading 0 and add country code
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
    return `+${defaultCountryCode}${cleaned}`;
  }

  // If already starts with country code e.g. 263...
  if (cleaned.startsWith(defaultCountryCode)) {
    return `+${cleaned}`;
  }

  return `+${cleaned}`;
}

/**
 * Returns digits-only string for wa.me links (without +)
 */
export function formatPhoneForWhatsAppLink(e164Phone: string): string {
  return e164Phone.replace(/\D/g, "");
}

/**
 * Generates a wa.me deep link with pre-populated contextual message.
 */
export function generateWhatsAppLink(phone: string, text: string): string {
  const normalizedPhone = normalizeE164Phone(phone);
  const digitsOnly = formatPhoneForWhatsAppLink(normalizedPhone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${digitsOnly}?text=${encodedText}`;
}

// Pre-defined WhatsApp Message Generators

export function getProviderContactMessage(providerName: string, projectTitle: string): string {
  return `Hi ${providerName}, I found your profile on ${APP_NAME} regarding my project '${projectTitle}' in Chinhoyi. I would like to discuss a quotation.`;
}

export function getShareProjectMessage(projectTitle: string, suburb: string, publicUrl: string): string {
  return `Check out this construction opportunity in ${suburb}, Chinhoyi on ${APP_NAME}:\n*${projectTitle}*\n\nView details: ${publicUrl}`;
}

export function getMilestoneSubmittedMessage(clientName: string, milestoneTitle: string, projectTitle: string, milestoneUrl: string): string {
  return `Hi ${clientName}, progress evidence for milestone '*${milestoneTitle}*' on project '*${projectTitle}*' has been uploaded on ${APP_NAME}.\n\nReview evidence: ${milestoneUrl}`;
}

export function getInspectionVerifiedMessage(clientName: string, milestoneTitle: string, inspectorName: string, reportUrl: string): string {
  return `Official Inspection Update: Milestone '*${milestoneTitle}*' has been independently VERIFIED by Inspector ${inspectorName} on ${APP_NAME}.\n\nView certificate: ${reportUrl}`;
}

export function getSharePaymentMessage(milestoneTitle: string, amount: number, methodLabel: string): string {
  return `Hi, I've marked payment for milestone '*${milestoneTitle}*' ($${amount.toLocaleString()}) as paid via ${methodLabel} on ${APP_NAME}. Please log in to confirm receipt.`;
}
