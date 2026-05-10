import { OrderStatusBadge } from "./order-status-badge";
import type { OrderWithItems } from "@/lib/types";
import { formatPrice, formatDataAmount, formatDate } from "@/lib/utils";

type Props = {
  order: OrderWithItems;
};

export function OrderDetail({ order }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
          <p className="text-sm text-muted-foreground">
            Placed {formatDate(order.created_at)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Plan</th>
              <th className="text-center p-3 font-medium">Qty</th>
              <th className="text-right p-3 font-medium">Price</th>
              <th className="text-right p-3 font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span>{item.plan.country.flag_emoji}</span>
                    <div>
                      <p className="font-medium">{item.plan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDataAmount(item.plan.data_amount_gb)} &middot;{" "}
                        {item.plan.validity_days} days
                      </p>
                    </div>
                  </div>
                </td>
                <td className="text-center p-3 tabular-nums">
                  {item.quantity}
                </td>
                <td className="text-right p-3 tabular-nums">
                  {formatPrice(item.unit_price_cents)}
                </td>
                <td className="text-right p-3 tabular-nums font-medium">
                  {formatPrice(item.subtotal_cents)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/30">
              <td colSpan={3} className="text-right p-3 font-semibold">
                Total
              </td>
              <td className="text-right p-3 font-bold tabular-nums">
                {formatPrice(order.total_cents)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {order.status === "completed" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p className="font-medium">Payment confirmed</p>
          <p className="mt-1">
            Your eSIM activation details will be sent to{" "}
            <strong>{order.customer_email}</strong>. Please check your inbox and
            spam folder.
          </p>
        </div>
      )}

      {order.status === "pending" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Payment processing</p>
          <p className="mt-1">
            We are waiting for payment confirmation. This usually takes a few
            seconds. Refresh this page to check for updates.
          </p>
        </div>
      )}

      {order.status === "failed" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">Payment failed</p>
          <p className="mt-1">
            Your payment could not be processed. Please try again or contact
            support.
          </p>
        </div>
      )}
    </div>
  );
}
