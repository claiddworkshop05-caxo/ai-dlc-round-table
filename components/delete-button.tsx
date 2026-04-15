"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteEquipment } from "@/app/actions";

export function DeleteButton({ equipmentId }: { equipmentId: number }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!window.confirm("この備品を削除しますか？\n貸出履歴もすべて削除されます。")) return;
    startTransition(async () => {
      await deleteEquipment(equipmentId);
      router.push("/");
    });
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={isPending}
      className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
    >
      {isPending ? "削除中..." : "この備品を削除する"}
    </Button>
  );
}
