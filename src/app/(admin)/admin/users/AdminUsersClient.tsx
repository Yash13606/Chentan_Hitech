"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, User as UserIcon } from "lucide-react";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  phone: string | null;
  createdAt: Date;
  company: { name: string } | null;
}

interface AdminUsersClientProps {
  users: UserData[];
}

const STAGGER_CHILD: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function AdminUsersClient({ users }: AdminUsersClientProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Brutalist Header */}
      <div className="border-b border-border bg-surface-1 px-6 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-6">
              <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest border border-transparent hover:border-border px-2 py-1">
                <ArrowLeft className="w-3 h-3" /> Back to Command
              </Link>
            </div>
            <h1 className="font-heading font-medium text-4xl md:text-5xl text-foreground tracking-tight">
              User Ledger
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest"
          >
            <span className="text-muted-foreground">TOTAL ENTRIES:</span>
            <span className="text-foreground font-medium border border-border px-3 py-1">{users.length}</span>
          </motion.div>
        </div>
      </div>

      <motion.div 
        className="max-w-7xl mx-auto px-6 py-12"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.05 } },
        }}
      >
        <motion.div variants={STAGGER_CHILD} className="border border-border bg-background overflow-x-auto">
          {users.length === 0 ? (
            <div className="p-12 text-center text-sm font-mono text-muted-foreground uppercase tracking-widest">
              [ NO USERS FOUND ]
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-1">
                  <th className="p-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest font-normal">Account</th>
                  <th className="p-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest font-normal">Contact</th>
                  <th className="p-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest font-normal">Company</th>
                  <th className="p-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest font-normal text-right">Clearance Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-1 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center border border-border bg-background text-muted-foreground group-hover:text-foreground transition-colors">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-heading font-medium text-foreground">{user.name || "UNNAMED ENTITY"}</span>
                          <span className="font-mono text-[10px] text-muted-foreground tracking-widest">ID: {user.id.substring(user.id.length - 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs text-foreground tracking-tight">{user.email}</span>
                        {user.phone && <span className="font-mono text-[10px] text-muted-foreground tracking-widest">{user.phone}</span>}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-foreground tracking-tight">
                      {user.company?.name || <span className="text-muted-foreground opacity-50">--</span>}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`inline-block font-mono text-[10px] uppercase tracking-widest border border-border px-2 py-1 ${
                        user.role === "ADMIN" ? "bg-foreground text-background" :
                        user.role === "SALES" ? "text-primary border-primary/30" :
                        "text-muted-foreground"
                      }`}>
                        [ {user.role} ]
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
