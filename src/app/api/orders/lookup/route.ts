import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrderByNumberAndEmail } from "@/lib/d1/data";

const requestSchema = z.object({
  email: z.string().email(),
  orderNumber: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide a valid email and order number." },
        { status: 400 }
      );
    }

    const { email, orderNumber } = parsed.data;
    const order = await getOrderByNumberAndEmail(
      orderNumber.toUpperCase(),
      email
    );

    if (!order) {
      return NextResponse.json(
        { error: "No order found with that email and order number." },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
