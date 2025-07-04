import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CheckoutSteps from "@/components/checkout/checkout-steps";
import PaymentMethods from "@/components/checkout/payment-methods";
import type { CheckoutFormData } from "@/types";

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter a complete address"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  paymentMethod: z.enum(['cod', 'mpesa', 'card'], {
    required_error: "Please select a payment method",
  }),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
}).refine((data) => {
  if (data.paymentMethod === 'card') {
    return data.cardNumber && data.expiryDate && data.cvv;
  }
  return true;
}, {
  message: "Card details are required for card payments",
  path: ["cardNumber"],
});

export default function Checkout() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      paymentMethod: "cod",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      setOrderId(order.id);
      setOrderComplete(true);
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.id} has been received.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + tax;

  const handleNext = () => {
    if (currentStep === 1) {
      const fieldsToValidate = ['email', 'firstName', 'lastName', 'phone', 'address', 'city', 'postalCode'];
      form.trigger(fieldsToValidate as any).then((isValid) => {
        if (isValid) {
          setCurrentStep(2);
        }
      });
    } else if (currentStep === 2) {
      form.trigger(['paymentMethod']).then((isValid) => {
        const paymentMethod = form.getValues('paymentMethod');
        if (paymentMethod === 'card') {
          const cardValid = cardDetails.cardNumber && cardDetails.expiryDate && cardDetails.cvv;
          if (isValid && cardValid) {
            setCurrentStep(3);
          } else {
            toast({
              title: "Card details required",
              description: "Please fill in all card details.",
              variant: "destructive",
            });
          }
        } else if (isValid) {
          setCurrentStep(3);
        }
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: CheckoutFormData) => {
    const orderData = {
      ...data,
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  // Redirect if cart is empty and order not complete
  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Cart is Empty</h1>
            <p className="text-slate-600 mb-6">Add some products to your cart before checkout.</p>
            <Button onClick={() => navigate('/products')}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Order completion page
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
            <p className="text-slate-600 mb-4">
              Thank you for your order. Order #{orderId} has been placed successfully.
            </p>
            <div className="space-y-2 mb-6">
              <Button className="w-full" onClick={() => navigate('/products')}>
                Continue Shopping
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/products')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shopping
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        </div>

        <CheckoutSteps currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Shipping Information */}
                {currentStep === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+254 700 123 456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main Street" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Nairobi" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input placeholder="00100" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Payment Method */}
                {currentStep === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <PaymentMethods
                                paymentMethod={field.value}
                                onPaymentMethodChange={field.onChange}
                                cardDetails={cardDetails}
                                onCardDetailsChange={setCardDetails}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Order Review */}
                {currentStep === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Review</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Shipping Details */}
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-medium text-slate-900 mb-3">Shipping Address</h4>
                        <div className="text-sm text-slate-600">
                          <p>{form.getValues('firstName')} {form.getValues('lastName')}</p>
                          <p>{form.getValues('address')}</p>
                          <p>{form.getValues('city')}, {form.getValues('postalCode')}</p>
                          <p>{form.getValues('phone')}</p>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-medium text-slate-900 mb-3">Payment Method</h4>
                        <p className="text-sm text-slate-600">
                          {form.getValues('paymentMethod') === 'cod' && 'Cash on Delivery'}
                          {form.getValues('paymentMethod') === 'mpesa' && 'M-Pesa'}
                          {form.getValues('paymentMethod') === 'card' && 'Credit/Debit Card'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  
                  {currentStep < 3 ? (
                    <Button type="button" onClick={handleNext}>
                      Continue
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={createOrderMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <div className="spinner mr-2" />
                          Placing Order...
                        </>
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      <span className="text-sm text-slate-600">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="space-y-2 border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="text-slate-900">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax (16%)</span>
                    <span className="text-slate-900">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-slate-200 pt-2">
                    <span className="text-slate-900">Total</span>
                    <span className="text-slate-900">{formatPrice(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
