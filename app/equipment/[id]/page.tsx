import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { QrCode } from "@/components/qr-code";
import { equipment, loans } from "@/src/schema";

export const dynamic = "force-dynamic";

async function getEquipment(id: number) {
  const { db } = await import("@/src/db");
  const [item] = await db
    .select()
    .from(equipment)
    .where(eq(equipment.id, id));
  return item ?? null;
}

async function getRecentLoans(equipmentId: number) {
  const { db } = await import("@/src/db");
  return db
    .select()
    .from(loans)
    .where(eq(loans.equipmentId, equipmentId))
    .orderBy(desc(loans.recordedAt))
    .limit(5);
}

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const equipmentId = Number(id);
  if (isNaN(equipmentId)) notFound();

  const [item, recentLoans] = await Promise.all([
    getEquipment(equipmentId),
    getRecentLoans(equipmentId),
  ]);

  if (!item) notFound();

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const loanUrl = `${protocol}://${host}/equipment/${item.id}/loan`;

  return (
    <div className="px-4 py-6 max-w-xl mx-auto space-y-5">
      {/* 備品情報 */}
      <Card>
        <CardContent className="pt-5 pb-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold leading-tight">{item.name}</h1>
              {item.category && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {item.category}
                </p>
              )}
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {item.description}
                </p>
              )}
            </div>
            <span
              className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                item.status === "available"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {item.status === "available" ? "利用可能" : "貸出中"}
            </span>
          </div>

          <Separator />

          <Link href={`/equipment/${item.id}/loan`}>
            <Button className="w-full" variant="default">
              {item.status === "available" ? "貸出する" : "返却する"}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* QRコード */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">QRコード</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <QrCode value={loanUrl} size={220} />
          <p className="text-xs text-muted-foreground text-center break-all">
            {loanUrl}
          </p>
          <p className="text-xs text-muted-foreground text-center">
            このQRコードを備品に貼り付けてください
          </p>
        </CardContent>
      </Card>

      {/* 最近の履歴 */}
      {recentLoans.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">最近の貸出履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recentLoans.map((loan) => (
                <li
                  key={loan.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        loan.action === "borrow"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {loan.action === "borrow" ? "貸出" : "返却"}
                    </span>
                    <span>{loan.borrowerName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {loan.recordedAt.toLocaleString("ja-JP", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
