import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Smartphone, Laptop, Zap, ShieldCheck, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/product/product-card";
import { productsApi } from "@/lib/api";

export default function Home() {
  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productsApi.getProducts({ featured: true, limit: 6 }),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Premium Tech at Your Fingertips
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Discover the latest smartphones and laptops with unbeatable prices and fast delivery across Kenya.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products?category=smartphones">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
                    Shop Phones
                  </Button>
                </Link>
                <Link href="/products?category=laptops">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Shop Laptops
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500"
                  alt="Latest iPhone model"
                  className="w-64 h-80 object-cover rounded-2xl shadow-2xl mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="bg-white py-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/products?category=smartphones">
              <Card className="text-center group cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Smartphone className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="font-semibold">Smartphones</h3>
                  <p className="text-sm text-slate-600 group-hover:text-blue-100">Latest models</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/products?category=laptops">
              <Card className="text-center group cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Laptop className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="font-semibold">Laptops</h3>
                  <p className="text-sm text-slate-600 group-hover:text-blue-100">Work & Gaming</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/products?featured=true">
              <Card className="text-center group cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Star className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="font-semibold">Best Deals</h3>
                  <p className="text-sm text-slate-600 group-hover:text-blue-100">Save more</p>
                </CardContent>
              </Card>
            </Link>
            
            <Card className="text-center group cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Truck className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold">Fast Delivery</h3>
                <p className="text-sm text-slate-600 group-hover:text-blue-100">Same day</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Featured Products</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Discover our handpicked selection of the latest and most popular devices
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 aspect-square rounded-lg mb-4"></div>
                  <div className="bg-slate-200 h-4 rounded mb-2"></div>
                  <div className="bg-slate-200 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/products">
              <Button size="lg">View All Products</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Front Market?</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Experience seamless shopping with trusted payment methods and reliable delivery across Kenya
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="text-center">
              <div className="bg-white bg-opacity-10 rounded-xl p-6 mb-4">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div className="bg-green-600 rounded-lg p-3">
                    <span className="text-white text-lg font-bold">M</span>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Flexible Payment</h3>
                <p className="text-blue-100">Cash on delivery, M-Pesa, or card payments - choose what works for you</p>
              </div>
            </div>

            {/* Fast Delivery */}
            <div className="text-center">
              <div className="bg-white bg-opacity-10 rounded-xl p-6 mb-4">
                <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-4 inline-block">
                  <Zap className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-blue-100">Same-day delivery in Nairobi, nationwide shipping within 2-3 business days</p>
              </div>
            </div>

            {/* Warranty */}
            <div className="text-center">
              <div className="bg-white bg-opacity-10 rounded-xl p-6 mb-4">
                <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-4 inline-block">
                  <ShieldCheck className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Warranty Protection</h3>
                <p className="text-blue-100">All products come with manufacturer warranty and our quality guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
