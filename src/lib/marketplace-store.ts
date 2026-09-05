import { LAUNCH_CITY } from "./constants";

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  city: string;
  suburb: string;
  budgetEstimate?: number;
  status: "DRAFT" | "OPEN_FOR_QUOTATIONS" | "PROVIDER_SELECTED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  description: string;
  visibility: "MARKETPLACE" | "INVITE_ONLY";
  preferredTimeframe: string;
  timeframe?: string;
  addressPrivate?: string;
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  quotationId: string;
  itemType: "LABOUR" | "MATERIAL";
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface Quotation {
  id: string;
  projectId: string;
  providerId: string;
  providerName: string;
  providerBusinessName: string;
  providerPhone: string;
  providerExperience: string;
  providerRating?: number;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED";
  laborSubtotal: number;
  materialSubtotal: number;
  totalAmount: number;
  estDurationDays: number;
  proposedStartDate: string;
  status: "DRAFT" | "SUBMITTED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
  notes?: string;
  items: QuotationItem[];
  createdAt: string;
}

export interface ProjectProviderAssignment {
  id: string;
  projectId: string;
  providerId: string;
  acceptedQuotationId: string;
  assignedAt: string;
  status: "ACTIVE" | "COMPLETED" | "TERMINATED";
}

export type MilestoneStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "PROVIDER_SUBMITTED"
  | "INSPECTION_REQUIRED"
  | "INSPECTOR_VERIFIED"
  | "NEEDS_ATTENTION"
  | "CLIENT_APPROVED"
  | "REJECTED";

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  orderIndex: number;
  amount: number;
  status: MilestoneStatus;
  dueDate?: string;
  clientDecision?: "APPROVED" | "RETURNED";
  clientReturnReason?: string;
}

export interface ProviderEvidenceItem {
  id: string;
  milestoneId: string;
  uploadedByUserId: string;
  storagePath: string;
  mediaType: "IMAGE" | "VIDEO" | "DOCUMENT";
  fileSize: number;
  mimeType: string;
  notes: string;
  uploadedAt: string;
}

export type InspectionAssignmentStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "VISIT_REQUIRED"
  | "SUBMITTED"
  | "COMPLETED"
  | "CANCELLED";

export interface InspectionAssignment {
  id: string;
  milestoneId: string;
  inspectorId: string;
  inspectorName: string;
  assignedByAdminId: string;
  assignedAt: string;
  scheduledDate: string;
  status: InspectionAssignmentStatus;
  completedAt?: string;
}

export interface InspectionReport {
  id: string;
  milestoneId: string;
  inspectorId: string;
  inspectorName: string;
  assignmentId: string;
  result: "VERIFIED" | "NEEDS_ATTENTION" | "REJECTED";
  summaryNotes: string; // Private to Client / Inspector / Admin
  providerFeedback: string; // Safe correction instructions shared with Provider
  createdAt: string;
}

export interface InspectorEvidenceItem {
  id: string;
  reportId: string;
  uploadedByUserId: string;
  storagePath: string;
  mediaType: "IMAGE" | "VIDEO" | "DOCUMENT";
  fileSize: number;
  mimeType: string;
  notes: string;
  uploadedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  channel: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: any;
  createdAt: string;
}

export type PaymentStatus = "NOT_DUE" | "PENDING_APPROVAL" | "APPROVED" | "PAID" | "DISPUTED";

