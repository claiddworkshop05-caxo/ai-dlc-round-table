import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createEquipment } from "@/app/actions";

export default function NewEquipmentPage() {
  async function handleCreate(formData: FormData) {
    "use server";
    const id = await createEquipment(formData);
    if (id) redirect(`/equipment/${id}`);
  }

  return (
    <div className="px-4 py-6 max-w-xl mx-auto">
      <h1 className="text-lg font-semibold mb-4">備品を追加</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                備品名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="例: ノートPC (MacBook Pro 16)"
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">カテゴリ</Label>
              <Input
                id="category"
                name="category"
                placeholder="例: PC, 機器, カメラ"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">説明・メモ</Label>
              <Input
                id="description"
                name="description"
                placeholder="例: シリアル番号 XYZ-123"
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="w-full">
              登録する
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
