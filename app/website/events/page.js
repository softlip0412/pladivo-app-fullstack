'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, MapPin, Star, Search, Filter } from 'lucide-react'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  const categories = [
    { value: 'all', label: 'Tất cả thể loại' },
    { value: 'Concerts', label: 'Hòa nhạc' },
    { value: 'Conferences', label: 'Hội thảo' },
    { value: 'Workshops', label: 'Workshop' },
    { value: 'Sports', label: 'Thể thao' }
  ]

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm, selectedCategory])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      const data = await response.json()
      if (data.success) {
        setEvents(data.data)
      }
    } catch (error) {
      console.error('Lỗi khi tải sự kiện:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = [...events]

    // Lọc theo thể loại
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory)
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredEvents(filtered)
  }

  const handleBooking = (eventId) => {
    window.location.href = `/booking?eventId=${eventId}`
  }

  return (
    <div className="min-h-screen bg-white">
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
            <a href="/events" className="text-sky-600 font-semibold">Sự kiện</a>
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

      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-sky-50 to-blue-50">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Khám phá các sự kiện tuyệt vời</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Tìm và đặt vé cho hòa nhạc, hội thảo, workshop, thể thao và nhiều hơn nữa.
            </p>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm sự kiện</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Tìm theo tên, địa điểm hoặc mô tả..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">Thể loại</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thể loại" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={filterEvents} className="bg-sky-600 hover:bg-sky-700">
                <Filter className="h-4 w-4 mr-2" />
                Áp dụng bộ lọc
              </Button>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {filteredEvents.length} sự kiện được tìm thấy
              </h2>
              <Select defaultValue="date">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Ngày tổ chức</SelectItem>
                  <SelectItem value="price-low">Giá: Thấp đến cao</SelectItem>
                  <SelectItem value="price-high">Giá: Cao đến thấp</SelectItem>
                  <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Đang tải sự kiện...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Không tìm thấy sự kiện phù hợp.</p>
                <Button 
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                  className="mt-4 bg-sky-600 hover:bg-sky-700"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={`https://images.unsplash.com/photo-${event.id === 1 ? '1493225457124-a3eb161ffa5f' : 
                             event.id === 2 ? '1540575467063-178a50c2df87' :
                             event.id === 3 ? '1452860606245-08befc0ff44b' :
                             '1571019613454-1cb2f99b2d8b'}?w=400&h=250&fit=crop`}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-sky-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {event.price}₫
                      </div>
                      <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        {event.category}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(event.date).toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="h-4 w-4 mr-2" />
                          {event.location}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Star className="h-4 w-4 mr-2 text-yellow-400 fill-current" />
                          {event.rating} ({event.availableTickets} vé còn lại)
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-sky-600">
                          {event.price}₫
                        </div>
                        <Button 
                          onClick={() => handleBooking(event.id)}
                          className="bg-sky-600 hover:bg-sky-700"
                        >
                          Đặt vé
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-sky-400 mb-4">Pladivo</h3>
              <p className="text-gray-300 mb-4">
                Điểm đến hàng đầu của bạn cho việc đặt sự kiện và dịch vụ chuyên nghiệp.  
                Giúp bạn tạo nên những khoảnh khắc đáng nhớ một cách dễ dàng.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-sky-400 transition-colors">Trung tâm hỗ trợ</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Câu hỏi thường gặp</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Liên hệ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Công ty</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/about" className="hover:text-sky-400 transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Tuyển dụng</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Báo chí</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/events" className="hover:text-sky-400 transition-colors">Sự kiện</a></li>
                <li><a href="/services" className="hover:text-sky-400 transition-colors">Dịch vụ</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Đối tác</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Pladivo. Bản quyền thuộc về công ty.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
