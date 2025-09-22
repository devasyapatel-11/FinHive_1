// Auto-categorization service using pattern matching and ML-like logic

export interface TransactionData {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date?: string;
  account_id?: string;
}

export interface CategorizationResult {
  category: string;
  confidence: number; // 0-100
  reasoning: string;
  alternatives: Array<{ category: string; confidence: number }>;
}

export interface CategoryPattern {
  category: string;
  keywords: string[];
  amountRanges?: { min: number; max: number }[];
  patterns: RegExp[];
  merchantPatterns: string[];
  priority: number; // Higher = more specific, checked first
}

// Comprehensive categorization patterns
const CATEGORIZATION_PATTERNS: CategoryPattern[] = [
  // Food & Dining - High priority
  {
    category: 'Food',
    priority: 10,
    keywords: ['restaurant', 'cafe', 'food', 'lunch', 'dinner', 'pizza', 'burger', 'coffee', 'tea', 'snack', 'meal', 'eat', 'dine'],
    patterns: [
      /\b(restaurant|cafe|coffee|starbucks|dominos|mcdonalds|kfc|burger|pizza|food|pizza|subway|taco|sandwich|salad|soup|breakfast|lunch|dinner|snack|meal|bite|bite.to|swiggy|zomato|ubereats|doordash)\b/i,
      /\b(dominos|kfc|mcd|pizza hut|burger king|wendys|chipotle|panera|tgi fridays|olive garden|red lobster)\b/i
    ],
    merchantPatterns: ['swiggy', 'zomato', 'dominos', 'kfc', 'mcdonalds', 'starbucks', 'ccd', 'barista', 'cafe coffee day'],
    amountRanges: [
      { min: 50, max: 2000 }, // Typical food expenses
      { min: 10, max: 500 }  // Coffee/snacks
    ]
  },

  // Transport - High priority
  {
    category: 'Transport',
    priority: 9,
    keywords: ['uber', 'ola', 'taxi', 'cab', 'bus', 'train', 'metro', 'fuel', 'petrol', 'diesel', 'auto', 'ride', 'travel', 'commute'],
    patterns: [
      /\b(uber|ola|rapido|meru|tabcab|taxi|cab|bus|train|metro|auto|rickshaw|ride|fuel|petrol|diesel|gas|bpcl|hpcl|iocl)\b/i,
      /\b(irctc|indian railways|railway|dmrc|delhi metro)\b/i
    ],
    merchantPatterns: ['uber', 'ola', 'rapido', 'redbus', 'makemytrip', 'irctc', 'dmrc'],
    amountRanges: [
      { min: 20, max: 1000 }, // Ride fares
      { min: 200, max: 3000 } // Fuel
    ]
  },

  // Shopping - High priority
  {
    category: 'Shopping',
    priority: 8,
    keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'bigbasket', 'dmart', 'reliance', 'shopping', 'store', 'mall', 'market', 'buy'],
    patterns: [
      /\b(amazon|flipkart|myntra|ajio|nykaa|purplle|bigbasket|grofers|blinkit|dmart|reliance|more|big bazaar|shop|store|mall|market)\b/i,
      /\b(clothing|clothes|shirt|pants|shoes|dress|jewelry|watch|bag|accessories)\b/i
    ],
    merchantPatterns: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'bigbasket', 'dmart'],
    amountRanges: [
      { min: 100, max: 50000 } // Wide range for shopping
    ]
  },

  // Entertainment - Medium priority
  {
    category: 'Entertainment',
    priority: 7,
    keywords: ['movie', 'cinema', 'theatre', 'netflix', 'prime', 'hotstar', 'spotify', 'music', 'game', 'party', 'event', 'concert'],
    patterns: [
      /\b(netflix|prime|hotstar|altbalaji|zee5|sonyliv|mx player|amazon prime|spotify|gaana|wynk|jiosaavn|bookmyshow|pvr|inox|movie|cinema|theatre)\b/i,
      /\b(game|gaming|playstation|xbox|nintendo|steam|ubisoft|ea sports)\b/i
    ],
    merchantPatterns: ['netflix', 'prime', 'hotstar', 'spotify', 'bookmyshow', 'pvr', 'inox'],
    amountRanges: [
      { min: 50, max: 2000 } // Subscription and entertainment
    ]
  },

  // Utilities - Medium priority
  {
    category: 'Utilities',
    priority: 6,
    keywords: ['electricity', 'water', 'gas', 'internet', 'phone', 'mobile', 'broadband', 'wifi', 'bill', 'payment'],
    patterns: [
      /\b(electricity|water|gas|internet|broadband|wifi|mobile|phone|airtel|jio|vodafone|bsnl|bihar|maharashtra|kerala|karnataka|andhra|telangana)\b/i,
      /\b(bill|payment|recharge|topup|plan)\b/i
    ],
    merchantPatterns: ['airtel', 'jio', 'vodafone', 'bsnl', 'tatasky', 'reliance jio'],
    amountRanges: [
      { min: 100, max: 5000 } // Utility bills
    ]
  },

  // Healthcare - Medium priority
  {
    category: 'Healthcare',
    priority: 5,
    keywords: ['hospital', 'doctor', 'medicine', 'pharmacy', 'medical', 'clinic', 'health', 'appointment', 'treatment'],
    patterns: [
      /\b(hospital|clinic|doctor|medicine|pharmacy|medical|health|apollo|max|fortis|aiims|medanta|diagnostic|lab|test|appointment|treatment)\b/i,
      /\b(apollo|max healthcare|fortis|medanta|narayana|manipal|aster|kims)\b/i
    ],
    merchantPatterns: ['apollo', 'max', 'fortis', 'medanta', '1mg', 'pharmeasy', 'netmeds'],
    amountRanges: [
      { min: 50, max: 50000 } // Healthcare expenses
    ]
  },

  // Education - Medium priority
  {
    category: 'Education',
    priority: 4,
    keywords: ['course', 'class', 'school', 'college', 'university', 'book', 'study', 'exam', 'fee', 'tuition'],
    patterns: [
      /\b(course|class|school|college|university|book|study|exam|fee|tuition|coaching|byjus|unacademy|vedantu|testbook)\b/i,
      /\b(iit|nit|du|jnu|ipu|bits|vit|manipal|symbiosis|nmims)\b/i
    ],
    merchantPatterns: ['byjus', 'unacademy', 'vedantu', 'testbook', 'coursera', 'udemy'],
    amountRanges: [
      { min: 100, max: 100000 } // Education expenses
    ]
  },

  // Salary/Income - High priority for income
  {
    category: 'Salary',
    priority: 10,
    keywords: ['salary', 'payroll', 'wage', 'income', 'stipend', 'freelance', 'consulting'],
    patterns: [
      /\b(salary|payroll|wage|stipend|emolument|compensation|remuneration|income|earning)\b/i,
      /\b(freelance|consulting|contract|project|assignment)\b/i
    ],
    merchantPatterns: [],
    amountRanges: [
      { min: 10000, max: 500000 } // Typical salary ranges
    ]
  },

  // Rent - High priority
  {
    category: 'Rent',
    priority: 9,
    keywords: ['rent', 'housing', 'apartment', 'flat', 'accommodation', 'lease'],
    patterns: [
      /\b(rent|housing|apartment|flat|accommodation|lease|maintenance|security deposit)\b/i
    ],
    merchantPatterns: [],
    amountRanges: [
      { min: 5000, max: 100000 } // Rent amounts
    ]
  },

  // Investment - Medium priority
  {
    category: 'Investment',
    priority: 6,
    keywords: ['mutual fund', 'sip', 'stock', 'equity', 'bond', 'fd', 'fixed deposit', 'ppf', 'nps', 'insurance'],
    patterns: [
      /\b(mutual.fund|sip|stock|equity|bond|fd|fixed.deposit|ppf|nps|insurance|investment|portfolio)\b/i,
      /\b(icici.pru|hdfc.life|sbi.life|lic|max.life|tata.aia|aditya.birla)\b/i
    ],
    merchantPatterns: ['zerodha', 'upstox', 'angel one', 'groww', 'paytm money'],
    amountRanges: [
      { min: 100, max: 100000 } // Investment amounts
    ]
  },

  // Travel - Medium priority
  {
    category: 'Travel',
    priority: 5,
    keywords: ['hotel', 'flight', 'booking', 'trip', 'vacation', 'holiday', 'tour', 'resort'],
    patterns: [
      /\b(hotel|flight|booking|trip|vacation|holiday|tour|resort|airline|indigo|air india|spicejet|vistara|goair)\b/i,
      /\b(makemytrip|goibibo|booking.com|agoda|oyorooms|treebo|fabhotels)\b/i
    ],
    merchantPatterns: ['makemytrip', 'goibibo', 'booking.com', 'agoda', 'cleartrip'],
    amountRanges: [
      { min: 500, max: 50000 } // Travel expenses
    ]
  },

  // EMI/Loan - Medium priority
  {
    category: 'EMI',
    priority: 4,
    keywords: ['emi', 'loan', 'installment', 'repayment', 'credit card', 'debt'],
    patterns: [
      /\b(emi|loan|installment|repayment|credit.card|debt|principal|interest|outstanding)\b/i
    ],
    merchantPatterns: [],
    amountRanges: [
      { min: 500, max: 50000 } // EMI amounts
    ]
  }
];

