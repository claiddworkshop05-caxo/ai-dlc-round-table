import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scanner } from "@/components/scanner";

export default function ScanPage() {
  return (
    <div className="px-4 py-6 max-w-xl mx-auto space-y-5">
      <h1 className="text-lg font-semibold">QRコードスキャン</h1>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">備品のQRコードを読み取る</CardTitle>
        </CardHeader>
        <CardContent>
          <Scanner />
        </CardContent>
      </Card>

      <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">使い方</p>
        <p>1. 「スキャンを開始する」をタップ</p>
        <p>2. カメラを備品のQRコードに向ける</p>
        <p>3. 読み取り完了後、貸出/返却画面へ移動します</p>
      </div>
    </div>
  );
}
