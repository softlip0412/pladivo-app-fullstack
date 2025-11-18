import { connectDB } from "@/lib/mongodb"
import { Discount } from "@/models/Discount"
import { authenticateToken } from "@/lib/auth"

export async function GET() {
  await connectDB()
  const discounts = await Discount.find().populate("eventType", "name description")
  return Response.json(discounts, { status: 200 })
}

export async function POST(request) {
  await connectDB()
  const user = authenticateToken()

  if (!["admin", "manager", "staff"].includes(user.role)) {
    return Response.json({ error: "Permission denied" }, { status: 403 })
  }

  const { title, discount, originalPrice, discountedPrice, image, eventTypeId } = await request.json()

  const newDiscount = new Discount({
    title,
    discount,
    originalPrice,
    discountedPrice,
    image,
    eventType: eventTypeId,
  })

  await newDiscount.save()

  return Response.json(
    { message: "Discount created successfully", discount: newDiscount },
    { status: 201 }
  )
}
