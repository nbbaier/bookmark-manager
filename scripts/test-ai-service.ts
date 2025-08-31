#!/usr/bin/env node

/**
 * Test script to verify AI service constant implementation
 * This script validates that the MAX_CONCURRENT_CATEGORIZATIONS constant
 * is properly implemented and working as expected.
 */

import {
	MAX_CONCURRENT_CATEGORIZATIONS,
	getCategorizationStats,
	isAIServiceConfigured,
} from "../src/lib/ai-service";

async function testAIService() {
	console.log("🔍 Testing AI Service Constants...\n");

	try {
		// Test 1: Verify the constant is properly exported
		console.log("✅ Test 1: MAX_CONCURRENT_CATEGORIZATIONS constant");
		console.log(`   Value: ${MAX_CONCURRENT_CATEGORIZATIONS}`);
		console.log(`   Type: ${typeof MAX_CONCURRENT_CATEGORIZATIONS}`);
		
		if (typeof MAX_CONCURRENT_CATEGORIZATIONS !== "number") {
			throw new Error("MAX_CONCURRENT_CATEGORIZATIONS should be a number");
		}
		
		if (MAX_CONCURRENT_CATEGORIZATIONS <= 0) {
			throw new Error("MAX_CONCURRENT_CATEGORIZATIONS should be positive");
		}
		
		console.log("   ✓ Constant is properly defined as a positive number\n");

		// Test 2: Verify the constant appears in service statistics
		console.log("✅ Test 2: Service Statistics");
		const stats = getCategorizationStats();
		console.log("   Current statistics:", JSON.stringify(stats, null, 2));
		
		if (!("maxConcurrentCategorizations" in stats)) {
			throw new Error("maxConcurrentCategorizations not found in stats");
		}
		
		if (stats.maxConcurrentCategorizations !== MAX_CONCURRENT_CATEGORIZATIONS) {
			throw new Error("Stats value doesn't match constant");
		}
		
		console.log("   ✓ Constant is properly included in service statistics\n");

		// Test 3: Verify AI service configuration check
		console.log("✅ Test 3: AI Service Configuration");
		const isConfigured = isAIServiceConfigured();
		console.log(`   AI Service Configured: ${isConfigured}`);
		console.log("   ✓ Configuration check function working\n");

		// Test 4: Verify the constant value is the expected 3
		console.log("✅ Test 4: Constant Value Verification");
		if (MAX_CONCURRENT_CATEGORIZATIONS !== 3) {
			throw new Error(`Expected value 3, got ${MAX_CONCURRENT_CATEGORIZATIONS}`);
		}
		console.log("   ✓ Constant has the correct value (3)\n");

		console.log("🎉 All tests passed!");
		console.log("\n📊 Summary:");
		console.log(`   • MAX_CONCURRENT_CATEGORIZATIONS = ${MAX_CONCURRENT_CATEGORIZATIONS}`);
		console.log(`   • Included in service statistics: ✓`);
		console.log(`   • Proper type validation: ✓`);
		console.log(`   • API configuration check: ${isConfigured ? '✓' : '⚠️ (API key not set)'}`);

	} catch (error) {
		console.error("❌ Test failed:", error);
		process.exit(1);
	}
}

// Run the tests
testAIService().catch((error) => {
	console.error("❌ Unexpected error:", error);
	process.exit(1);
});