'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GitCompare, 
  DollarSign,
  Clock,
  Star,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingDown,
  ArrowRight,
  Package,
  Calendar,
  Shield,
  Award,
  FileText,
  Building
} from 'lucide-react';

// Mock comparison data
const comparisonData = {
  rfqNo: 'RFQ-2024-001',
  itemName: 'Sulphur',
  quantity: 50,
  unit: 'MT',
  requiredDate: '2024-01-25',
  quotations: [
    {
      id: 'QT-2024-001',
      vendor: 'Krishna Sugars Ltd',
      vendorId: 'V001',
      unitPrice: 2500,
      totalPrice: 125000,
      deliveryDays: 7,
      paymentTerms: 'Net 30',
      deliveryTerms: 'FOB',
      rating: 4.8,
      qualityScore: 95,
      onTimeDelivery: 98,
      previousOrders: 145,
      warranty: '6 months',
      technicalCompliance: true,
      certifications: ['ISO 9001', 'ISO 14001'],
      selected: false
    },
    {
      id: 'QT-2024-002',
      vendor: 'Bharat Chemicals',
      vendorId: 'V002',
      unitPrice: 2400,
      totalPrice: 120000,
      deliveryDays: 10,
      paymentTerms: 'Net 45',
      deliveryTerms: 'CIF',
      rating: 4.5,
      qualityScore: 92,
      onTimeDelivery: 94,
      previousOrders: 89,
      warranty: '3 months',
      technicalCompliance: true,
      certifications: ['ISO 9001'],
      selected: false
    },
    {
      id: 'QT-2024-003',
      vendor: 'Supreme Chemicals Pvt Ltd',
      vendorId: 'V004',
      unitPrice: 2600,
      totalPrice: 130000,
      deliveryDays: 5,
      paymentTerms: 'Net 15',
      deliveryTerms: 'Ex Works',
      rating: 4.6,
      qualityScore: 93,
      onTimeDelivery: 96,
      previousOrders: 67,
      warranty: '12 months',
      technicalCompliance: true,
      certifications: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
      selected: false
    }
  ]
};

// Scoring weights
const weights = {
  price: 40,
  delivery: 20,
  quality: 20,
  vendor: 20
};

