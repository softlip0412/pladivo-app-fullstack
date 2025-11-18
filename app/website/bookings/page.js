'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, MapPin, Star, Users, CreditCard, User, Mail, Phone, X, Ticket } from 'lucide-react'

export default function BookingsPage() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    guests: 1,
    specialRequests: '',
    paymentMethod: 'card'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      if (data.success) {
        setEvents(data.data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setShowBookingForm(true)
  }

  const handleCloseForm = () => {
    setShowBookingForm(false)
    setSelectedEvent(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      guests: 1,
      specialRequests: '',
      paymentMethod: 'card'
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const bookingData = {
        ...formData,
        eventId: selectedEvent.id,
        date: new Date().toISOString(),
        userId: 'user123' // Thực tế sẽ lấy từ auth
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Đặt vé thành công! Bạn sẽ nhận được email xác nhận sớm.')
        handleCloseForm()
      } else {
        alert('Đặt vé thất bại. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculateTotal = () => {
    if (!selectedEvent) return { basePrice: 0, serviceFee: 0, total: 0 }
    
    const basePrice = selectedEvent.price * parseInt(formData.guests || 1)
    const serviceFee = Math.round(basePrice * 0.05) // phí dịch vụ 5%
    return { basePrice, serviceFee, total: basePrice + serviceFee }
  }

  const pricing = calculateTotal()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-sky-600">
            <a href="/">Pladivo</a>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-700 hover:text-sky-600 transition-colors">Trang chủ</a>
            <a href="/about" className="text-gray-700 hover:text-sky-600 transition-colors">Giới thiệu</a>
            <a href="/guide" className="text-gray-700 hover:text-sky-600 transition-colors">Hướng dẫn</a>
            <a href="/events" className="text-gray-700 hover:text-sky-600 transition-colors">Sự kiện</a>
            <a href="/services" className="text-gray-700 hover:text-sky-600 transition-colors">Dịch vụ</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="text-sky-600 border-sky-600 hover:bg-sky-50">
              <a href="/login">Đăng nhập</a>
            </Button>
            <Button className="bg-sky-600 hover:bg-sky-700 text-white">
              <a href="/signup">Tạo tài khoản</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Đặt vé sự kiện</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Chọn sự kiện bên dưới để mua vé. Bấm vào sự kiện để xem chi tiết và đặt vé ngay.
          </p>
        </div>

        {/* Events List */}
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Đang tải sự kiện...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Card 
                  key={event.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-sky-600"
                  onClick={() => handleEventClick(event)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      {/* Event Image */}
                      <div className="w-full md:w-32 h-32 flex-shrink-0">
                        <img 
                          src={`https://images.unsplash.com/photo-${
                            event.id === 1 ? '1493225457124-a3eb161ffa5f' : 
                            event.id === 2 ? '1540575467063-178a50c2df87' :
                            event.id === 3 ? '1452860606245-08befc0ff44b' :
                            '1571019613454-1cb2f99b2d8b'}?w=200&h=128&fit=crop`}
                          alt={event.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                            
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center text-gray-600 text-sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(event.date).toLocaleDateString('vi-VN', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <MapPin className="h-4 w-4 mr-2" />
                                {event.location}
                              </div>
                              <div className="flex items-center text-gray-600 text-sm">
                                <Star className="h-4 w-4 mr-2 text-yellow-400 fill-current" />
                                {event.rating} • {event.availableTickets} vé còn lại
                              </div>
                            </div>
                          </div>

                          {/* Price and Category */}
                          <div className="text-right">
                            <div className="bg-sky-100 text-sky-800 px-2 py-1 rounded text-xs font-medium mb-2">
                              {event.category}
                            </div>
                            <div className="text-2xl font-bold text-sky-600 mb-1">
                              {event.price}₫
                            </div>
                            <div className="text-sm text-gray-500">mỗi vé</div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="flex items-center text-sm text-gray-600">
                            <Ticket className="h-4 w-4 mr-1" />
                            Nhấn để đặt vé
                          </div>
                          <Button className="bg-sky-600 hover:bg-sky-700">
                            Chọn sự kiện
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Booking Form Modal */}
        {showBookingForm && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Đặt vé - {selectedEvent.title}</h2>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleCloseForm}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6">
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Booking Form */}
                  <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Thông tin cá nhân</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">Tên *</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                id="firstName"
                                name="firstName"
                                placeholder="Nhập tên"
                                className="pl-10"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Họ *</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              placeholder="Nhập họ"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@email.com"
                                className="pl-10"
                                value={formData.email}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="phone">Số điện thoại *</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="Nhập số điện thoại"
                                className="pl-10"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Details */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Chi tiết vé</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="guests">Số lượng vé</Label>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Select value={formData.guests.toString()} onValueChange={(value) => 
                              setFormData(prev => ({ ...prev, guests: parseInt(value) }))
                            }>
                              <SelectTrigger className="pl-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num} {num === 1 ? 'vé' : 'vé'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="specialRequests">Yêu cầu đặc biệt (tuỳ chọn)</Label>
                          <Textarea
                            id="specialRequests"
                            name="specialRequests"
                            placeholder="Nhập yêu cầu hoặc lưu ý..."
                            rows={3}
                            value={formData.specialRequests}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Phương thức thanh toán</h3>
                        
                        <Select value={formData.paymentMethod} onValueChange={(value) => 
                          setFormData(prev => ({ ...prev, paymentMethod: value }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">Thẻ tín dụng/Ghi nợ</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="bank">Chuyển khoản ngân hàng</SelectItem>
                          </SelectContent>
                        </Select>

                        {formData.paymentMethod === 'card' && (
                          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <div className="space-y-2">
                              <Label>Số thẻ</Label>
                              <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                  placeholder="1234 5678 9012 3456"
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Ngày hết hạn</Label>
                                <Input placeholder="MM/YY" />
                              </div>
                              <div className="space-y-2">
                                <Label>CVV</Label>
                                <Input placeholder="123" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full bg-sky-600 hover:bg-sky-700 text-lg py-3"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Đang xử lý...
                          </div>
                        ) : (
                          `Xác nhận đặt vé - ${pricing.total}₫`
                        )}
                      </Button>
                    </form>
                  </div>

                  {/* Booking Summary */}
                  <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                      <CardHeader>
                        <CardTitle>Tóm tắt đơn</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Event Details */}
                        <div className="border-b pb-4">
                          <img 
                            src={`https://images.unsplash.com/photo-${
                              selectedEvent.id === 1 ? '1493225457124-a3eb161ffa5f' : 
                              selectedEvent.id === 2 ? '1540575467063-178a50c2df87' :
                              selectedEvent.id === 3 ? '1452860606245-08befc0ff44b' :
                              '1571019613454-1cb2f99b2d8b'}?w=300&h=200&fit=crop`}
                            alt={selectedEvent.title}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                          <h3 className="font-bold text-lg">{selectedEvent.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{selectedEvent.description}</p>
                          
                          <div className="flex items-center text-gray-600 text-sm mb-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(selectedEvent.date).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm mb-1">
                            <MapPin className="h-4 w-4 mr-2" />
                            {selectedEvent.location}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Star className="h-4 w-4 mr-2 text-yellow-400 fill-current" />
                            {selectedEvent.rating} đánh giá
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>{formData.guests || 1} × {selectedEvent.price}₫</span>
                            <span>{pricing.basePrice}₫</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Phí dịch vụ</span>
                            <span>{pricing.serviceFee}₫</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-bold text-lg">
                            <span>Tổng cộng</span>
                            <span className="text-sky-600">{pricing.total}₫</span>
                          </div>
                        </div>

                        {/* Cancellation Policy */}
                        <div className="text-xs text-gray-500 border-t pt-4">
                          <strong>Chính sách huỷ:</strong> Miễn phí huỷ trước 24h.  
                          Hoàn 50% nếu huỷ trong vòng 24h trước sự kiện.
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
