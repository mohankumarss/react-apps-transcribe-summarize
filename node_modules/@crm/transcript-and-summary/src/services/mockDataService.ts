/**
 * Mock Data Service for Transcript and Summary Management
 * 
 * Provides realistic mock data for development and testing
 */

export interface CallRecord {
  id: string;
  dateOfCall: string;
  timeOfCall: string;
  callLength: string;
  name: string;
  inboundOutbound: 'Inbound' | 'Outbound';
  phoneNumber: string;
  callId: string;
  callType: string;
  userName: string;
  callDirection: 'Inbound' | 'Outbound';
  transcript: string;
  summary: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Sample names for realistic data
const SAMPLE_NAMES = [
  'Mike Harris', 'Nina King', 'Oscar Lewis', 'Sarah Johnson', 'David Chen',
  'Emma Wilson', 'James Brown', 'Lisa Garcia', 'Robert Taylor', 'Maria Rodriguez',
  'John Smith', 'Jennifer Davis', 'Michael Johnson', 'Ashley Miller', 'Christopher Wilson',
  'Amanda Moore', 'Daniel Taylor', 'Jessica Anderson', 'Matthew Thomas', 'Emily Jackson',
  'Andrew White', 'Stephanie Harris', 'Joshua Martin', 'Melissa Thompson', 'Ryan Garcia',
  'Nicole Martinez', 'Kevin Robinson', 'Rachel Clark', 'Brandon Rodriguez', 'Lauren Lewis',
  'Tyler Lee', 'Samantha Walker', 'Justin Hall', 'Brittany Allen', 'Aaron Young',
  'Danielle Hernandez', 'Nathan King', 'Kayla Wright', 'Zachary Lopez', 'Megan Hill',
  'Caleb Scott', 'Alexis Green', 'Ian Adams', 'Victoria Baker', 'Sean Gonzalez',
  'Jasmine Nelson', 'Lucas Carter', 'Destiny Mitchell', 'Mason Perez', 'Sydney Roberts',
  'Alexander Thompson', 'Olivia Martinez', 'William Anderson', 'Sophia Garcia', 'Benjamin Clark',
  'Isabella Rodriguez', 'Jacob Lewis', 'Mia Walker', 'Ethan Hall', 'Charlotte Young',
  'Noah Allen', 'Amelia Hernandez', 'Liam King', 'Harper Wright', 'Oliver Lopez',
  'Evelyn Hill', 'Elijah Scott', 'Abigail Green', 'Lucas Adams', 'Emily Baker',
  'Mason Gonzalez', 'Elizabeth Nelson', 'Logan Carter', 'Sofia Mitchell', 'Jackson Perez',
  'Avery Roberts', 'Sebastian Thompson', 'Ella Martinez', 'Aiden Anderson', 'Scarlett Garcia',
  'Matthew Clark', 'Grace Rodriguez', 'Samuel Lewis', 'Chloe Walker', 'David Hall',
  'Victoria Young', 'Joseph Allen', 'Madison Hernandez', 'John King', 'Lily Wright'
];

// Sample call types
const CALL_TYPES = [
  'Customer Support', 'Sales Inquiry', 'Technical Support', 'Billing Question',
  'Product Demo', 'Follow-up Call', 'Complaint Resolution', 'Account Setup',
  'Renewal Discussion', 'Feature Request', 'Bug Report', 'Training Session',
  'Consultation', 'Order Status', 'Refund Request', 'Upgrade Inquiry',
  'Cancellation Request', 'Password Reset', 'Payment Issue', 'Service Outage',
  'Installation Help', 'Configuration Support', 'Data Migration', 'Security Inquiry',
  'Compliance Question', 'Integration Support', 'API Documentation', 'Troubleshooting',
  'Performance Issue', 'Maintenance Window', 'Emergency Support', 'Escalation Call'
];

// Call statuses
const CALL_STATUSES = [
  'Completed', 'Missed', 'Voicemail', 'Busy', 'No Answer', 'Transferred', 'Dropped'
];

// Sample notes for variety
const SAMPLE_NOTES = [
  'Customer was very satisfied with the resolution',
  'Follow-up required in 2 weeks',
  'Escalated to technical team for further investigation',
  'Customer requested callback tomorrow',
  'Issue resolved during call',
  'Sent additional documentation via email',
  'Customer needs training on new features',
  'Billing dispute resolved',
  'Account upgraded successfully',
  'Customer feedback: excellent service',
  'Technical issue requires development team review',
  'Customer expressed interest in additional services',
  ''  // Some calls have no notes
];

// Sample user names (agents)
const AGENT_NAMES = [
  'Agent Smith', 'Agent Johnson', 'Agent Williams', 'Agent Brown', 'Agent Jones',
  'Agent Garcia', 'Agent Miller', 'Agent Davis', 'Agent Rodriguez', 'Agent Martinez',
  'Agent Anderson', 'Agent Taylor', 'Agent Thomas', 'Agent Hernandez', 'Agent Moore'
];

// Sample transcripts
const SAMPLE_TRANSCRIPTS = [
  `Customer: Hi, I'm calling about my account. I need to update my payment method.
Agent: I'd be happy to help you with that. Can you please provide me with your account number?
Customer: Yes, it's ACC123456789.
Agent: Thank you. I can see your account here. What payment method would you like to update to?
Customer: I'd like to change from my old credit card to a new one ending in 4567.
Agent: Perfect. I've updated your payment method. The change will take effect immediately.
Customer: Great, thank you so much for your help!
Agent: You're welcome! Is there anything else I can assist you with today?
Customer: No, that's all. Have a great day!
Agent: You too, thank you for calling!`,

  `Customer: I'm having trouble logging into my account. It keeps saying my password is incorrect.
Agent: I'm sorry to hear you're having trouble. Let me help you reset your password.
Customer: That would be great, thank you.
Agent: Can you confirm the email address associated with your account?
Customer: Yes, it's john.doe@email.com
Agent: I've sent a password reset link to that email. Please check your inbox and spam folder.
Customer: I see it! I'll reset it now. Thank you so much.
Agent: You're welcome. The new password should work immediately once you set it.`,

  `Customer: I'm interested in upgrading my current plan. What options do you have?
Agent: I'd be happy to discuss our upgrade options with you. What features are you most interested in?
Customer: I need more storage space and better customer support.
Agent: Our Premium plan would be perfect for you. It includes 500GB storage and priority support.
Customer: That sounds good. What's the pricing?
Agent: The Premium plan is $29.99 per month. Would you like me to upgrade you today?
Customer: Yes, please go ahead with the upgrade.
Agent: Perfect! Your account has been upgraded and you'll see the new features within the next hour.`,

  `Customer: I received a charge on my card that I don't recognize. Can you help me understand what it's for?
Agent: Absolutely, I can help clarify that charge. Can you provide the amount and date of the transaction?
Customer: It was $49.99 on March 15th.
Agent: Let me look that up for you. I can see that charge was for your monthly subscription renewal.
Customer: Oh, I forgot about that. Is there a way to get a reminder before future charges?
Agent: Yes, I can enable email notifications for upcoming charges. Would you like me to set that up?
Customer: That would be perfect, thank you.
Agent: Done! You'll now receive an email 3 days before each charge.`
];

// Sample summaries
const SAMPLE_SUMMARIES = [
  'Customer called to update payment method. Successfully changed from old credit card to new card ending in 4567. Issue resolved.',
  'Customer experiencing login issues due to forgotten password. Password reset link sent to registered email. Customer able to access account.',
  'Sales call for plan upgrade. Customer interested in more storage and better support. Upgraded to Premium plan at $29.99/month.',
  'Billing inquiry about unrecognized charge. Clarified that charge was for monthly subscription renewal. Set up email notifications for future charges.',
  'Technical support call for software installation issues. Guided customer through installation process. Issue resolved successfully.',
  'Customer complaint about delayed delivery. Investigated shipping status and provided tracking information. Offered compensation for delay.',
  'Product demo call for enterprise features. Demonstrated key capabilities and answered questions. Customer interested in trial period.',
  'Account setup assistance for new customer. Helped configure account settings and explained key features. Customer onboarded successfully.'
];

/**
 * Generate a random phone number
 */
function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const exchange = Math.floor(Math.random() * 900) + 100;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `+44 ${areaCode} ${exchange}${number.toString().slice(0, 3)}`;
}

