import { notFound, redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { equipment, loans } from "@/src/schema";
import { borrowEquipment, returnEquipment } from "@/app/actions";

export const dynamic = "force-dynamic";

async function getEquipment(id: number) {
  const { db } = await import("@/src/db");
  const [item] = await db
    .select()
    .from(equipment)
    .where(eq(equipment.id, id));
  return item ?? null;
}

async function getCurrentBorrower(equipmentId: number) {
  const { db } = await import("@/src/db");
  const [latest] = await db
    .select()
    .from(loans)
    .where(eq(loans.equipmentId, equipmentId))
    .orderBy(desc(loans.recordedAt))
    .limit(1);
  if (latest?.action === "borrow") return latest.borrowerName;
  return null;
}

export default async function LoanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const equipmentId = Number(id);
  if (isNaN(equipmentId)) notFound();

  const [item, currentBorrower] = await Promise.all([
    getEquipment(equipmentId),
    getCurrentBorrower(equipmentId),
  ]);

  if (!item) notFound();

  async function handleBorrow(formData: FormData) {
    "use server";
    const name = formData.get("borrowerName");
    if (typeof name !== "string" || name.trim() === "") return;
    await borrowEquipment(equipmentId, name.trim());
    redirect(`/equipment/${equipmentId}/loan`);
  }

  async function handleReturn(formData: FormData) {
    "use server";
    const name = formData.get("borrowerName");
    if (typeof name !== "string" || name.trim() === "") return;
    await returnEquipment(equipmentId, name.trim());
    redirect(`/equipment/${equipmentId}/loan`);
  }

  const isAvailable = item.status === "available";

  return (
    <div className="px-4 py-6 max-w-xl mx-auto space-y-5">
      {/* 備品情報 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{item.name}</h1>
          {item.category && (
            <p className="text-sm text-muted-foreground">{item.category}</p>
          )}
        </div>
        <span
          className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            isAvailable
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isAvailable ? "利用可能" : "貸出中"}
        </span>
      </div>

      {isAvailable ? (
        /* 貸出フォーム */
        <Card>
          <CardHeader>
            <CardTitle className="text-base">貸出する</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleBorrow} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="borrowerName">
                  お名前 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="borrowerName"
                  name="borrowerName"
                  placeholder="例: 山田 太郎"
                  required
                  autoComplete="name"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                貸出を記録する
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* 返却フォーム */
        <Card>
          <CardHeader>
            <CardTitle className="text-base">返却する</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentBorrower && (
              <div className="rounded-lg bg-muted px-4 py-3 text-sm">
                <span className="text-muted-foreground">現在の借用者: </span>
                <span className="font-medium">{currentBorrower}</span>
              </div>
            )}
            <form action={handleReturn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="borrowerName">
                  お名前 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="borrowerName"
                  name="borrowerName"
                  defaultValue={currentBorrower ?? ""}
                  placeholder="例: 山田 太郎"
                  required
                  autoComplete="name"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                返却を記録する
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Separator />

      <p className="text-center text-sm text-muted-foreground">
        <a href={`/equipment/${item.id}`} className="hover:underline">
          ← 備品詳細に戻る
        </a>
      </p>
    </div>
  );
}
