#!/usr/bin/env node

/**
 * Test Script for 3-Agent Pipeline
 * 
 * Usage:
 *   node test-agents.mjs [message]
 * 
 * Examples:
 *   node test-agents.mjs "What does this dashboard show?"
 *   node test-agents.mjs "Are there any bottlenecks today?"
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const testQueries = [
  {
    name: 'Dashboard Overview',
    message: 'What does this dashboard show?',
    userRole: 'middle_management',
    language: 'English',
  },
  {
    name: 'Issue Detection',
    message: 'Are there any bottlenecks or performance issues today?',
    userRole: 'frontline_operations',
    language: 'English',
  },
  {
    name: 'Metric Inquiry',
    message: 'What is our current container throughput?',
    userRole: 'top_management',
    language: 'English',
  },
  {
    name: 'Terminal Comparison',
    message: 'Compare Tuas terminal performance to Busan',
    userRole: 'middle_management',
    language: 'English',
  },
];

async function testDetailedChat(query) {
  console.log('\n' + '='.repeat(80));
  console.log(`🧪 Testing: ${query.name}`);
  console.log('='.repeat(80));
  console.log(`📝 Query: "${query.message}"`);
  console.log(`👤 Role: ${query.userRole}`);
  console.log(`🌐 Language: ${query.language}`);
  console.log('\n⏳ Running 3-agent pipeline...\n');

  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}/api/chat-detailed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: query.message,
        userRole: query.userRole,
        language: query.language,
        dashboardData: {
          reportId: 'test-report',
          reportName: 'Weekly Operations Dashboard',
          currentMetrics: {
            services: 30,
            timeSavings: '15%',
            berthUtilization: '82%',
          },
          filters: {},
          visuals: [],
          lastUpdated: new Date().toISOString(),
        },
      }),
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      return;
    }

    const result = await response.json();

    console.log(`✅ Response received in ${duration}s\n`);

    console.log('💬 Chat Response:');
    console.log('─'.repeat(80));
    console.log(result.chatResponse);
    console.log('─'.repeat(80));

    if (result.keyInsights && result.keyInsights.length > 0) {
      console.log('\n💡 Key Insights:');
      result.keyInsights.forEach((insight, i) => {
        console.log(`  ${i + 1}. ${insight}`);
      });
    }

    if (result.nextSteps && result.nextSteps.length > 0) {
      console.log('\n🎯 Suggested Next Steps:');
      result.nextSteps.forEach((step, i) => {
        console.log(`  ${i + 1}. [${step.category}] ${step.action}`);
        console.log(`     → ${step.detail}`);
      });
    }

    if (result.frontendIntent && result.frontendIntent.action !== 'none') {
      console.log('\n🎨 Frontend Intent:');
      console.log(`  Action: ${result.frontendIntent.action}`);
      if (result.frontendIntent.parameters) {
        console.log(`  Parameters:`, result.frontendIntent.parameters);
      }
      if (result.frontendIntent.confidence) {
        console.log(`  Confidence: ${(result.frontendIntent.confidence * 100).toFixed(0)}%`);
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function runTests() {
  console.log('\n🚀 Porter AI - 3-Agent Pipeline Test Suite');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log(`📅 ${new Date().toLocaleString()}\n`);

  // Check if custom message provided
  const customMessage = process.argv[2];
  
  if (customMessage) {
    await testDetailedChat({
      name: 'Custom Query',
      message: customMessage,
      userRole: process.argv[3] || 'middle_management',
      language: process.argv[4] || 'English',
    });
  } else {
    // Run all test queries
    for (const query of testQueries) {
      await testDetailedChat(query);
      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('✅ All tests completed!\n');
}

// Health check first
async function healthCheck() {
  try {
    const response = await fetch(`${BASE_URL}/api/chat-detailed`);
    const data = await response.json();
    console.log('✅ API Health Check Passed');
    console.log('📋 Available Agents:', data.agents);
    return true;
  } catch (error) {
    console.error('❌ API Health Check Failed:', error.message);
    console.error('💡 Make sure the development server is running: npm run dev');
    return false;
  }
}

// Main execution
(async () => {
  const isHealthy = await healthCheck();
  if (isHealthy) {
    await runTests();
  } else {
    process.exit(1);
  }
})();

