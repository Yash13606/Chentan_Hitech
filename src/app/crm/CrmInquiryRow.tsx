"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronDown, Phone, FileText } from "lucide-react";
import {
  updateInquiryStatusAction,
  assignInquiryAction,
} from "@/server/actions/crm";

type CartItem = { title: string; qty: number };

type Inquiry = {
  id: string;
  inquiryNumber: string;
  status: string;
  leadScore: string;
  priority: string;
  createdAt: Date;
  deliveryLocation: string | null;
  projectNotes: string | null;
  customer: { name: string | null; email: string | null };
  company: { name: string; industry: string | null };
  assignedTo: { id: string; name: string | null } | null;
  cartSnapshot: CartItem[];
  _count: { quotations: number; callLogs: number };
};

type SalesUser = { id: string; name: string | null; role: string };

type Props = {
  inquiry: Inquiry;
  salesUsers: SalesUser[];
};

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-yellow-100 text-yellow-700",
  IN_REVIEW: "bg-orange-100 text-orange-700",
  QUOTED: "bg-green-100 text-green-700",
  CLOSED_WON: "bg-green-200 text-green-800",
  CLOSED_LOST: "bg-gray-100 text-gray-500",
};

const scoreColors: Record<string, string> = {
  HIGH: "text-red-600 font-medium",
  MEDIUM: "text-yellow-600",
  LOW: "text-muted-foreground",
};

const statusOptions = [
  "NEW",
  "ASSIGNED",
  "IN_REVIEW",
  "QUOTED",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const;

export function CrmInquiryRow({ inquiry, salesUsers }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(status: string) {
    startTransition(async () => {
      await updateInquiryStatusAction(
        inquiry.id,
        status as (typeof statusOptions)[number]
      );
    });
  }

  function handleAssign(userId: string) {
    startTransition(async () => {
      await assignInquiryAction(inquiry.id, userId || null);
    });
  }

  const totalItems = inquiry.cartSnapshot.reduce((s, i) => s + i.qty, 0);

  return (
    <div className={`border border-border rounded-md bg-card ${isPending ? "opacity-60" : ""} transition-opacity`}>
      {/* Main row */}
      <div
        className="px-4 py-3 flex items-center gap-4 cursor-pointer hover:bg-muted/10 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Score indicator */}
        <div className="w-1.5 h-10 rounded-full flex-shrink-0" style={{
          backgroundColor:
            inquiry.leadScore === "HIGH" ? "#dc2626" :
            inquiry.leadScore === "MEDIUM" ? "#d97706" : "#d1d5db"
        }} />

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{inquiry.inquiryNumber}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${statusColors[inquiry.status] ?? "bg-muted"}`}>
              {inquiry.status.replace(/_/g, " ")}
            </span>
            {inquiry.priority === "URGENT" && (
              <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                URGENT
              </span>
            )}
          </div>
          <p className="font-medium text-foreground text-sm mt-0.5">{inquiry.company.name}</p>
          <p className="text-xs text-muted-foreground">
            {inquiry.customer.name} · {inquiry.company.industry?.replace(/_/g, " ")}
          </p>
        </div>

        {/* Meta */}
        <div className="hidden sm:flex flex-col items-end gap-1 min-w-0">
          <span className={`text-xs ${scoreColors[inquiry.leadScore] ?? ""}`}>
            {inquiry.leadScore}
          </span>
          <span className="text-xs text-muted-foreground">{totalItems} units</span>
          <span className="text-xs text-muted-foreground">
            {new Date(inquiry.createdAt).toLocaleDateString("en-IN")}
          </span>
        </div>

        {/* Quick actions (always visible) */}
        <div className="flex items-center gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
          <select
            value={inquiry.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isPending}
            className="text-xs border border-border rounded px-1.5 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
          <Link
            href={`/admin/inquiries/${inquiry.id}`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded px-2 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="w-3.5 h-3.5" />
          </Link>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-border px-4 py-4 bg-muted/10 space-y-4">
          {/* Cart items */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">RFQ Items</p>
            <div className="flex flex-wrap gap-2">
              {inquiry.cartSnapshot.map((item, i) => (
                <span key={i} className="text-xs bg-background border border-border rounded px-2 py-1">
                  {item.title} × {item.qty}
                </span>
              ))}
            </div>
          </div>

          {/* Project notes */}
          {inquiry.projectNotes && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Project Notes</p>
              <p className="text-xs text-foreground leading-relaxed">{inquiry.projectNotes}</p>
            </div>
          )}

          {/* Assign */}
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-muted-foreground">Assign to:</p>
            <select
              defaultValue={inquiry.assignedTo?.id ?? ""}
              onChange={(e) => handleAssign(e.target.value)}
              disabled={isPending}
              className="text-xs border border-border rounded px-2 py-1 bg-background focus:outline-none"
            >
              <option value="">Unassigned</option>
              {salesUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ?? u.id} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>{inquiry._count.quotations} quotation{inquiry._count.quotations !== 1 ? "s" : ""}</span>
            <span>{inquiry._count.callLogs} call log{inquiry._count.callLogs !== 1 ? "s" : ""}</span>
            {inquiry.deliveryLocation && <span>Deliver to: {inquiry.deliveryLocation}</span>}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href={`/admin/inquiries/${inquiry.id}`}
              className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity"
            >
              <FileText className="w-3 h-3" />
              Open / Build Quotation
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
