
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import FinHiveLogo from '@/components/FinHiveLogo';
import { ArrowRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#f8f9ff] overflow-hidden">
      {/* Header Navigation */}
      <header className="container mx-auto px-4 py-3 flex flex-col items-center justify-center">
        <FinHiveLogo size="md" className="mb-3" />
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#hero" className="text-gray-700 hover:text-finhive-primary transition-colors">Home</a>
          <a href="#features" className="text-gray-700 hover:text-finhive-primary transition-colors">Features</a>
          <a href="#pricing" className="text-gray-700 hover:text-finhive-primary transition-colors">Pricing</a>
          <a href="#testimonials" className="text-gray-700 hover:text-finhive-primary transition-colors">Testimonials</a>
          <a href="#contact" className="text-gray-700 hover:text-finhive-primary transition-colors">Contact</a>
        </nav>
      </header>
      
      {/* Hero Section */}
      <section id="hero" className="container mx-auto px-4 pt-0 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 max-w-2xl animate-fade-in" style={{animationDelay: '0.1s'}}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Improve Your Money <br />
              Management with <span className="text-finhive-primary">FinHive</span>
            </h1>
            
            <p className="text-gray-600 text-lg mb-8 max-w-lg">
              Simplify your business's financial management with our easy-to-use, scalable SaaS platform. Built for U.S. companies, our tools make complex processes simple.
            </p>
            
            <Link to="/auth">
              <Button size="lg" className="text-white font-medium flex items-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="relative">
              {/* Background gradient circle */}
              <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 rounded-full blur-3xl opacity-70"></div>
              
              {/* Dashboard Mockup */}
              <div className="relative z-10 grid grid-cols-2 gap-4 animate-float">
                <div className="col-span-2 bg-white rounded-xl shadow-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-sm font-medium">Activity manager</h3>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">⋮</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">+</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4 text-sm">
                    <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 flex items-center">
                      <span className="text-gray-500">🔍 Search in activities...</span>
                    </div>
                    <div className="ml-2 px-3 py-1 bg-blue-50 rounded-lg flex items-center">
                      <span className="text-blue-700 text-xs">Team</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="mb-2">
                      <span className="text-2xl font-semibold text-gray-800">$ 43.20</span>
                      <span className="text-xs text-gray-500 ml-1">USD</span>
                    </div>
                    
                    <div className="h-24 flex items-end">
                      {[...Array(12)].map((_, i) => (
                        <div 
                          key={`bar-${i}`} 
                          className="w-full bg-finhive-primary/80 mx-0.5 rounded-t-sm"
                          style={{ height: `${Math.random() * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                        <span className="text-gray-600">⏱️</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">13 Days</h4>
                        <p className="text-xs text-gray-500">109 hours, 23 minutes</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {[...Array(15)].map((_, i) => (
                      <div 
                        key={`dot-${i}`} 
                        className={`w-3 h-3 rounded-full ${
                          i % 4 === 0 ? 'bg-finhive-primary' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-800">Weekly</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">▼</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="grid grid-cols-6 gap-1">
                        {[...Array(42)].map((_, i) => (
                          <div 
                            key={`activity-${i}`} 
                            className={`w-full aspect-square rounded-sm ${
                              Math.random() > 0.7 ? 'bg-finhive-primary/80' : 
                              Math.random() > 0.5 ? 'bg-finhive-primary/50' : 'bg-gray-100'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-xs text-gray-500">Total Income</p>
                        <p className="text-xl font-bold">$ 23,194.80</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in" style={{animationDelay: '0.5s'}}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Unlock Premium Benefits with Our Advanced Features.
              </h2>
              
              <p className="text-gray-600 mb-8">
                Simplify your business's financial management with our easy-to-use, scalable SaaS platform. Built for U.S. companies, our tools make complex processes simple.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">AI-Powered Assistance</h3>
                  <p className="text-gray-600 text-sm">
                    Access a tailored AI assistant that adapts to your needs, delivering personalized insights.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">Exclusive Features</h3>
                  <p className="text-gray-600 text-sm">
                    Unlock advanced features like enhanced analytics, deeper customization, and priority support.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">Growth Rate</h3>
                  <p className="text-gray-600 text-sm">
                    The growth rate is a crucial metric in financial management that measures the increase in an organization's revenues.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="animate-fade-in" style={{animationDelay: '0.7s'}}>
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Main Stocks</h3>
                      <p className="text-sm text-gray-500">Extended & Limited</p>
                    </div>
                    <div className="text-green-500 font-medium text-sm">
                      +9.3%
                    </div>
                  </div>
                  
                  <div className="h-32 w-full mb-4">
                    <svg viewBox="0 0 400 100" className="w-full h-full">
                      <path 
                        d="M0,50 C50,30 100,60 150,40 C200,20 250,70 300,50 C350,30 400,45 400,50" 
                        fill="none" 
                        stroke="#FFD8CC" 
                        strokeWidth="8" 
                      />
                      <path 
                        d="M0,50 C50,30 100,60 150,40 C200,20 250,70 300,50 C350,30 400,45 400,50" 
                        fill="none" 
                        stroke="#FF6634" 
                        strokeWidth="2" 
                      />
                    </svg>
                  </div>
                  
                  <div className="text-xl font-bold">
                    $ 16,073.49
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose the plan that works best for your business needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-transform hover:scale-105">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Basic</h3>
                <p className="text-gray-500 mb-4">For small businesses</p>
                <div className="text-3xl font-bold mb-4">$29<span className="text-gray-400 text-sm font-normal">/month</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Basic financial tracking
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Up to 5 users
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Standard reports
                  </li>
                </ul>
                <Link to="/auth">
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-finhive-primary transition-transform hover:scale-105 transform translate-y-[-8px]">
              <div className="bg-finhive-primary text-white text-center py-2 text-sm font-medium">MOST POPULAR</div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Professional</h3>
                <p className="text-gray-500 mb-4">For growing companies</p>
                <div className="text-3xl font-bold mb-4">$79<span className="text-gray-400 text-sm font-normal">/month</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Advanced financial tools
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Up to 20 users
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Custom reports
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> API access
                  </li>
                </ul>
                <Link to="/auth">
                  <Button className="w-full bg-finhive-primary text-white">Get Started</Button>
                </Link>
              </div>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transition-transform hover:scale-105">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <p className="text-gray-500 mb-4">For large organizations</p>
                <div className="text-3xl font-bold mb-4">$199<span className="text-gray-400 text-sm font-normal">/month</span></div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Full financial suite
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Unlimited users
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span> Dedicated support
                  </li>
                </ul>
                <Link to="/auth">
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Trusted by businesses of all sizes</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">CFO, TechStart Inc.</p>
                </div>
              </div>
              <p className="text-gray-600">"FinHive has transformed how we manage our finances. The intuitive interface and powerful reporting tools have saved us countless hours."</p>
              <div className="flex text-yellow-400 mt-3">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <p className="text-sm text-gray-500">Owner, Chen Enterprises</p>
                </div>
              </div>
              <p className="text-gray-600">"As a small business owner, I needed something simple yet powerful. FinHive delivers exactly that, with excellent customer support."</p>
              <div className="flex text-yellow-400 mt-3">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Amanda Rodriguez</h4>
                  <p className="text-sm text-gray-500">Director, Global Finance</p>
                </div>
              </div>
              <p className="text-gray-600">"The enterprise features have been game-changing for our multinational operations. We've seen a 30% increase in efficiency."</p>
              <div className="flex text-yellow-400 mt-3">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-8">Contact us today to learn how FinHive can transform your financial management</p>
            <Link to="/auth">
              <Button size="lg" className="bg-finhive-primary text-white">Start Your Free Trial</Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <FinHiveLogo size="md" className="mb-6 md:mb-0 filter brightness-0 invert" />
            
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-gray-400 text-sm text-center">
              © 2025 FinHive. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
