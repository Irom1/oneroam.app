import Link from "next/link";
import { Globe } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { PlanWithCountry } from "@/lib/types";
import { formatPrice, formatDataAmount, cn } from "@/lib/utils";

type Props = {
  plan: PlanWithCountry;
};

export function PlanCard({ plan }: Props) {
  const isRegional = plan.coverage_type === "regional";

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          {isRegional ? (
            <Globe className="h-5 w-5 text-muted-foreground" />
          ) : (
            <span className="text-xl">{plan.country.flag_emoji}</span>
          )}
          <span className="text-sm text-muted-foreground">
            {isRegional ? plan.coverage_region : plan.country.name}
          </span>
        </div>
        <CardTitle className="text-lg">{plan.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {plan.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {formatDataAmount(plan.data_amount_gb)}
          </Badge>
          <Badge variant="secondary">{plan.validity_days} days</Badge>
          {isRegional && <Badge variant="outline">Regional</Badge>}
        </div>
        <p className="mt-4 text-2xl font-bold tabular-nums">
          {formatPrice(plan.price_cents)}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link
          href={`/plans/${plan.id}`}
          className={cn(
            buttonVariants({ variant: "default" }),
            "flex-1 no-underline"
          )}
        >
          View Details
        </Link>
      </CardFooter>
    </Card>
  );
}
