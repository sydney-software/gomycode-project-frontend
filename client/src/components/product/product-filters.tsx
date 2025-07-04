import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Category, Brand } from "@shared/schema";

interface ProductFiltersProps {
  onFiltersChange: (filters: any) => void;
}

export default function ProductFilters({ onFiltersChange }: ProductFiltersProps) {
  const [location] = useLocation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 500000]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
  });

  // Initialize filters from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const category = params.get('category');
    const brand = params.get('brand');
    const minPrice = params.get('minPrice');
    const maxPrice = params.get('maxPrice');

    if (category) setSelectedCategories([category]);
    if (brand) setSelectedBrands([brand]);
    if (minPrice || maxPrice) {
      setPriceRange([
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 500000
      ]);
    }
  }, [location]);

  // Apply filters whenever they change
  useEffect(() => {
    const filters: any = {};
    
    if (selectedCategories.length > 0) {
      filters.category = selectedCategories[0]; // For simplicity, use first category
    }
    
    if (selectedBrands.length > 0) {
      filters.brand = selectedBrands[0]; // For simplicity, use first brand
    }
    
    if (priceRange[0] > 0) {
      filters.minPrice = priceRange[0];
    }
    
    if (priceRange[1] < 500000) {
      filters.maxPrice = priceRange[1];
    }

    onFiltersChange(filters);
  }, [selectedCategories, selectedBrands, priceRange, onFiltersChange]);

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([categorySlug]);
    } else {
      setSelectedCategories([]);
    }
  };

  const handleBrandChange = (brandSlug: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands(prev => [...prev, brandSlug]);
    } else {
      setSelectedBrands(prev => prev.filter(b => b !== brandSlug));
    }
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 500000]);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <h4 className="font-medium text-slate-700 mb-3">Category</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.slug)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.slug, checked as boolean)
                  }
                />
                <label
                  htmlFor={`category-${category.id}`}
                  className="text-sm text-slate-600 cursor-pointer"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <h4 className="font-medium text-slate-700 mb-3">Brand</h4>
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={selectedBrands.includes(brand.slug)}
                  onCheckedChange={(checked) => 
                    handleBrandChange(brand.slug, checked as boolean)
                  }
                />
                <label
                  htmlFor={`brand-${brand.id}`}
                  className="text-sm text-slate-600 cursor-pointer"
                >
                  {brand.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <h4 className="font-medium text-slate-700 mb-3">Price Range</h4>
          <div className="space-y-3">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={500000}
              step={5000}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Reset Filters */}
        <Button
          variant="outline"
          className="w-full"
          onClick={resetFilters}
        >
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
}
