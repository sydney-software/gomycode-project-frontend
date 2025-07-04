import { useState } from "react";
import { CreditCard, Smartphone, Banknote } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentMethodsProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  cardDetails: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
  };
  onCardDetailsChange: (details: any) => void;
}

export default function PaymentMethods({
  paymentMethod,
  onPaymentMethodChange,
  cardDetails,
  onCardDetailsChange,
}: PaymentMethodsProps) {
  const paymentOptions = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order is delivered',
      icon: <Banknote className="h-6 w-6 text-green-600" />,
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Pay instantly with M-Pesa mobile money',
      icon: <Smartphone className="h-6 w-6 text-green-600" />,
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Secure payment with Mastercard, Visa',
      icon: <CreditCard className="h-6 w-6 text-blue-600" />,
    },
  ];

  return (
    <div className="space-y-4">
      <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange}>
        {paymentOptions.map((option) => (
          <div key={option.id}>
            <Card 
              className={`cursor-pointer transition-colors ${
                paymentMethod === option.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <CardContent className="flex items-center p-4">
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  className="sr-only"
                />
                <Label
                  htmlFor={option.id}
                  className="flex items-center cursor-pointer w-full"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-slate-200 mr-4">
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{option.name}</div>
                    <div className="text-sm text-slate-600">{option.description}</div>
                  </div>
                  <div className="ml-4">
                    <div 
                      className={`w-4 h-4 rounded-full border-2 ${
                        paymentMethod === option.id 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === option.id && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                      )}
                    </div>
                  </div>
                </Label>
              </CardContent>
            </Card>
          </div>
        ))}
      </RadioGroup>

      {/* Card Details Form */}
      {paymentMethod === 'card' && (
        <Card className="mt-6">
          <CardContent className="p-4 space-y-4">
            <div>
              <Label htmlFor="cardNumber" className="block text-sm font-medium text-slate-700 mb-2">
                Card Number
              </Label>
              <Input
                id="cardNumber"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={(e) => onCardDetailsChange({ ...cardDetails, cardNumber: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 mb-2">
                  Expiry Date
                </Label>
                <Input
                  id="expiryDate"
                  type="text"
                  placeholder="MM/YY"
                  value={cardDetails.expiryDate}
                  onChange={(e) => onCardDetailsChange({ ...cardDetails, expiryDate: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="cvv" className="block text-sm font-medium text-slate-700 mb-2">
                  CVV
                </Label>
                <Input
                  id="cvv"
                  type="text"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => onCardDetailsChange({ ...cardDetails, cvv: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
