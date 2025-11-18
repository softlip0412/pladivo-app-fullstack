"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Search, Filter, CheckCircle } from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "Catering", label: "Catering" },
    { value: "Photography", label: "Photography" },
    { value: "Venues", label: "Venues" },
    { value: "Equipment Rental", label: "Equipment Rental" },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedCategory]);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      if (data.success) {
        setServices(data.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (service) => service.category === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          service.features?.some((feature) =>
            feature.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    setFilteredServices(filtered);
  };

  const handleBooking = (serviceId) => {
    // This would typically navigate to a booking page or open a booking modal
    window.location.href = `/booking?serviceId=${serviceId}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-sky-600">
            <a href="/">Pladivo</a>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              className="text-gray-700 hover:text-sky-600 transition-colors"
            >
              Trang chủ
            </a>
            <a
              href="/about"
              className="text-gray-700 hover:text-sky-600 transition-colors"
            >
              Giới thiệu
            </a>
            <a
              href="/guide"
              className="text-gray-700 hover:text-sky-600 transition-colors"
            >
              Hướng dẫn
            </a>
            <a
              href="/events"
              className="text-gray-700 hover:text-sky-600 transition-colors"
            >
              Sự kiện
            </a>
            <a href="/services" className="text-sky-600 font-semibold">
              Dịch vụ
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="text-sky-600 border-sky-600 hover:bg-sky-50"
            >
              <a href="/login">Đăng nhập</a>
            </Button>
            <Button className="bg-sky-600 hover:bg-sky-700 text-white">
              <a href="/signup">Tạo tài khoảng</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-sky-50 to-blue-50">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">
              Dịch vụ Sự kiện Chuyên nghiệp
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Tìm các nhà cung cấp dịch vụ uy tín cho tiệc, nhiếp ảnh, địa điểm,
              cho thuê thiết bị và nhiều dịch vụ khác.
            </p>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tìm kiếm Dịch vụ
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by service name, description, or features..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phân loại
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
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

              <Button
                onClick={filterServices}
                className="bg-sky-600 hover:bg-sky-700"
              >
                <Filter className="h-4 w-4 mr-2" />
                Áp dụng Bộ lọc
              </Button>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {filteredServices.length} Dịch vụ Tìm thấy
              </h2>
              <Select defaultValue="rating">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Được Đánh Giá Cao Nhất</SelectItem>
                  <SelectItem value="price-low">Giá: Thấp đến Cao</SelectItem>
                  <SelectItem value="price-high">Giá: Cao đến Thấp</SelectItem>
                  <SelectItem value="name">Theo thứ tự chữ cái</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Đang tải dịch vụ ...</p>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  Không tìm thấy dịch vụ nào phù hợp với tiêu chí của bạn.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="mt-4 bg-sky-600 hover:bg-sky-700"
                >
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredServices.map((service) => (
                  <Card
                    key={service.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={`https://images.unsplash.com/photo-${
                          service.id === 1
                            ? "1414235077428-338989a2e8c0"
                            : service.id === 2
                            ? "1452827073306-6e6e661baf57"
                            : service.id === 3
                            ? "1511285560929-80b456fea0bc"
                            : "1598300042247-d088f8ab3a91"
                        }?w=400&h=250&fit=crop`}
                        alt={service.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        {service.category}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">
                          Features:
                        </h4>
                        <ul className="space-y-1">
                          {service.features
                            ?.slice(0, 3)
                            .map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-center text-gray-600 text-sm"
                              >
                                <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                                {feature}
                              </li>
                            ))}
                        </ul>
                      </div>

                      <div className="flex items-center mb-4">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-semibold">
                          {service.rating}
                        </span>
                        <span className="text-gray-600 text-sm ml-2">
                          (50+ đánh giá)
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-sky-600">
                          {service.price}
                        </div>
                        <Button
                          onClick={() => handleBooking(service.id)}
                          className="bg-sky-600 hover:bg-sky-700"
                        >
                          Đặt dịch vụ
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Service Categories Overview */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
              Các loại dịch vụ
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card
                className="text-center hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory("Catering")}
              >
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Catering</h3>
                  <p className="text-gray-600 text-sm">
                    Dịch vụ ẩm thực chuyên nghiệp cho mọi loại sự kiện
                  </p>
                </CardContent>
              </Card>

              <Card
                className="text-center hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory("Photography")}
              >
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📸</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Nhiếp ảnh</h3>
                  <p className="text-gray-600 text-sm">
                    Ghi lại những khoảnh khắc đặc biệt của bạn một cách chuyên
                    nghiệp
                  </p>
                </CardContent>
              </Card>

              <Card
                className="text-center hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory("Venues")}
              >
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Venues</h3>
                  <p className="text-gray-600 text-sm">
                    Những địa điểm tuyệt đẹp cho những sự kiện đáng nhớ
                  </p>
                </CardContent>
              </Card>

              <Card
                className="text-center hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory("Equipment Rental")}
              >
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎵</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Thiết bị</h3>
                  <p className="text-gray-600 text-sm">
                    Thuê thiết bị âm thanh, hình ảnh và kỹ thuật
                  </p>
                </CardContent>
              </Card>
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
                Điểm đến hàng đầu của bạn cho việc đặt sự kiện và dịch vụ chuyên
                nghiệp. Giúp những khoảnh khắc đáng nhớ trở nên dễ dàng.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Help</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-sky-400 transition-colors">
                    Hỗ trợ Khách hàng
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-sky-400 transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-sky-400 transition-colors">
                    Kết nối
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-sky-400 transition-colors">
                    Giới thiệu
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-sky-400 transition-colors">
                    Cơ hội Nghề nghiệp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-sky-400 transition-colors">
                    Báo chí / Truyền thông
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-sky-400 transition-colors">
                    Sự kiện
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-sky-400 transition-colors">
                    Dịch vụ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-sky-400 transition-colors">
                    Đối tác
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Pladivo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