class AutoCategorizationEngine {
  async categorizeTransaction(transaction: TransactionData): Promise<CategorizationResult> {
    const { description, amount, type } = transaction;

    // Normalize description for matching
    const normalizedDesc = description.toLowerCase().trim();

    // Filter patterns by transaction type
    let relevantPatterns = CATEGORIZATION_PATTERNS.filter(pattern => {
      // For income transactions, only consider income-related categories
      if (type === 'income') {
        return ['Salary', 'Freelance', 'Investment', 'Other Income'].includes(pattern.category);
      }
      return true;
    });

    // Sort by priority (higher priority first)
    relevantPatterns.sort((a, b) => b.priority - a.priority);

    const matches: Array<{ pattern: CategoryPattern; score: number; reasoning: string }> = [];

    for (const pattern of relevantPatterns) {
      let score = 0;
      let reasoning = '';

      // Check keyword matches
      const keywordMatches = pattern.keywords.filter(keyword =>
        normalizedDesc.includes(keyword.toLowerCase())
      );
      if (keywordMatches.length > 0) {
        score += keywordMatches.length * 20;
        reasoning += `Keywords: ${keywordMatches.join(', ')}. `;
      }

      // Check regex patterns
      for (const regexPattern of pattern.patterns) {
        if (regexPattern.test(normalizedDesc)) {
          score += 30;
          reasoning += `Pattern match: ${regexPattern.source}. `;
          break; // One pattern match is enough
        }
      }

      // Check merchant patterns
      const merchantMatch = pattern.merchantPatterns.some(merchant =>
        normalizedDesc.includes(merchant.toLowerCase())
      );
      if (merchantMatch) {
        score += 25;
        reasoning += 'Merchant identified. ';
      }

      // Check amount ranges
      if (pattern.amountRanges) {
        const inRange = pattern.amountRanges.some(range =>
          amount >= range.min && amount <= range.max
        );
        if (inRange) {
          score += 15;
          reasoning += `Amount in expected range. `;
        }
      }

      // Context-based adjustments
      if (type === 'income' && amount > 10000) {
        // High income amounts are likely salary
        if (pattern.category === 'Salary') score += 20;
      }

      if (amount > 10000 && type === 'expense') {
        // High expense amounts might be rent or major purchases
        if (['Rent', 'Shopping', 'Travel'].includes(pattern.category)) {
          score += 10;
        }
      }

      if (score > 0) {
        matches.push({ pattern, score, reasoning: reasoning.trim() });
      }
    }

    // Sort matches by score
    matches.sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
      return {
        category: 'Uncategorized',
        confidence: 0,
        reasoning: 'No matching patterns found',
        alternatives: []
      };
    }

