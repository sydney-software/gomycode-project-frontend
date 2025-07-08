import { Link } from "wouter";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
interface ProductCardProps {
  product: any; // Updated to use any for now, can be typed properly later
  variant?: "default" | "compact";
}

export default function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
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

  if (variant === "compact") {
    return (
      <Card className="group hover:shadow-xl transition-shadow overflow-hidden border border-slate-200">
        <Link href={`/products/${product._id}`}>
          <a className="block">
            <div className="aspect-square overflow-hidden bg-slate-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge className={`text-xs font-medium ${getCategoryColor(product.category.name)}`}>
                  {product.category.name === 'Smartphones' ? 'Phone' : 'Laptop'}
                </Badge>
                <div className="flex items-center text-xs">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="ml-1 text-slate-600">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-1 text-sm">{product.name}</h3>
              <p className="text-slate-600 text-xs mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-slate-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-slate-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </a>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-xl transition-shadow overflow-hidden">
      <Link href={`/products/${product._id}`}>
        <a className="block">
          <div className="aspect-square overflow-hidden bg-slate-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Badge className={`text-sm font-medium ${getCategoryColor(product.category.name)}`}>
                {product.category.name === 'Smartphones' ? 'Phone' : 'Laptop'}
              </Badge>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm text-slate-600">
                  {product.rating} ({product.reviewCount})
                </span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{product.name}</h3>
            <p className="text-slate-600 text-sm mb-4 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <Button
                onClick={handleAddToCart}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </a>
      </Link>
    </Card>
  );
}
