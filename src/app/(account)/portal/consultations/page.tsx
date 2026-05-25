import { auth } from "@/server/auth";
import { db } from "@/server/db";
import Link from "next/link";
import { ConsultationForm } from "./ConsultationForm";

export default async function ConsultationsPage() {
  const session = await auth();

  const consultations = await db.consultation.findMany({
    where: { customerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      status: true,
      requestedSlot: true,
      confirmedSlot: true,
      meetingUrl: true,
      notes: true,
      createdAt: true,
    },
  });

  const statusColor: Record<string, string> = {
    REQUESTED: "bg-blue-100 text-blue-700",
    SCHEDULED: "bg-green-100 text-green-700",
    COMPLETED: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/portal"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← Dashboard
          </Link>
          <h1 className="font-heading font-medium text-xl text-foreground mt-1">
            Consultations
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Book new consultation */}
        <div className="border border-border rounded-md bg-card p-5">
          <h2 className="font-medium text-sm text-foreground mb-4">
            Request a Consultation
          </h2>
          <ConsultationForm />
        </div>

        {/* Existing consultations */}
        {consultations.length > 0 && (
          <div>
            <h2 className="font-medium text-sm text-foreground mb-3">
              Previous Requests
            </h2>
            <div className="space-y-2">
              {consultations.map((c) => (
                <div
                  key={c.id}
                  className="border border-border rounded-md bg-card px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {c.type.replace(/_/g, " ")}
                    </p>
                    {c.requestedSlot && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Requested:{" "}
                        {new Date(c.requestedSlot).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                    {c.confirmedSlot && (
                      <p className="text-xs text-green-700 mt-0.5">
                        Confirmed:{" "}
                        {new Date(c.confirmedSlot).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                    {c.meetingUrl && (
                      <a
                        href={c.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary underline underline-offset-2 mt-0.5 block"
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${statusColor[c.status] ?? "bg-muted"}`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
