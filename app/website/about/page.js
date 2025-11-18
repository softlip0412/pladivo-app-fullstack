'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Target, Award, Heart } from 'lucide-react'

export default function AboutPage() {
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
            <a href="/about" className="text-sky-600 font-semibold">Giới thiệu</a>
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

      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-sky-50 to-blue-50">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Về Pladivo</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Điểm đến hàng đầu của bạn cho việc đặt sự kiện và dịch vụ chuyên nghiệp. 
              Chúng tôi kết nối mọi người với những trải nghiệm tuyệt vời và giúp tạo nên những khoảnh khắc đáng nhớ thật dễ dàng.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Sứ mệnh của chúng tôi</h2>
                <p className="text-gray-600 mb-6">
                  Cách mạng hóa ngành tổ chức sự kiện bằng cách cung cấp một nền tảng liền mạch, kết nối 
                  nhà tổ chức, nhà cung cấp dịch vụ và người tham dự. Chúng tôi tin rằng mọi sự kiện đều nên 
                  đặc biệt và không căng thẳng.
                </p>
                <p className="text-gray-600">
                  Nền tảng của chúng tôi đơn giản hóa quá trình lập kế hoạch sự kiện phức tạp, giúp mọi người đều có thể tiếp cận, 
                  từ cá nhân tổ chức tiệc đến các nhà quản lý sự kiện doanh nghiệp.
                </p>
              </div>
              <div>
                <img 
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=400&fit=crop" 
                  alt="Sứ mệnh"
                  className="rounded-lg shadow-lg w-full h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Giá trị cốt lõi</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Users className="w-12 h-12 text-sky-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Cộng đồng</h3>
                  <p className="text-gray-600">
                    Kết nối mọi người và tạo ra những mối quan hệ bền vững thông qua các trải nghiệm chung.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Target className="w-12 h-12 text-sky-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Xuất sắc</h3>
                  <p className="text-gray-600">
                    Cam kết mang đến dịch vụ chất lượng cao nhất và vượt qua kỳ vọng trong mọi trải nghiệm.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Award className="w-12 h-12 text-sky-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Đổi mới</h3>
                  <p className="text-gray-600">
                    Không ngừng cải tiến nền tảng với công nghệ tiên tiến và các giải pháp sáng tạo.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Heart className="w-12 h-12 text-sky-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Đam mê</h3>
                  <p className="text-gray-600">
                    Chúng tôi yêu công việc mình làm và điều đó thể hiện trong mọi sự kiện mà chúng tôi góp phần tạo nên.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Đội ngũ của chúng tôi</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <img 
                    src="" 
                    alt="John Smith"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold mb-2">John Smith</h3>
                  <p className="text-sky-600 mb-2">CEO & Nhà sáng lập</p>
                  <p className="text-gray-600 text-sm">
                    Hơn 10 năm trong ngành tổ chức sự kiện với niềm đam mê công nghệ và đổi mới.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <img 
                    src="" 
                    alt="Sarah Johnson"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold mb-2">Sarah Johnson</h3>
                  <p className="text-sky-600 mb-2">Trưởng phòng Vận hành</p>
                  <p className="text-gray-600 text-sm">
                    Chuyên gia tối ưu quy trình và đảm bảo trải nghiệm khách hàng xuất sắc.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="pt-6">
                  <img 
                    src="" 
                    alt="Mike Chen"
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold mb-2">Mike Chen</h3>
                  <p className="text-sky-600 mb-2">Giám đốc Công nghệ (CTO)</p>
                  <p className="text-gray-600 text-sm">
                    Lãnh đạo công nghệ với chuyên môn về nền tảng quy mô lớn và thiết kế trải nghiệm người dùng.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-sky-600 text-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <h3 className="text-4xl font-bold mb-2">10,000+</h3>
                <p className="text-sky-100">Sự kiện đã tổ chức</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold mb-2">50,000+</h3>
                <p className="text-sky-100">Khách hàng hài lòng</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold mb-2">500+</h3>
                <p className="text-sky-100">Nhà cung cấp dịch vụ</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold mb-2">25+</h3>
                <p className="text-sky-100">Thành phố hoạt động</p>
              </div>
            </div>
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
                Giúp tạo nên những khoảnh khắc đáng nhớ một cách dễ dàng.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-sky-400 transition-colors">Hỗ trợ khách hàng</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Câu hỏi thường gặp</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Liên hệ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Công ty</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="/about" className="hover:text-sky-400 transition-colors">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Tuyển dụng</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">Truyền thông</a></li>
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
            <p>&copy; 2024 Pladivo. Bản quyền thuộc về chúng tôi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