/**
 * Generate a random call duration in MM:SS format with varied lengths
 */
function generateCallDuration(): string {
  const rand = Math.random();
  let minutes: number;

  if (rand < 0.3) {
    // 30% short calls (1-5 minutes)
    minutes = Math.floor(Math.random() * 5) + 1;
  } else if (rand < 0.7) {
    // 40% medium calls (6-20 minutes)
    minutes = Math.floor(Math.random() * 15) + 6;
  } else {
    // 30% long calls (21-60 minutes)
    minutes = Math.floor(Math.random() * 40) + 21;
  }

  const seconds = Math.floor(Math.random() * 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Generate a random time in HH:MM format
 */
function generateTime(): string {
  const hour = Math.floor(Math.random() * 12) + 8; // 8 AM to 7 PM
  const minute = Math.floor(Math.random() * 60);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/**
 * Generate a random date within the last 6 months
 */
function generateRecentDate(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 180); // 6 months
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

/**
 * Generate a random call ID
 */
function generateCallId(): string {
  return `CALL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Generate mock call records
 */
export function generateMockCallRecords(count: number = 75): CallRecord[] {
  const records: CallRecord[] = [];

  for (let i = 0; i < count; i++) {
    const date = generateRecentDate();
    const rand = Math.random();

    // Determine call direction with some missed calls
    let direction: 'Inbound' | 'Outbound';
    let callStatus: string;

    if (rand < 0.5) {
      direction = 'Inbound';
      callStatus = rand < 0.05 ? 'Missed' : CALL_STATUSES[Math.floor(Math.random() * CALL_STATUSES.length)];
    } else {
      direction = 'Outbound';
      callStatus = rand < 0.02 ? 'No Answer' : CALL_STATUSES[Math.floor(Math.random() * CALL_STATUSES.length)];
    }

    const name = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
    const callType = CALL_TYPES[Math.floor(Math.random() * CALL_TYPES.length)];
    const agent = AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)];
    const transcript = SAMPLE_TRANSCRIPTS[Math.floor(Math.random() * SAMPLE_TRANSCRIPTS.length)];
    const summary = SAMPLE_SUMMARIES[Math.floor(Math.random() * SAMPLE_SUMMARIES.length)];
    const notes = ''; // Start with empty notes - users will add their own

    const record: CallRecord = {
      id: `call-${i + 1}`,
      dateOfCall: date.toISOString().split('T')[0], // YYYY-MM-DD format
      timeOfCall: generateTime(),
      callLength: callStatus === 'Missed' || callStatus === 'No Answer' ? '00:00' : generateCallDuration(),
      name,
      inboundOutbound: direction,
      phoneNumber: generatePhoneNumber(),
      callId: generateCallId(),
      callType,
      userName: agent,
      callDirection: direction,
      transcript: callStatus === 'Missed' || callStatus === 'No Answer' ? 'Call not connected' : transcript,
      summary: callStatus === 'Missed' || callStatus === 'No Answer' ? `${callStatus} call from ${name}` : summary,
      notes,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString()
    };

    records.push(record);
  }

  // Sort by date (most recent first)
  return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Simulate API delay
 */
export function simulateApiDelay(ms: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock API service for call records
 */
export class MockCallRecordsAPI {
  private static instance: MockCallRecordsAPI;
  private records: CallRecord[] = [];

  private constructor() {
    this.records = generateMockCallRecords(150); // Generate 150 records for better pagination testing
  }

  public static getInstance(): MockCallRecordsAPI {
    if (!MockCallRecordsAPI.instance) {
      MockCallRecordsAPI.instance = new MockCallRecordsAPI();
    }
    return MockCallRecordsAPI.instance;
  }

  /**
   * Get all call records with optional pagination
   */
  async getCallRecords(page: number = 1, pageSize: number = 20): Promise<{
    records: CallRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    await simulateApiDelay(800);

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRecords = this.records.slice(startIndex, endIndex);

    return {
      records: paginatedRecords,
      total: this.records.length,
      page,
      pageSize,
      totalPages: Math.ceil(this.records.length / pageSize)
    };
  }

  /**
   * Get a single call record by ID
   */
  async getCallRecord(id: string): Promise<CallRecord | null> {
    await simulateApiDelay(300);
    return this.records.find(record => record.id === id) || null;
  }

  /**
   * Update a call record
   */
  async updateCallRecord(id: string, updates: Partial<CallRecord>): Promise<CallRecord | null> {
    await simulateApiDelay(500);
    
    const index = this.records.findIndex(record => record.id === id);
    if (index === -1) return null;

    this.records[index] = {
      ...this.records[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.records[index];
  }

  /**
   * Search call records
   */
  async searchCallRecords(query: string): Promise<CallRecord[]> {
    await simulateApiDelay(600);
    
    const lowercaseQuery = query.toLowerCase();
    return this.records.filter(record =>
      record.name.toLowerCase().includes(lowercaseQuery) ||
      record.callType.toLowerCase().includes(lowercaseQuery) ||
      record.phoneNumber.includes(query) ||
      record.transcript.toLowerCase().includes(lowercaseQuery) ||
      record.summary.toLowerCase().includes(lowercaseQuery)
    );
  }
}
