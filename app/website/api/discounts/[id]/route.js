import { connectDB } from "@/lib/mongodb"
import { Discount } from "@/models/Discount"
import { authenticateToken } from "@/lib/auth"

export async function GET(_, { params }) {
  await connectDB()
  const user = authenticateToken()

  if (!["admin", "manager", "staff"].includes(user.role)) {
    return Response.json({ error: "Permission denied" }, { status: 403 })
  }

  const discount = await Discount.findById(params.id).populate("eventType", "name description")
  if (!discount) {
    return Response.json({ error: "Discount not found" }, { status: 404 })
  }

  return Response.json(discount, { status: 200 })
}

export async function PUT(request, { params }) {
  await connectDB()
  const user = authenticateToken()

  if (!["admin", "manager", "staff"].includes(user.role)) {
    return Response.json({ error: "Permission denied" }, { status: 403 })
  }

  const data = await request.json()
  const updated = await Discount.findByIdAndUpdate(params.id, data, { new: true })

  if (!updated) {
    return Response.json({ error: "Discount not found" }, { status: 404 })
  }

  return Response.json({ message: "Discount updated", discount: updated }, { status: 200 })
}

export async function DELETE(_, { params }) {
  await connectDB()
  const user = authenticateToken()

  if (!["admin", "manager", "staff"].includes(user.role)) {
    return Response.json({ error: "Permission denied" }, { status: 403 })
  }

  const deleted = await Discount.findByIdAndDelete(params.id)
  if (!deleted) {
    return Response.json({ error: "Discount not found" }, { status: 404 })
  }

  return Response.json({ message: "Discount deleted" }, { status: 200 })
}
