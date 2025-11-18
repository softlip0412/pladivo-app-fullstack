"use client"

import { useEffect, useState } from "react"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState("Đang xác minh...")

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search)
      const token = params.get("token")
      if (!token) {
        setStatus("❌ Token không hợp lệ")
        return
      }

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()
        if (!res.ok) {
          setStatus("❌ " + (data.error || "Xác minh thất bại"))
        } else {
          setStatus("✅ Xác minh thành công! Bạn có thể đăng nhập.")
        }
      } catch (err) {
        setStatus("Có lỗi xảy ra, vui lòng thử lại.")
      }
    }

    verify()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-xl font-semibold">{status}</h1>
    </div>
  )
}
