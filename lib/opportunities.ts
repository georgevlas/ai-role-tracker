export const STATUSES = [
  "Lead",
  "Applied",
  "Interviewing",
  "Offer",
  "Closed"
] as const;

export type OpportunityStatus = (typeof STATUSES)[number];

export type Opportunity = {
  id: string;
  roleTitle: string;
  company: string;
  recruiterName: string;
  recruiterEmail: string;
  notes: string;
  status: OpportunityStatus;
  followUpDate: string;
  updatedAt: string;
};

export const initialOpportunities: Opportunity[] = [
  {
    id: "seed-1",
    roleTitle: "CTO",
    company: "Acme Tech",
    recruiterName: "Sarah Lee",
    recruiterEmail: "sarah.lee@example.com",
    notes: "Initial intro done. Waiting for role brief.",
    status: "Lead",
    followUpDate: "",
    updatedAt: new Date().toISOString()
  }
];
