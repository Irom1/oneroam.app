import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/types";

const variants: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  completed: "default",
  failed: "destructive",
  refunded: "outline",
};

const labels: Record<OrderStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
  refunded: "Refunded",
};

type Props = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: Props) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
