import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/product/product-card";
import ProductFilters from "@/components/product/product-filters";
import { productsApi } from "@/lib/api";

export default function Products() {
  const [location] = useLocation();
  const [filters, setFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Parse URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const initialFilters: any = {};
    
    if (params.get('category')) initialFilters.category = params.get('category');
    if (params.get('brand')) initialFilters.brand = params.get('brand');
    if (params.get('search')) initialFilters.search = params.get('search');
    if (params.get('featured')) initialFilters.featured = params.get('featured') === 'true';
    if (params.get('minPrice')) initialFilters.minPrice = parseInt(params.get('minPrice')!);
    if (params.get('maxPrice')) initialFilters.maxPrice = parseInt(params.get('maxPrice')!);
    
    setFilters(initialFilters);
  }, [location]);

  // Build query parameters
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });
  queryParams.append('limit', productsPerPage.toString());
  queryParams.append('offset', ((currentPage - 1) * productsPerPage).toString());

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products", filters, sortBy, currentPage],
    queryFn: () => {
      const queryFilters = {
        ...filters,
        sortBy,
        limit: productsPerPage,
        offset: (currentPage - 1) * productsPerPage,
      };
      return productsApi.getProducts(queryFilters);
    },
  });

  // Products are already sorted by the API

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Failed to load products. Please try again.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <ProductFilters onFiltersChange={handleFiltersChange} />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">All Products</h1>
                <p className="text-slate-600">
                  {isLoading ? "Loading..." : `Showing ${products.length} results`}
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Sort by: Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="rating">Best Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-slate-200 aspect-square rounded-lg mb-4"></div>
                    <div className="bg-slate-200 h-4 rounded mb-2"></div>
                    <div className="bg-slate-200 h-4 rounded w-3/4 mb-2"></div>
                    <div className="bg-slate-200 h-6 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">No products found matching your criteria.</p>
                <Button onClick={() => setFilters({})}>Clear Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} variant="compact" />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && products.length > 0 && (
              <div className="flex items-center justify-center mt-12">
                <nav className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {[...Array(Math.min(5, Math.ceil(products.length / productsPerPage)))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={products.length < productsPerPage}
                  >
                    Next
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