export interface PaymentRecord {
  id: string;
  projectId: string;
  milestoneId: string;
  clientId: string;
  providerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  approvedAt?: string;
  paidAt?: string;
  paymentMethodLabel?: string;
  externalReference?: string;
  clientNote?: string;
  providerAcknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";

export interface PaymentDispute {
  id: string;
  paymentRecordId: string;
  milestoneId: string;
  projectId: string;
  raisedByUserId: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedByAdminId?: string;
  resolutionNotes?: string;
}

export interface ProviderReview {
  id: string;
  projectId: string;
  reviewerClientId: string;
  reviewerName: string;
  providerId: string;
  overallRating: number;
  qualityRating?: number;
  communicationRating?: number;
  timelinessRating?: number;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderProfile {
  id: string;
  name: string;
  businessName: string;
  categorySlug: string;
  categoryName: string;
  city: string;
  suburb: string;
  experience: string;
  bio: string;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED";
  phone: string;
  portfolio?: { id: string; title: string; url: string }[];
}

export interface InspectorProfile {
  id: string;
  name: string;
  qualification?: string;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED";
  phone?: string;
}

// Production seed state: Empty by default. Data is persisted from Supabase Auth & DB.
const INITIAL_PROJECTS: Project[] = [];
const INITIAL_QUOTATIONS: Quotation[] = [];
const INITIAL_ASSIGNMENTS: ProjectProviderAssignment[] = [];
const INITIAL_MILESTONES: Milestone[] = [];
const INITIAL_PROVIDER_EVIDENCE: ProviderEvidenceItem[] = [];
const INITIAL_INSPECTION_ASSIGNMENTS: InspectionAssignment[] = [];
const INITIAL_INSPECTION_REPORTS: InspectionReport[] = [];
const INITIAL_INSPECTOR_EVIDENCE: InspectorEvidenceItem[] = [];
const INITIAL_PAYMENT_RECORDS: PaymentRecord[] = [];
const INITIAL_PAYMENT_DISPUTES: PaymentDispute[] = [];
const INITIAL_PROVIDER_REVIEWS: ProviderReview[] = [];

class MarketplaceStore {
  private projects: Project[] = [...INITIAL_PROJECTS];
  private quotations: Quotation[] = [...INITIAL_QUOTATIONS];
  private assignments: ProjectProviderAssignment[] = [...INITIAL_ASSIGNMENTS];
  private milestones: Milestone[] = [...INITIAL_MILESTONES];
  private providerEvidence: ProviderEvidenceItem[] = [...INITIAL_PROVIDER_EVIDENCE];
  private inspectionAssignments: InspectionAssignment[] = [...INITIAL_INSPECTION_ASSIGNMENTS];
  private inspectionReports: InspectionReport[] = [...INITIAL_INSPECTION_REPORTS];
  private inspectorEvidence: InspectorEvidenceItem[] = [...INITIAL_INSPECTOR_EVIDENCE];
  private paymentRecords: PaymentRecord[] = [...INITIAL_PAYMENT_RECORDS];
  private paymentDisputes: PaymentDispute[] = [...INITIAL_PAYMENT_DISPUTES];
  private providerReviews: ProviderReview[] = [...INITIAL_PROVIDER_REVIEWS];
  private providerProfiles: ProviderProfile[] = [];
  private inspectorProfiles: InspectorProfile[] = [];
  private notifications: NotificationItem[] = [];
  private auditLogs: AuditLogItem[] = [];

  // --- PROVIDER & INSPECTOR PROFILES ---
  getProviderProfiles(): ProviderProfile[] {
    return this.providerProfiles;
  }

  getProviderProfileById(id: string): ProviderProfile | undefined {
    return this.providerProfiles.find((p) => p.id === id);
  }

  saveProviderProfile(profile: ProviderProfile) {
    const idx = this.providerProfiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      this.providerProfiles[idx] = profile;
    } else {
      this.providerProfiles.push(profile);
    }
  }

  getVerifiedInspectors(): InspectorProfile[] {
    return this.inspectorProfiles.filter((i) => i.verificationStatus === "VERIFIED");
  }

  saveInspectorProfile(profile: InspectorProfile) {
    const idx = this.inspectorProfiles.findIndex((i) => i.id === profile.id);
    if (idx >= 0) {
      this.inspectorProfiles[idx] = profile;
    } else {
      this.inspectorProfiles.push(profile);
    }
  }

  getAssignmentForProject(projectId: string): ProjectProviderAssignment | undefined {
    return this.assignments.find((a) => a.projectId === projectId && a.status === "ACTIVE");
  }

  // --- PROJECTS & ACTIVATION ---
  getProjects(status?: string): Project[] {
    if (status) return this.projects.filter((p) => p.status === status);
    return this.projects;
  }

  getPublicJobListings(): Omit<Project, "addressPrivate" | "budgetEstimate">[] {
    return this.projects
      .filter((p) => p.status === "OPEN_FOR_QUOTATIONS" && p.visibility === "MARKETPLACE")
      .map(({ addressPrivate, budgetEstimate, ...publicInfo }) => publicInfo);
  }

  getProjectsForClient(clientId: string): Project[] {
    return this.projects.filter((p) => p.clientId === clientId);
  }

  getProjectsForProvider(providerId: string): Project[] {
    const assignedProjectIds = this.assignments
      .filter((a) => a.providerId === providerId)
      .map((a) => a.projectId);
    return this.projects.filter((p) => assignedProjectIds.includes(p.id));
  }

  getMatchingJobsForProvider(categorySlug?: string): Project[] {
    return this.projects.filter(
      (p) => p.status === "OPEN_FOR_QUOTATIONS" && p.visibility === "MARKETPLACE" && (!categorySlug || p.categorySlug === categorySlug)
    );
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }

  createProject(data: Omit<Project, "id" | "createdAt">): Project {
    const newProject: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.projects.unshift(newProject);

    this.logAudit({
      actorUserId: data.clientId,
      action: "PROJECT_CREATED",
      entityType: "Project",
      entityId: newProject.id,
      metadata: { title: newProject.title },
    });

    if (newProject.status === "OPEN_FOR_QUOTATIONS") {
      this.logAudit({
        actorUserId: data.clientId,
        action: "PROJECT_PUBLISHED",
        entityType: "Project",
        entityId: newProject.id,
      });
    }

    return newProject;
  }

