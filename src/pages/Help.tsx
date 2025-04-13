import React from 'react';
import PageTemplate from './PageTemplate';
import { Search, HelpCircle, BookOpen, MessageSquare, FileText, ExternalLink } from 'lucide-react';

const Help = () => {
  // Sample FAQ data
  const faqs = [
    {
      question: 'How do I add a new bank account?',
      answer: 'To add a new bank account, go to My Wallet and click on the "Add New" button. Follow the instructions to securely link your account.'
    },
    {
      question: 'Is my financial data secure?',
      answer: 'Yes, we use bank-level encryption to protect your data. We never store your bank credentials and use secure APIs to connect to financial institutions.'
    },
    {
      question: 'How do I split bills with friends?',
      answer: 'Go to the Split Bills section, create a group, add your friends, and then add expenses to be split. Everyone in the group will be notified of their share.'
    },
    {
      question: 'Can I export my transaction history?',
      answer: 'Yes, you can export your transaction history in CSV or PDF format from the Transactions page by clicking on the Export button.'
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription from the Settings page under the Billing section. Your account will remain active until the end of your billing period.'
    },
  ];

  return (
    <PageTemplate title="Help Center">
      <div className="space-y-6">
        {/* Search section */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <h2 className="text-xl font-medium mb-4 text-center">How can we help you today?</h2>
          <div className="max-w-lg mx-auto relative">
            <input
              type="text"
              placeholder="Search for help topics..."
              className="w-full px-4 py-3 pl-10 rounded-md border border-finhive-border focus:outline-none focus:ring-2 focus:ring-finhive-primary/50"
            />
            <Search className="absolute left-3 top-3.5 text-finhive-muted" size={18} />
          </div>
        </div>

        {/* Quick help categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg border border-finhive-border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-finhive-accent/30 flex items-center justify-center mb-4">
              <BookOpen className="text-finhive-primary" size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">User Guide</h3>
            <p className="text-finhive-muted mb-4">Step-by-step guides to help you make the most of FinHive</p>
            <button className="text-finhive-primary font-medium hover:text-finhive-accent transition-colors flex items-center gap-1">
              <span>View guides</span>
              <ExternalLink size={16} />
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-finhive-border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-finhive-accent/30 flex items-center justify-center mb-4">
              <MessageSquare className="text-finhive-primary" size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">Contact Support</h3>
            <p className="text-finhive-muted mb-4">Get in touch with our customer support team</p>
            <button className="text-finhive-primary font-medium hover:text-finhive-accent transition-colors flex items-center gap-1">
              <span>Contact us</span>
              <ExternalLink size={16} />
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-finhive-border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-finhive-accent/30 flex items-center justify-center mb-4">
              <FileText className="text-finhive-primary" size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">Documentation</h3>
            <p className="text-finhive-muted mb-4">Detailed documentation about all FinHive features</p>
            <button className="text-finhive-primary font-medium hover:text-finhive-accent transition-colors flex items-center gap-1">
              <span>Read docs</span>
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="text-finhive-primary" size={24} />
            <h2 className="text-xl font-medium">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group border border-finhive-border rounded-lg overflow-hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                  <span className="font-medium">{faq.question}</span>
                  <span className="transition-transform group-open:rotate-180">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <div className="p-4 pt-0 text-finhive-muted">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <button className="px-4 py-2 text-finhive-primary font-medium">
              View all FAQs
            </button>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white p-6 rounded-lg border border-finhive-border text-center">
          <h2 className="text-lg font-medium mb-2">Still need help?</h2>
          <p className="text-finhive-muted mb-4">Our support team is available 24/7 to assist you</p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button className="px-6 py-3 bg-finhive-primary text-white rounded-md">
              Chat with Support
            </button>
            <button className="px-6 py-3 border border-finhive-border rounded-md hover:bg-gray-50 transition-colors">
              Email Support
            </button>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default Help;