export default function ComparisonPage() {
  const [selectedQuote, setSelectedQuote] = useState<string>('');
  const [activeTab, setActiveTab] = useState('comparison');

  // Calculate scores
  const calculateScores = () => {
    const minPrice = Math.min(...comparisonData.quotations.map(q => q.unitPrice));
    const minDelivery = Math.min(...comparisonData.quotations.map(q => q.deliveryDays));
    
    return comparisonData.quotations.map(quote => {
      // Price score (lower is better)
      const priceScore = (minPrice / quote.unitPrice) * 100;
      
      // Delivery score (faster is better)
      const deliveryScore = (minDelivery / quote.deliveryDays) * 100;
      
      // Quality score (already in percentage)
      const qualityScore = quote.qualityScore;
      
      // Vendor score (based on rating and on-time delivery)
      const vendorScore = (quote.rating / 5) * 50 + (quote.onTimeDelivery / 100) * 50;
      
      // Weighted total
      const totalScore = (
        (priceScore * weights.price / 100) +
        (deliveryScore * weights.delivery / 100) +
        (qualityScore * weights.quality / 100) +
        (vendorScore * weights.vendor / 100)
      );
      
      return {
        ...quote,
        scores: {
          price: priceScore,
          delivery: deliveryScore,
          quality: qualityScore,
          vendor: vendorScore,
          total: totalScore
        }
      };
    });
  };

  const scoredQuotations = calculateScores();
  const bestQuote = scoredQuotations.reduce((prev, current) => 
    prev.scores.total > current.scores.total ? prev : current
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quote Comparison</h1>
            <p className="text-gray-600 mt-1">Compare and select the best vendor quotation</p>
          </div>
          <Button 
            disabled={!selectedQuote}
            onClick={() => console.log('Proceed with', selectedQuote)}
          >
            Proceed to Approval
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* RFQ Summary */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-500">RFQ Number</p>
                <p className="font-medium">{comparisonData.rfqNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Item</p>
                <p className="font-medium">{comparisonData.itemName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="font-medium">{comparisonData.quantity} {comparisonData.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Required Date</p>
                <p className="font-medium">{comparisonData.requiredDate}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-600">
              {comparisonData.quotations.length} Quotations
            </Badge>
          </div>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent mb-6">
            <TabsTrigger 
              value="comparison" 
              className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
            >
              Side-by-Side Comparison
            </TabsTrigger>
            <TabsTrigger 
              value="scoring" 
              className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
            >
              Scoring Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="detailed" 
              className="data-[state=active]:border-b-2 rounded-none px-6 py-3"
            >
              Detailed View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scoredQuotations.map((quote, index) => (
                <Card 
                  key={quote.id} 
                  className={`relative ${quote.id === bestQuote.id ? 'ring-2 ring-green-500' : ''}`}
                >
                  {quote.id === bestQuote.id && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-green-500">
                        <Award className="w-3 h-3 mr-1" />
                        Best Overall
                      </Badge>
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Vendor Header */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg">{quote.vendor}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm ml-1">{quote.rating}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{quote.previousOrders} orders</span>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Unit Price</span>
                        <span className="font-semibold">₹{quote.unitPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Total Price</span>
                        <span className="font-bold text-lg">₹{quote.totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Delivery</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{quote.deliveryDays} days</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Payment</span>
                        <span className="text-sm">{quote.paymentTerms}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Warranty</span>
                        <span className="text-sm">{quote.warranty}</span>
                      </div>
                    </div>

                    {/* Quality Indicators */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Quality Score</span>
                          <span className={getScoreColor(quote.qualityScore)}>
                            {quote.qualityScore}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">On-time Delivery</span>
                          <span className={getScoreColor(quote.onTimeDelivery)}>
                            {quote.onTimeDelivery}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-2">Certifications</p>
                      <div className="flex flex-wrap gap-1">
                        {quote.certifications.map((cert, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Overall Score */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Overall Score</span>
                        <span className={`text-2xl font-bold ${getScoreColor(quote.scores.total)}`}>
                          {quote.scores.total.toFixed(1)}
                        </span>
                      </div>
                      <Progress value={quote.scores.total} className="mt-2" />
                    </div>

                    {/* Selection */}
                    <div className="mt-4">
                      <RadioGroup value={selectedQuote} onValueChange={setSelectedQuote}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={quote.id} id={quote.id} />
                          <Label htmlFor={quote.id} className="cursor-pointer">
                            Select this quotation
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scoring" className="mt-0">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Scoring Analysis</h3>
              
              {/* Scoring Weights */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Scoring Weights</p>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>Price: {weights.price}%</div>
                  <div>Delivery: {weights.delivery}%</div>
                  <div>Quality: {weights.quality}%</div>
                  <div>Vendor: {weights.vendor}%</div>
                </div>
              </div>

              {/* Detailed Scores */}
              <div className="space-y-4">
                {scoredQuotations.map((quote) => (
                  <Card key={quote.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{quote.vendor}</h4>
                      <Badge variant={quote.id === bestQuote.id ? 'default' : 'outline'}>
                        Total: {quote.scores.total.toFixed(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Price Score</p>
                        <div className="flex items-center gap-2">
                          <Progress value={quote.scores.price} className="flex-1" />
                          <span className="text-sm font-medium">{quote.scores.price.toFixed(0)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Delivery Score</p>
                        <div className="flex items-center gap-2">
                          <Progress value={quote.scores.delivery} className="flex-1" />
                          <span className="text-sm font-medium">{quote.scores.delivery.toFixed(0)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Quality Score</p>
                        <div className="flex items-center gap-2">
                          <Progress value={quote.scores.quality} className="flex-1" />
                          <span className="text-sm font-medium">{quote.scores.quality.toFixed(0)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Vendor Score</p>
                        <div className="flex items-center gap-2">
                          <Progress value={quote.scores.vendor} className="flex-1" />
                          <span className="text-sm font-medium">{quote.scores.vendor.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="detailed" className="mt-0">
            <div className="space-y-6">
              {scoredQuotations.map((quote) => (
                <Card key={quote.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{quote.vendor}</h3>
                      <p className="text-sm text-gray-500">Quote ID: {quote.id}</p>
                    </div>
                    {quote.id === bestQuote.id && (
                      <Badge className="bg-green-500">
                        <Award className="w-3 h-3 mr-1" />
                        Best Overall
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Commercial Terms */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Commercial Terms
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Unit Price:</span>
                          <span className="font-medium">₹{quote.unitPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Price:</span>
                          <span className="font-medium">₹{quote.totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Terms:</span>
                          <span>{quote.paymentTerms}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery Terms:</span>
                          <span>{quote.deliveryTerms}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery & Quality */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Delivery & Quality
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery Time:</span>
                          <span className="font-medium">{quote.deliveryDays} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Quality Score:</span>
                          <span className={getScoreColor(quote.qualityScore)}>
                            {quote.qualityScore}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">On-time Delivery:</span>
                          <span className={getScoreColor(quote.onTimeDelivery)}>
                            {quote.onTimeDelivery}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Warranty:</span>
                          <span>{quote.warranty}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vendor Info */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Vendor Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Rating:</span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="ml-1">{quote.rating}</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Previous Orders:</span>
                          <span>{quote.previousOrders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Technical Compliance:</span>
                          <span>
                            {quote.technicalCompliance ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Certifications:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {quote.certifications.map((cert, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}