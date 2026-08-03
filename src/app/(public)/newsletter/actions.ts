"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function confirmUnsubscribe(token: string) {
  await db.newsletterSubscriber.deleteMany({ where: { unsubscribeToken: token } });
  redirect(`/newsletter/desabonnement?done=1`);
}
