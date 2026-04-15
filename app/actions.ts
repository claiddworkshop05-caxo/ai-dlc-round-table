"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { equipment, loans } from "@/src/schema";

export async function createEquipment(formData: FormData) {
  const { db } = await import("@/src/db");
  const name = formData.get("name");
  const description = formData.get("description");
  const category = formData.get("category");

  if (typeof name !== "string" || name.trim() === "") return;

  const [created] = await db
    .insert(equipment)
    .values({
      name: name.trim(),
      description: typeof description === "string" ? description.trim() || null : null,
      category: typeof category === "string" ? category.trim() || null : null,
    })
    .returning({ id: equipment.id });

  revalidatePath("/");
  return created.id;
}

export async function borrowEquipment(
  equipmentId: number,
  borrowerName: string,
  notes?: string
) {
  const { db } = await import("@/src/db");

  await db.insert(loans).values({
    equipmentId,
    borrowerName,
    action: "borrow",
    notes: notes || null,
  });

  await db
    .update(equipment)
    .set({ status: "borrowed" })
    .where(eq(equipment.id, equipmentId));

  revalidatePath(`/equipment/${equipmentId}`);
  revalidatePath(`/equipment/${equipmentId}/loan`);
  revalidatePath("/");
  revalidatePath("/loans");
}

export async function returnEquipment(
  equipmentId: number,
  borrowerName: string
) {
  const { db } = await import("@/src/db");

  await db.insert(loans).values({
    equipmentId,
    borrowerName,
    action: "return",
    notes: null,
  });

  await db
    .update(equipment)
    .set({ status: "available" })
    .where(eq(equipment.id, equipmentId));

  revalidatePath(`/equipment/${equipmentId}`);
  revalidatePath(`/equipment/${equipmentId}/loan`);
  revalidatePath("/");
  revalidatePath("/loans");
}

export async function deleteEquipment(equipmentId: number) {
  const { db } = await import("@/src/db");

  // 関連する貸出履歴を先に削除
  await db.delete(loans).where(eq(loans.equipmentId, equipmentId));
  await db.delete(equipment).where(eq(equipment.id, equipmentId));

  revalidatePath("/");
  revalidatePath("/loans");
}
