import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, User, ShoppingCart, Menu, X, LogOut, Settings, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { itemCount, openCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navigationItems = [
    { name: "Phones", path: "/products?category=smartphones" },
    { name: "Laptops", path: "/products?category=laptops" },
    { name: "Deals", path: "/products?featured=true" },
    { name: "Support", path: "/support" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">
                  Front Market
                </h1>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-10 md:flex space-x-8">
              {navigationItems.map((item) => (
                <Link key={item.name} href={item.path}>
                  <a className="text-slate-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search phones, laptops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
            </form>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <User className="h-5 w-5" />
                    <span className="ml-2 hidden lg:inline">{user?.firstName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative" 
              onClick={openCart}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link key={item.name} href={item.path}>
                  <a
                    className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                </Link>
              ))}

              {/* Mobile Auth Section */}
              <div className="border-t border-slate-200 pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-sm font-medium text-slate-900">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <Link href="/profile">
                      <a
                        className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Profile Settings
                      </a>
                    </Link>
                    <Link href="/orders">
                      <a
                        className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        My Orders
                      </a>
                    </Link>
                    <Link href="/wishlist">
                      <a
                        className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Wishlist
                      </a>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <a
                        className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </a>
                    </Link>
                    <Link href="/register">
                      <a
                        className="block px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign Up
                      </a>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