    const bestMatch = matches[0];
    const confidence = Math.min(100, bestMatch.score);

    // Get alternatives (next 2 matches with decent scores)
    const alternatives = matches.slice(1, 4)
      .filter(match => match.score > bestMatch.score * 0.3)
      .map(match => ({
        category: match.pattern.category,
        confidence: Math.min(100, match.score)
      }));

    return {
      category: bestMatch.pattern.category,
      confidence,
      reasoning: bestMatch.reasoning || 'Pattern matching',
      alternatives
    };
  }

  async categorizeTransactions(transactions: TransactionData[]): Promise<Array<TransactionData & CategorizationResult>> {
    const results = await Promise.all(
      transactions.map(async (transaction) => {
        const categorization = await this.categorizeTransaction(transaction);
        return {
          ...transaction,
          ...categorization
        };
      })
    );

    return results;
  }

  // Learning function - could be used to improve categorization over time
  async learnFromCorrection(originalCategory: string, correctedCategory: string, transaction: TransactionData) {
    // In a real implementation, this would update patterns or train a model
    console.log(`Learning: ${originalCategory} -> ${correctedCategory} for "${transaction.description}"`);
  }

  // Get category suggestions for a partial description
  async getCategorySuggestions(partialDescription: string, transactionType: 'income' | 'expense'): Promise<string[]> {
    const normalizedDesc = partialDescription.toLowerCase();

    let relevantPatterns = CATEGORIZATION_PATTERNS.filter(pattern => {
      if (transactionType === 'income') {
        return ['Salary', 'Freelance', 'Investment', 'Other Income'].includes(pattern.category);
      }
      return true;
    });

    const suggestions: string[] = [];

    for (const pattern of relevantPatterns) {
      // Check if any keywords match
      const keywordMatch = pattern.keywords.some(keyword =>
        normalizedDesc.includes(keyword.toLowerCase())
      );

      // Check regex patterns
      const patternMatch = pattern.patterns.some(regex =>
        regex.test(normalizedDesc)
      );

      if (keywordMatch || patternMatch) {
        if (!suggestions.includes(pattern.category)) {
          suggestions.push(pattern.category);
        }
      }
    }

    // Limit to top 5 suggestions
    return suggestions.slice(0, 5);
  }

  // Validate categorization accuracy (for analytics)
  async validateCategorization(transactions: Array<TransactionData & { actualCategory: string }>) {
    let correct = 0;
    let total = 0;

    for (const transaction of transactions) {
      const result = await this.categorizeTransaction(transaction);
      if (result.category === transaction.actualCategory) {
        correct++;
      }
      total++;
    }

    return {
      accuracy: total > 0 ? (correct / total) * 100 : 0,
      correct,
      total
    };
  }
}

// Export singleton instance
export const autoCategorizationEngine = new AutoCategorizationEngine();
export default autoCategorizationEngine;
