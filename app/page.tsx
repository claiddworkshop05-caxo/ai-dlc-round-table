import { desc } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { equipment } from "@/src/schema";

export const dynamic = "force-dynamic";

async function getEquipmentList() {
  const { db } = await import("@/src/db");
  return db.select().from(equipment).orderBy(desc(equipment.createdAt));
}

export default async function Page() {
  const list = await getEquipmentList();

  return (
    <div className="px-4 py-6 max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">備品一覧</h1>
        <span className="text-sm text-muted-foreground">{list.length} 件</span>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground text-sm">
            <p>備品が登録されていません。</p>
            <Link
              href="/equipment/new"
              className="mt-3 inline-block text-primary font-medium hover:underline"
            >
              最初の備品を追加する
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {list.map((item) => (
            <li key={item.id}>
              <Link href={`/equipment/${item.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-4 px-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      {item.category && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.category}
                        </p>
                      )}
                    </div>
                    <span
                      className={`ml-3 shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.status === "available"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status === "available" ? "利用可能" : "貸出中"}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
