import { Suspense } from "react";
import { OrderDetailContent } from "./order-detail-content";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-10"><p className="text-center text-muted-foreground py-8">Loading...</p></div>}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}
