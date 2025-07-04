import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Star, ShoppingCart, Shield, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { ProductWithDetails } from "@shared/schema";

export default function ProductDetail() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const { addItem } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery<ProductWithDetails>({
    queryKey: [`/api/products/${productId}`],
    enabled: !isNaN(productId),
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image,
      maxQuantity: product.stockQuantity,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'smartphones':
        return 'bg-blue-50 text-blue-600';
      case 'laptops':
        return 'bg-emerald-50 text-emerald-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-200 aspect-square rounded-xl"></div>
              <div className="space-y-4">
                <div className="bg-slate-200 h-8 rounded w-3/4"></div>
                <div className="bg-slate-200 h-4 rounded w-full"></div>
                <div className="bg-slate-200 h-4 rounded w-2/3"></div>
                <div className="bg-slate-200 h-12 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Product Not Found</h1>
          <p className="text-slate-600 mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const specifications = product.specifications ? JSON.parse(product.specifications) : {};

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-sm">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Badge className={`${getCategoryColor(product.category.name)}`}>
                  {product.category.name === 'Smartphones' ? 'Phone' : 'Laptop'}
                </Badge>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-slate-600">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
              <p className="text-lg text-slate-600 mb-4">{product.description}</p>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-slate-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-slate-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">In Stock ({product.stockQuantity} available)</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="text-center">
                <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600">Warranty</p>
              </div>
              <div className="text-center">
                <Truck className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600">Fast Delivery</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="specifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="delivery">Delivery & Returns</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="specifications">
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(specifications).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-slate-100">
                        <span className="font-medium text-slate-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-slate-600">{value as string}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">No specifications available for this product.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle>Delivery & Returns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Delivery Options</h4>
                  <ul className="space-y-2 text-slate-600">
                    <li>• Same-day delivery in Nairobi (Order before 2 PM)</li>
                    <li>• Nationwide delivery within 2-3 business days</li>
                    <li>• Free delivery for orders above KES 50,000</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Returns Policy</h4>
                  <ul className="space-y-2 text-slate-600">
                    <li>• 30-day return policy for unopened items</li>
                    <li>• 7-day return policy for opened items</li>
                    <li>• Items must be in original condition</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">Reviews feature coming soon!</p>
                  <p className="text-sm text-slate-500 mt-2">
                    Be the first to review this product
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
