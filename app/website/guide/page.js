'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Calendar, CreditCard, Star, ArrowRight } from 'lucide-react'

export default function GuidePage() {
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
            <a href="/guide" className="text-sky-600 font-semibold">Hướng dẫn</a>
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
            <h1 className="text-4xl font-bold text-gray-800 mb-6">Cách sử dụng Pladivo</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Làm theo hướng dẫn từng bước để khám phá, đặt chỗ và quản lý các sự kiện và dịch vụ tuyệt vời.
            </p>
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Bắt đầu</h2>
            
            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <div className="flex items-center mb-4">
                    <div className="bg-sky-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4">1</div>
                    <h3 className="text-2xl font-bold text-gray-800">Tìm kiếm & Khám phá</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Sử dụng chức năng tìm kiếm mạnh mẽ để tìm sự kiện và dịch vụ phù hợp với nhu cầu của bạn. 
                    Lọc theo danh mục, địa điểm, ngày và giá để thu hẹp lựa chọn.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <Search className="w-4 h-4 text-sky-600 mr-2" />
                      Duyệt theo danh mục hoặc dùng thanh tìm kiếm
                    </li>
                    <li className="flex items-center">
                      <Calendar className="w-4 h-4 text-sky-600 mr-2" />
                      Lọc theo ngày và tình trạng chỗ
                    </li>
                    <li className="flex items-center">
                      <Star className="w-4 h-4 text-sky-600 mr-2" />
                      Xem đánh giá và nhận xét
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop" 
                    alt="Tìm kiếm và Khám phá"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="md:w-1/2">
                  <div className="flex items-center mb-4">
                    <div className="bg-sky-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4">2</div>
                    <h3 className="text-2xl font-bold text-gray-800">So sánh & Chọn</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    So sánh các lựa chọn dựa trên giá, địa điểm, đánh giá và tính năng. 
                    Đọc mô tả chi tiết và nhận xét từ khách hàng để quyết định chính xác.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <ArrowRight className="w-4 h-4 text-sky-600 mr-2" />
                      Xem thông tin chi tiết sự kiện/dịch vụ
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="w-4 h-4 text-sky-600 mr-2" />
                      So sánh giá và gói dịch vụ
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="w-4 h-4 text-sky-600 mr-2" />
                      Đọc nhận xét từ khách hàng
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop" 
                    alt="So sánh và Chọn"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2">
                  <div className="flex items-center mb-4">
                    <div className="bg-sky-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4">3</div>
                    <h3 className="text-2xl font-bold text-gray-800">Đặt chỗ & Thanh toán</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Hoàn tất đặt chỗ dễ dàng với quy trình thanh toán an toàn. Có nhiều phương thức thanh toán, 
                    xác nhận ngay lập tức và gửi chi tiết đặt chỗ qua email.
                  </p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <CreditCard className="w-4 h-4 text-sky-600 mr-2" />
                      Thanh toán an toàn
                    </li>
                    <li className="flex items-center">
                      <Calendar className="w-4 h-4 text-sky-600 mr-2" />
                      Xác nhận đặt chỗ ngay
                    </li>
                    <li className="flex items-center">
                      <ArrowRight className="w-4 h-4 text-sky-600 mr-2" />
                      Nhận email xác nhận & hóa đơn
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2">
                  <img 
                    src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&h=300&fit=crop" 
                    alt="Đặt chỗ và Thanh toán"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Overview */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Tính năng nổi bật</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="w-6 h-6 text-sky-600 mr-2" />
                    Tìm kiếm nâng cao
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Tìm đúng thứ bạn cần với hệ thống lọc toàn diện: danh mục, ngày, địa điểm, khoảng giá và nhiều hơn nữa.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-6 h-6 text-sky-600 mr-2" />
                    Đánh giá & Nhận xét
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Quyết định dễ dàng hơn với nhận xét thật từ khách hàng. 
                    Xem trải nghiệm của người khác trước khi đặt chỗ.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-6 h-6 text-sky-600 mr-2" />
                    Thanh toán an toàn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Thông tin thanh toán của bạn được bảo mật cấp ngân hàng. 
                    Hỗ trợ nhiều phương thức để tiện lợi cho bạn.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Câu hỏi thường gặp</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tôi có thể hủy hoặc chỉnh sửa đặt chỗ như thế nào?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Bạn có thể hủy hoặc chỉnh sửa trong trang quản lý tài khoản. 
                    Chính sách hủy phụ thuộc vào từng sự kiện/dịch vụ và được hiển thị rõ ràng khi đặt.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Có phí đặt chỗ không?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Chúng tôi thu một khoản phí dịch vụ nhỏ để xử lý đặt chỗ, 
                    và được hiển thị rõ ràng trước khi bạn thanh toán. Không có phí ẩn.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tôi liên hệ hỗ trợ khách hàng bằng cách nào?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Đội ngũ hỗ trợ khách hàng hoạt động 24/7 qua chat, email hoặc điện thoại. 
                    Bạn có thể vào trang Liên hệ hoặc Trung tâm hỗ trợ.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tôi có thể đặt hộ người khác không?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Có, bạn có thể đặt cho người khác. Hãy chắc chắn nhập đúng thông tin liên hệ của người tham gia hoặc người nhận dịch vụ.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-sky-600 text-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu chưa?</h2>
            <p className="text-xl text-sky-100 mb-8 max-w-2xl mx-auto">
              Tham gia cùng hàng ngàn khách hàng hài lòng và bắt đầu đặt sự kiện & dịch vụ ngay hôm nay.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-sky-600 hover:bg-gray-100">
                <a href="/events">Khám phá sự kiện</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-sky-600">
                <a href="/services">Khám phá dịch vụ</a>
              </Button>
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
                Điểm đến hàng đầu để đặt sự kiện & dịch vụ chuyên nghiệp. 
                Biến khoảnh khắc đáng nhớ trở nên dễ dàng.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-sky-400 transition-colors">Hỗ trợ khách hàng</a></li>
                <li><a href="#" className="hover:text-sky-400 transition-colors">FAQ</a></li>
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
            <p>&copy; 2024 Pladivo. Mọi quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