  activateProject(projectId: string, clientId: string): boolean {
    const project = this.getProjectById(projectId);
    const assignment = this.assignments.find((a) => a.projectId === projectId && a.status === "ACTIVE");

    if (!project || project.clientId !== clientId || !assignment) {
      return false;
    }

    project.status = "ACTIVE";

    this.logAudit({
      actorUserId: clientId,
      action: "PROJECT_ACTIVATED",
      entityType: "Project",
      entityId: projectId,
    });

    return true;
  }

  // --- MILESTONES ---
  getMilestonesForProject(projectId: string): Milestone[] {
    return this.milestones
      .filter((m) => m.projectId === projectId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  getMilestoneById(milestoneId: string): Milestone | undefined {
    return this.milestones.find((m) => m.id === milestoneId);
  }

  createMilestone(data: Omit<Milestone, "id" | "status">, clientId: string): Milestone | null {
    const project = this.getProjectById(data.projectId);
    if (!project || project.clientId !== clientId) return null;

    // Check unique order_index per project
    const existing = this.milestones.find(
      (m) => m.projectId === data.projectId && m.orderIndex === data.orderIndex
    );
    if (existing) {
      data.orderIndex = this.milestones.filter((m) => m.projectId === data.projectId).length + 1;
    }

    const milestone: Milestone = {
      ...data,
      id: `ms-${Date.now()}`,
      status: "NOT_STARTED",
    };

    this.milestones.push(milestone);

    this.logAudit({
      actorUserId: clientId,
      action: "MILESTONE_CREATED",
      entityType: "Milestone",
      entityId: milestone.id,
      metadata: { title: milestone.title, orderIndex: milestone.orderIndex },
    });

    return milestone;
  }

  startMilestone(milestoneId: string, providerId: string): boolean {
    const milestone = this.getMilestoneById(milestoneId);
    if (!milestone) return false;

    const assignment = this.assignments.find(
      (a) => a.projectId === milestone.projectId && a.providerId === providerId && a.status === "ACTIVE"
    );
    if (!assignment) return false;

    if (milestone.status !== "NOT_STARTED") return false;

    milestone.status = "IN_PROGRESS";

    this.logAudit({
      actorUserId: providerId,
      action: "MILESTONE_STARTED",
      entityType: "Milestone",
      entityId: milestoneId,
    });

    return true;
  }

  // --- PROVIDER EVIDENCE ---
  getProviderEvidence(milestoneId: string): ProviderEvidenceItem[] {
    return this.providerEvidence.filter((e) => e.milestoneId === milestoneId);
  }

  addProviderEvidence(data: Omit<ProviderEvidenceItem, "id" | "uploadedAt">, providerId: string): ProviderEvidenceItem | null {
    const milestone = this.getMilestoneById(data.milestoneId);
    if (!milestone) return null;

    const assignment = this.assignments.find(
      (a) => a.projectId === milestone.projectId && a.providerId === providerId && a.status === "ACTIVE"
    );
    if (!assignment) return null;

    // Immutability rule: Evidence can only be uploaded while IN_PROGRESS or returned
    if (milestone.status !== "IN_PROGRESS" && milestone.status !== "NEEDS_ATTENTION" && milestone.status !== "REJECTED") {
      return null;
    }

    const evidenceItem: ProviderEvidenceItem = {
      ...data,
      id: `pe-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };

    this.providerEvidence.unshift(evidenceItem);

    this.logAudit({
      actorUserId: providerId,
      action: "PROVIDER_EVIDENCE_UPLOADED",
      entityType: "ProviderEvidenceItem",
      entityId: evidenceItem.id,
    });

    return evidenceItem;
  }

  submitMilestoneForInspection(milestoneId: string, providerId: string): boolean {
    const milestone = this.getMilestoneById(milestoneId);
    if (!milestone) return false;

    const assignment = this.assignments.find(
      (a) => a.projectId === milestone.projectId && a.providerId === providerId && a.status === "ACTIVE"
    );
    if (!assignment) return false;

    const evidenceList = this.getProviderEvidence(milestoneId);
    if (evidenceList.length === 0) return false;

    milestone.status = "INSPECTION_REQUIRED";

    this.logAudit({
      actorUserId: providerId,
      action: "MILESTONE_SUBMITTED_FOR_INSPECTION",
      entityType: "Milestone",
      entityId: milestoneId,
      metadata: { evidenceCount: evidenceList.length },
    });

    const project = this.getProjectById(milestone.projectId);
    if (project) {
      this.addNotification({
        userId: project.clientId,
        title: "Milestone Work Submitted",
        message: `The assigned Builder has completed '${milestone.title}' and submitted evidence for inspection.`,
        type: "MILESTONE_SUBMITTED",
        channel: "IN_APP",
      });
    }

    return true;
  }

  // --- INSPECTION ASSIGNMENTS & WORKBENCH ---
  getInspectionAssignmentsForInspector(inspectorId: string): InspectionAssignment[] {
    return this.inspectionAssignments.filter(
      (ia) => ia.inspectorId === inspectorId && ia.status !== "CANCELLED"
    );
  }

  getUnassignedMilestonesForInspection(): { milestone: Milestone; project: Project }[] {
    return this.milestones
      .filter((m) => m.status === "INSPECTION_REQUIRED")
      .map((m) => ({ milestone: m, project: this.getProjectById(m.projectId)! }))
      .filter((item) => item.project);
  }

  assignInspectorToMilestone(milestoneId: string, inspectorId: string, inspectorName: string, scheduledDate: string, adminId: string): InspectionAssignment | null {
    const milestone = this.getMilestoneById(milestoneId);
    if (!milestone || milestone.status !== "INSPECTION_REQUIRED") return null;

    // Enforce ONE active assignment per milestone
    const existingActive = this.inspectionAssignments.find(
      (ia) => ia.milestoneId === milestoneId && ["ASSIGNED", "ACCEPTED", "VISIT_REQUIRED"].includes(ia.status)
    );
    if (existingActive) {
      existingActive.status = "CANCELLED";
    }

    const assignment: InspectionAssignment = {
      id: `ia-${Date.now()}`,
      milestoneId,
      inspectorId,
      inspectorName,
      assignedByAdminId: adminId,
      assignedAt: new Date().toISOString(),
      scheduledDate,
      status: "ASSIGNED",
    };

    this.inspectionAssignments.unshift(assignment);

    this.logAudit({
      actorUserId: adminId,
      action: "INSPECTOR_ASSIGNED",
      entityType: "InspectionAssignment",
      entityId: assignment.id,
      metadata: { inspectorId, milestoneId },
    });

    this.addNotification({
      userId: inspectorId,
      title: "New Site Inspection Assigned",
      message: `You have been assigned to inspect milestone '${milestone.title}' in Chinhoyi on ${scheduledDate}.`,
      type: "INSPECTION_ASSIGNED",
      channel: "IN_APP",
    });

    return assignment;
  }

  acceptInspectionAssignment(assignmentId: string, inspectorId: string): boolean {
    const ia = this.inspectionAssignments.find((a) => a.id === assignmentId && a.inspectorId === inspectorId);
    if (!ia) return false;

    ia.status = "ACCEPTED";

    this.logAudit({
      actorUserId: inspectorId,
      action: "INSPECTION_ACCEPTED",
      entityType: "InspectionAssignment",
      entityId: assignmentId,
    });

    return true;
  }

  // --- INSPECTION REPORTS & EVIDENCE ---
  getInspectionReportForMilestone(milestoneId: string): InspectionReport | undefined {
    return this.inspectionReports.find((r) => r.milestoneId === milestoneId);
  }

  getInspectorEvidence(reportId: string, requesterUserId: string, requesterRole: string): InspectorEvidenceItem[] {
    const report = this.inspectionReports.find((r) => r.id === reportId);
    if (!report) return [];

    const milestone = this.getMilestoneById(report.milestoneId);
    const project = milestone ? this.getProjectById(milestone.projectId) : null;

    // READ RLS: Restricted ONLY to Client, Assigned Inspector, and Admin. PROVIDERS CANNOT READ!
    if (
      report.inspectorId === requesterUserId ||
      (project && project.clientId === requesterUserId) ||
      requesterRole === "ADMIN"
    ) {
      return this.inspectorEvidence.filter((e) => e.reportId === reportId);
    }

    return []; // Strictly empty for providers & public
  }

  addInspectorEvidence(data: Omit<InspectorEvidenceItem, "id" | "uploadedAt">, inspectorId: string): InspectorEvidenceItem | null {
    const report = this.inspectionReports.find((r) => r.id === data.reportId);
    if (!report || report.inspectorId !== inspectorId) return null;

    const item: InspectorEvidenceItem = {
      ...data,
      id: `ie-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };

    this.inspectorEvidence.unshift(item);

    this.logAudit({
      actorUserId: inspectorId,
      action: "INSPECTOR_EVIDENCE_UPLOADED",
      entityType: "InspectorEvidenceItem",
      entityId: item.id,
    });

    return item;
  }

  submitInspectionReport(
    milestoneId: string,
    assignmentId: string,
    result: "VERIFIED" | "NEEDS_ATTENTION" | "REJECTED",
    summaryNotes: string,
    providerFeedback: string,
    inspectorId: string,
    inspectorName: string
  ): InspectionReport | null {
    const milestone = this.getMilestoneById(milestoneId);
    const assignment = this.inspectionAssignments.find((a) => a.id === assignmentId && a.inspectorId === inspectorId);

    if (!milestone || !assignment) return null;

    const report: InspectionReport = {
      id: `ir-${Date.now()}`,
      milestoneId,
      inspectorId,
      inspectorName,
      assignmentId,
      result,
      summaryNotes,
      providerFeedback,
      createdAt: new Date().toISOString(),
    };

    this.inspectionReports.unshift(report);

    // Update assignment status
    assignment.status = "COMPLETED";
    assignment.completedAt = new Date().toISOString();

    // Update milestone status according to inspection result
    if (result === "VERIFIED") {
      milestone.status = "INSPECTOR_VERIFIED";
    } else if (result === "NEEDS_ATTENTION") {
      milestone.status = "NEEDS_ATTENTION";
    } else {
      milestone.status = "REJECTED";
    }

    this.logAudit({
      actorUserId: inspectorId,
      action: "INSPECTION_REPORT_SUBMITTED",
      entityType: "InspectionReport",
      entityId: report.id,
      metadata: { result, milestoneId },
    });

    const project = this.getProjectById(milestone.projectId);
    if (project) {
      this.addNotification({
        userId: project.clientId,
        title: `Site Inspection Result: ${result}`,
        message: `Inspector ${inspectorName} has recorded status '${result}' for milestone '${milestone.title}'. Review report and evidence.`,
        type: `INSPECTION_${result}`,
        channel: "IN_APP",
      });
    }

    return report;
  }

  // --- CLIENT APPROVAL / RETURN WORKFLOW ---
  approveMilestoneByClient(milestoneId: string, clientId: string): boolean {
    const milestone = this.getMilestoneById(milestoneId);
    if (!milestone) return false;

    const project = this.getProjectById(milestone.projectId);
    if (!project || project.clientId !== clientId) return false;

    if (milestone.status !== "INSPECTOR_VERIFIED") return false;

    milestone.status = "CLIENT_APPROVED";
    milestone.clientDecision = "APPROVED";

    // Transition payment record to PENDING_APPROVAL
    let pr = this.getPaymentRecordForMilestone(milestoneId);
    if (pr && pr.status === "NOT_DUE") {
      pr.status = "PENDING_APPROVAL";
      pr.updatedAt = new Date().toISOString();
    }

    this.logAudit({
      actorUserId: clientId,
      action: "MILESTONE_CLIENT_APPROVED",
      entityType: "Milestone",
      entityId: milestoneId,
    });

    const assignment = this.assignments.find((a) => a.projectId === milestone.projectId && a.status === "ACTIVE");
    if (assignment) {
      this.addNotification({
        userId: assignment.providerId,
        title: "Milestone Approved by Client!",
        message: `Client ${project.clientName} has approved milestone '${milestone.title}'.`,
        type: "MILESTONE_CLIENT_APPROVED",
        channel: "IN_APP",
      });
    }

    return true;
  }

  returnMilestoneByClient(milestoneId: string, reason: string, clientId: string): boolean {
    const milestone = this.getMilestoneById(milestoneId);
    if (!milestone) return false;

    const project = this.getProjectById(milestone.projectId);
    if (!project || project.clientId !== clientId) return false;

    milestone.status = "NEEDS_ATTENTION";
    milestone.clientDecision = "RETURNED";
    milestone.clientReturnReason = reason;

    this.logAudit({
      actorUserId: clientId,
      action: "CLIENT_RETURNED_MILESTONE",
      entityType: "Milestone",
      entityId: milestoneId,
      metadata: { reason },
    });

    return true;
  }

  resubmitMilestoneProvider(milestoneId: string, providerId: string): boolean {
    const milestone = this.getMilestoneById(milestoneId);
    if (!milestone) return false;

    if (milestone.status !== "NEEDS_ATTENTION" && milestone.status !== "REJECTED") return false;

    milestone.status = "IN_PROGRESS";

    this.logAudit({
      actorUserId: providerId,
      action: "MILESTONE_RESUBMITTED",
      entityType: "Milestone",
      entityId: milestoneId,
    });

    return true;
  }

  // --- QUOTATIONS & ARITHMETIC ---
  getQuotationsForProject(projectId: string, requesterUserId: string, requesterRole: string): Quotation[] {
    const project = this.getProjectById(projectId);
    if (!project) return [];

    if (project.clientId === requesterUserId || requesterRole === "ADMIN") {
      return this.quotations.filter((q) => q.projectId === projectId && q.status !== "DRAFT");
    }

    if (requesterRole === "PROVIDER") {
      return this.quotations.filter(
        (q) => q.projectId === projectId && q.providerId === requesterUserId
      );
    }

    return [];
  }

  getQuotationById(quotationId: string): Quotation | undefined {
    return this.quotations.find((q) => q.id === quotationId);
  }

  saveQuotation(data: Omit<Quotation, "id" | "createdAt">): Quotation {
    const validatedItems = data.items.map((item) => {
      const qty = Math.max(0, item.quantity || 0);
      const price = Math.max(0, item.unitPrice || 0);
      return {
        ...item,
        quantity: qty,
        unitPrice: price,
        lineTotal: qty * price,
      };
    });

    const laborSubtotal = validatedItems
      .filter((i) => i.itemType === "LABOUR")
      .reduce((sum, item) => sum + item.lineTotal, 0);

    const materialSubtotal = validatedItems
      .filter((i) => i.itemType === "MATERIAL")
      .reduce((sum, item) => sum + item.lineTotal, 0);

    const totalAmount = laborSubtotal + materialSubtotal;

    const existingIndex = this.quotations.findIndex(
      (q) => q.projectId === data.projectId && q.providerId === data.providerId && q.status === "DRAFT"
    );

    const quotation: Quotation = {
      ...data,
      id: existingIndex >= 0 ? this.quotations[existingIndex].id : `quote-${Date.now()}`,
      items: validatedItems,
      laborSubtotal,
      materialSubtotal,
      totalAmount,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.quotations[existingIndex] = quotation;
    } else {
      this.quotations.unshift(quotation);
    }

    this.logAudit({
      actorUserId: data.providerId,
      action: data.status === "DRAFT" ? "QUOTATION_DRAFT_CREATED" : "QUOTATION_SUBMITTED",
      entityType: "Quotation",
      entityId: quotation.id,
      metadata: { totalAmount },
    });

    return quotation;
  }

  withdrawQuotation(quotationId: string, providerId: string): boolean {
    const q = this.quotations.find((item) => item.id === quotationId && item.providerId === providerId);
    if (!q || q.status === "ACCEPTED") return false;

    q.status = "WITHDRAWN";

    this.logAudit({
      actorUserId: providerId,
      action: "QUOTATION_WITHDRAWN",
      entityType: "Quotation",
      entityId: quotationId,
    });

    return true;
  }

  selectProviderForProject(projectId: string, quotationId: string, clientId: string): ProjectProviderAssignment | null {
    const project = this.getProjectById(projectId);
    const quotation = this.getQuotationById(quotationId);

    if (!project || !quotation || project.clientId !== clientId) return null;
    if (quotation.status !== "SUBMITTED") return null;

    quotation.status = "ACCEPTED";
    this.quotations.forEach((q) => {
      if (q.projectId === projectId && q.id !== quotationId && q.status === "SUBMITTED") {
        q.status = "REJECTED";
      }
    });

    project.status = "PROVIDER_SELECTED";

    const assignment: ProjectProviderAssignment = {
      id: `assign-${Date.now()}`,
      projectId,
      providerId: quotation.providerId,
      acceptedQuotationId: quotationId,
      assignedAt: new Date().toISOString(),
      status: "ACTIVE",
    };
    this.assignments.unshift(assignment);

    this.logAudit({
      actorUserId: clientId,
      action: "QUOTATION_ACCEPTED",
      entityType: "Quotation",
      entityId: quotationId,
    });

    this.logAudit({
      actorUserId: clientId,
      action: "PROVIDER_ASSIGNED",
      entityType: "ProjectProviderAssignment",
      entityId: assignment.id,
      metadata: { providerId: quotation.providerId },
    });

    return assignment;
  }

  // --- FINANCIAL STATUS & PAYMENTS ---
  getPaymentRecordForMilestone(milestoneId: string): PaymentRecord | undefined {
    return this.paymentRecords.find((pr) => pr.milestoneId === milestoneId);
  }

  getPaymentRecordsForProject(projectId: string, requesterUserId: string, requesterRole: string): PaymentRecord[] {
    const project = this.getProjectById(projectId);
    if (!project) return [];

    if (project.clientId === requesterUserId || requesterRole === "ADMIN") {
      return this.paymentRecords.filter((pr) => pr.projectId === projectId);
    }

    const assignment = this.assignments.find(
      (a) => a.projectId === projectId && a.providerId === requesterUserId && a.status === "ACTIVE"
    );
    if (assignment) {
      return this.paymentRecords.filter((pr) => pr.projectId === projectId);
    }

    return []; // Inspector or public: NO payment access
  }

  getFinancialSummaryForProject(projectId: string) {
    const project = this.getProjectById(projectId);
    const milestones = this.getMilestonesForProject(projectId);
    const acceptedQuotation = this.quotations.find((q) => q.projectId === projectId && q.status === "ACCEPTED");
    const records = this.paymentRecords.filter((pr) => pr.projectId === projectId);

    const quoteTotal = acceptedQuotation ? acceptedQuotation.totalAmount : 0;
    const milestoneTotal = milestones.reduce((sum, m) => sum + m.amount, 0);

    const approvedAmount = records
      .filter((pr) => pr.status === "APPROVED" || pr.status === "PAID")
      .reduce((sum, pr) => sum + pr.amount, 0);

    const paidAmount = records
      .filter((pr) => pr.status === "PAID")
      .reduce((sum, pr) => sum + pr.amount, 0);

    const remainingAmount = Math.max(0, milestoneTotal - paidAmount);
    const discrepancyAmount = quoteTotal > 0 ? milestoneTotal - quoteTotal : 0;
    const isAllocatedMatched = discrepancyAmount === 0;

    return {
      quoteTotal,
      milestoneTotal,
      approvedAmount,
      paidAmount,
      remainingAmount,
      discrepancyAmount,
      isAllocatedMatched,
    };
  }

  approveMilestonePayment(milestoneId: string, clientId: string): boolean {
    const milestone = this.getMilestoneById(milestoneId);
    if (!milestone) return false;

    const project = this.getProjectById(milestone.projectId);
    if (!project || project.clientId !== clientId) return false;

    if (milestone.status !== "CLIENT_APPROVED") return false;

    let pr = this.getPaymentRecordForMilestone(milestoneId);
    if (!pr) {
      const assignment = this.assignments.find((a) => a.projectId === milestone.projectId && a.status === "ACTIVE");
      pr = {
        id: `pr-${Date.now()}`,
        projectId: milestone.projectId,
        milestoneId: milestone.id,
        clientId: project.clientId,
        providerId: assignment?.providerId || "",
        amount: milestone.amount,
        currency: "USD",
        status: "NOT_DUE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.paymentRecords.push(pr);
    }

    pr.status = "APPROVED";
    pr.approvedAt = new Date().toISOString();
    pr.updatedAt = new Date().toISOString();

    this.logAudit({
      actorUserId: clientId,
      action: "PAYMENT_APPROVED",
      entityType: "PaymentRecord",
      entityId: pr.id,
      metadata: { milestoneId, amount: pr.amount },
    });

    if (pr.providerId) {
      this.addNotification({
        userId: pr.providerId,
        title: "Milestone Payment Approved by Client",
        message: `Client ${project.clientName} approved payment of $${pr.amount.toLocaleString()} for '${milestone.title}'.`,
        type: "PAYMENT_APPROVED",
        channel: "IN_APP",
      });
    }

    return true;
  }

  markPaymentAsPaid(
    milestoneId: string,
    methodLabel: string,
    externalRef: string,
    note: string,
    clientId: string
  ): boolean {
    const milestone = this.getMilestoneById(milestoneId);
    if (!milestone) return false;

    const project = this.getProjectById(milestone.projectId);
    if (!project || project.clientId !== clientId) return false;

    const pr = this.getPaymentRecordForMilestone(milestoneId);
    if (!pr || (pr.status !== "APPROVED" && pr.status !== "PENDING_APPROVAL")) return false;

    pr.status = "PAID";
    pr.paidAt = new Date().toISOString();
    pr.paymentMethodLabel = methodLabel;
    pr.externalReference = externalRef || undefined;
    pr.clientNote = note || undefined;
    pr.updatedAt = new Date().toISOString();

    this.logAudit({
      actorUserId: clientId,
      action: "PAYMENT_MARKED_PAID",
      entityType: "PaymentRecord",
      entityId: pr.id,
      metadata: { milestoneId, methodLabel, externalRef },
    });

    if (pr.providerId) {
      this.addNotification({
        userId: pr.providerId,
        title: "Client Marked Payment as Paid",
        message: `Client marked payment of $${pr.amount.toLocaleString()} for '${milestone.title}' as paid via ${methodLabel}. Confirm receipt on KuvakaHub.`,
        type: "PAYMENT_MARKED_PAID",
        channel: "IN_APP",
      });
    }

    return true;
  }

  confirmPaymentReceipt(milestoneId: string, providerId: string): boolean {
    const pr = this.getPaymentRecordForMilestone(milestoneId);
    if (!pr || pr.providerId !== providerId || pr.status !== "PAID") return false;

    pr.providerAcknowledgedAt = new Date().toISOString();
    pr.updatedAt = new Date().toISOString();

    this.logAudit({
      actorUserId: providerId,
      action: "PAYMENT_RECEIVED_CONFIRMED",
      entityType: "PaymentRecord",
      entityId: pr.id,
      metadata: { milestoneId },
    });

    this.addNotification({
      userId: pr.clientId,
      title: "Provider Confirmed Payment Receipt!",
      message: `The builder has confirmed receipt of $${pr.amount.toLocaleString()} payment for milestone.`,
      type: "PAYMENT_RECEIVED_CONFIRMED",
      channel: "IN_APP",
    });

    return true;
  }

  raisePaymentDispute(milestoneId: string, reason: string, description: string, userId: string): boolean {
    const pr = this.getPaymentRecordForMilestone(milestoneId);
    if (!pr) return false;

    if (pr.clientId !== userId && pr.providerId !== userId) return false;

    pr.status = "DISPUTED";
    pr.updatedAt = new Date().toISOString();

    const dispute: PaymentDispute = {
      id: `disp-${Date.now()}`,
      paymentRecordId: pr.id,
      milestoneId,
      projectId: pr.projectId,
      raisedByUserId: userId,
      reason,
      description,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };

    this.paymentDisputes.unshift(dispute);

    this.logAudit({
      actorUserId: userId,
      action: "PAYMENT_DISPUTED",
      entityType: "PaymentDispute",
      entityId: dispute.id,
      metadata: { milestoneId, reason },
    });

    const targetUserId = userId === pr.clientId ? pr.providerId : pr.clientId;
    if (targetUserId) {
      this.addNotification({
        userId: targetUserId,
        title: "Payment Issue Reported",
        message: `A payment dispute has been opened for milestone payment of $${pr.amount.toLocaleString()}. Admin review pending.`,
        type: "PAYMENT_DISPUTED",
        channel: "IN_APP",
      });
    }

    return true;
  }

  getDisputesForAdmin(): { dispute: PaymentDispute; record: PaymentRecord; project: Project }[] {
    return this.paymentDisputes
      .map((d) => {
        const record = this.paymentRecords.find((r) => r.id === d.paymentRecordId)!;
        const project = this.getProjectById(d.projectId)!;
        return { dispute: d, record, project };
      })
      .filter((item) => item.record && item.project);
  }

  resolvePaymentDispute(
    disputeId: string,
    status: "RESOLVED" | "CLOSED",
    resolutionNotes: string,
    adminId: string
  ): boolean {
    const dispute = this.paymentDisputes.find((d) => d.id === disputeId);
    if (!dispute) return false;

    dispute.status = status;
    dispute.resolvedAt = new Date().toISOString();
    dispute.resolvedByAdminId = adminId;
    dispute.resolutionNotes = resolutionNotes;

    this.logAudit({
      actorUserId: adminId,
      action: "PAYMENT_DISPUTE_RESOLVED",
      entityType: "PaymentDispute",
      entityId: disputeId,
      metadata: { status, resolutionNotes },
    });

    return true;
  }

  // --- PROJECT COMPLETION WORKFLOW ---
  canCompleteProject(projectId: string): boolean {
    const project = this.getProjectById(projectId);
    if (!project || (project.status !== "ACTIVE" && project.status !== "PROVIDER_SELECTED")) return false;

    const milestones = this.getMilestonesForProject(projectId);
    if (milestones.length === 0) return false;

    return milestones.every((m) => m.status === "CLIENT_APPROVED");
  }

  completeProject(projectId: string, clientId: string): boolean {
    const project = this.getProjectById(projectId);
    if (!project || project.clientId !== clientId) return false;

    if (!this.canCompleteProject(projectId)) return false;

    project.status = "COMPLETED";

    const assignment = this.assignments.find((a) => a.projectId === projectId && a.status === "ACTIVE");
    if (assignment) {
      assignment.status = "COMPLETED";
    }

    this.logAudit({
      actorUserId: clientId,
      action: "PROJECT_COMPLETED",
      entityType: "Project",
      entityId: projectId,
    });

    if (assignment) {
      this.addNotification({
        userId: assignment.providerId,
        title: "Project Formally Completed!",
        message: `Client ${project.clientName} has marked project '${project.title}' as fully COMPLETED.`,
        type: "PROJECT_COMPLETED",
        channel: "IN_APP",
      });
    }

    return true;
  }

  // --- VERIFIED PROVIDER REVIEWS ---
  canSubmitReview(projectId: string, clientId: string): boolean {
    const project = this.getProjectById(projectId);
    if (!project || project.clientId !== clientId || project.status !== "COMPLETED") return false;

    const existing = this.providerReviews.find((r) => r.projectId === projectId && r.reviewerClientId === clientId);
    return !existing;
  }

  submitProviderReview(data: Omit<ProviderReview, "id" | "createdAt" | "updatedAt">): ProviderReview | null {
    if (!this.canSubmitReview(data.projectId, data.reviewerClientId)) return null;

    const review: ProviderReview = {
      ...data,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.providerReviews.unshift(review);

    this.logAudit({
      actorUserId: data.reviewerClientId,
      action: "VERIFIED_REVIEW_SUBMITTED",
      entityType: "ProviderReview",
      entityId: review.id,
      metadata: { rating: review.overallRating, providerId: review.providerId },
    });

    this.addNotification({
      userId: data.providerId,
      title: "New Verified Project Review Received!",
      message: `Client ${data.reviewerName} left a ${data.overallRating}-star review for project completion.`,
      type: "REVIEW_SUBMITTED",
      channel: "IN_APP",
    });

    return review;
  }

  getReviewsForProvider(providerId: string): ProviderReview[] {
    return this.providerReviews.filter((r) => r.providerId === providerId);
  }

  getProviderRatingMetrics(providerId: string) {
    const reviews = this.getReviewsForProvider(providerId);
    if (reviews.length === 0) {
      return { averageRating: 0, totalVerifiedReviews: 0 };
    }

    const sum = reviews.reduce((acc, r) => acc + r.overallRating, 0);
    const avg = Math.round((sum / reviews.length) * 10) / 10;
    return { averageRating: avg, totalVerifiedReviews: reviews.length };
  }

  // --- NOTIFICATIONS & AUDIT LOGS ---
  getNotifications(userId: string): NotificationItem[] {
    return this.notifications.filter((n) => n.userId === userId);
  }

  private addNotification(data: Omit<NotificationItem, "id" | "isRead" | "createdAt">) {
    this.notifications.unshift({
      ...data,
      id: `notif-${Date.now()}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  getAuditLogs(): AuditLogItem[] {
    return this.auditLogs;
  }

  private logAudit(data: Omit<AuditLogItem, "id" | "createdAt">) {
    this.auditLogs.unshift({
      ...data,
      id: `audit-${Date.now()}`,
      createdAt: new Date().toISOString(),
    });
  }
}

export const marketplaceStore = new MarketplaceStore();
