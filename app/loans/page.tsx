import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { loans, equipment } from "@/src/schema";

export const dynamic = "force-dynamic";

async function getAllLoans() {
  const { db } = await import("@/src/db");
  return db
    .select({
      id: loans.id,
      action: loans.action,
      borrowerName: loans.borrowerName,
      recordedAt: loans.recordedAt,
      notes: loans.notes,
      equipmentId: loans.equipmentId,
      equipmentName: equipment.name,
    })
    .from(loans)
    .innerJoin(equipment, eq(loans.equipmentId, equipment.id))
    .orderBy(desc(loans.recordedAt))
    .limit(100);
}

export default async function LoansPage() {
  const history = await getAllLoans();

  return (
    <div className="px-4 py-6 max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">貸出履歴</h1>
        <span className="text-sm text-muted-foreground">{history.length} 件</span>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            まだ貸出・返却の記録がありません。
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {history.map((row) => (
            <li key={row.id}>
              <Card>
                <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className={`shrink-0 inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        row.action === "borrow"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {row.action === "borrow" ? "貸出" : "返却"}
                    </span>
                    <div className="min-w-0">
                      <Link
                        href={`/equipment/${row.equipmentId}`}
                        className="text-sm font-medium hover:underline truncate block"
                      >
                        {row.equipmentName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {row.borrowerName}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {row.recordedAt.toLocaleString("ja-JP", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
