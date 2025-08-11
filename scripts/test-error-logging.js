#!/usr/bin/env node

/**
 * Automated test script for error logging system
 * This script tests the error logging functionality directly against Supabase
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env") });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env file");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testErrorLogging() {
  log("\n🧪 Testing Error Logging System\n", "cyan");

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  // Test 1: Log a regular error
  log("Test 1: Logging regular error...", "blue");
  try {
    const { data, error } = await supabase.rpc("log_error", {
      p_error_level: "error",
      p_error_message: "Test error from automated script",
      p_error_stack:
        "Error: Test error\n    at testErrorLogging (test-error-logging.js:50:15)",
      p_error_context: {
        test: true,
        automated: true,
        timestamp: new Date().toISOString(),
      },
      p_page_url: "/test-script",
      p_user_agent: "Node.js Test Script",
      p_browser_info: { browser: "Node.js", version: process.version },
    });

    if (error) throw error;

    log(`✅ Test 1 passed: Error logged with ID: ${data}`, "green");
    results.passed++;
    results.tests.push({
      name: "Log regular error",
      status: "passed",
      errorId: data,
    });
  } catch (error) {
    log(`❌ Test 1 failed: ${error.message}`, "red");
    results.failed++;
    results.tests.push({
      name: "Log regular error",
      status: "failed",
      error: error.message,
    });
  }

  // Test 2: Log a warning
  log("\nTest 2: Logging warning...", "blue");
  try {
    const { data, error } = await supabase.rpc("log_error", {
      p_error_level: "warning",
      p_error_message: "Test warning from automated script",
      p_error_context: { test: true, type: "warning" },
      p_page_url: "/test-warnings",
    });

    if (error) throw error;

    log(`✅ Test 2 passed: Warning logged with ID: ${data}`, "green");
    results.passed++;
    results.tests.push({
      name: "Log warning",
      status: "passed",
      errorId: data,
    });
  } catch (error) {
    log(`❌ Test 2 failed: ${error.message}`, "red");
    results.failed++;
    results.tests.push({
      name: "Log warning",
      status: "failed",
      error: error.message,
    });
  }

  // Test 3: Log critical errors (but not enough to trigger alert)
  log("\nTest 3: Logging critical errors...", "blue");
  const criticalErrorIds = [];
  try {
    for (let i = 0; i < 3; i++) {
      const { data, error } = await supabase.rpc("log_error", {
        p_error_level: "critical",
        p_error_message: `Critical test error ${i + 1} from automated script`,
        p_error_context: { test: true, critical: true, index: i },
        p_page_url: "/test-critical",
      });

      if (error) throw error;
      criticalErrorIds.push(data);
    }

    log(
      `✅ Test 3 passed: ${criticalErrorIds.length} critical errors logged`,
      "green",
    );
    results.passed++;
    results.tests.push({
      name: "Log critical errors",
      status: "passed",
      errorIds: criticalErrorIds,
    });
  } catch (error) {
    log(`❌ Test 3 failed: ${error.message}`, "red");
    results.failed++;
    results.tests.push({
      name: "Log critical errors",
      status: "failed",
      error: error.message,
    });
  }

  // Test 4: Check critical error threshold
  log("\nTest 4: Checking critical error threshold...", "blue");
  try {
    const { data, error } = await supabase.rpc(
      "check_critical_error_threshold",
    );

    if (error) throw error;

    const result = data[0];
    log(`✅ Test 4 passed: Threshold check completed`, "green");
    log(`   - Should alert: ${result.should_alert}`, "cyan");
    log(`   - Error count: ${result.error_count}`, "cyan");
    log(`   - Time window: ${result.time_window}`, "cyan");
    results.passed++;
    results.tests.push({
      name: "Check threshold",
      status: "passed",
      data: result,
    });
  } catch (error) {
    log(`❌ Test 4 failed: ${error.message}`, "red");
    results.failed++;
    results.tests.push({
      name: "Check threshold",
      status: "failed",
      error: error.message,
    });
  }

  // Test 5: Query error logs
  log("\nTest 5: Querying error logs...", "blue");
  try {
    const { data, error } = await supabase
      .from("error_logs")
      .select("*")
      .eq("error_context->test", true)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    log(`✅ Test 5 passed: Found ${data.length} test errors`, "green");
    results.passed++;
    results.tests.push({
      name: "Query error logs",
      status: "passed",
      count: data.length,
    });
  } catch (error) {
    log(`❌ Test 5 failed: ${error.message}`, "red");
    results.failed++;
    results.tests.push({
      name: "Query error logs",
      status: "failed",
      error: error.message,
    });
  }

  // Test 6: Check error statistics view
  log("\nTest 6: Checking error statistics view...", "blue");
  try {
    const { data, error } = await supabase
      .from("error_statistics")
      .select("*")
      .limit(5);

    if (error) throw error;

    log(`✅ Test 6 passed: Error statistics available`, "green");
    if (data.length > 0) {
      log("   Recent statistics:", "cyan");
      data.forEach((stat) => {
        log(
          `   - ${stat.hour}: ${stat.error_level} (${stat.error_count} errors)`,
          "cyan",
        );
      });
    }
    results.passed++;
    results.tests.push({
      name: "Check error statistics",
      status: "passed",
      stats: data.length,
    });
  } catch (error) {
    log(`❌ Test 6 failed: ${error.message}`, "red");
    results.failed++;
    results.tests.push({
      name: "Check error statistics",
      status: "failed",
      error: error.message,
    });
  }

  // Summary
  log("\n" + "=".repeat(50), "cyan");
  log("📊 Test Summary", "cyan");
  log("=".repeat(50), "cyan");
  log(`Total tests: ${results.tests.length}`, "blue");
  log(`Passed: ${results.passed}`, "green");
  log(`Failed: ${results.failed}`, results.failed > 0 ? "red" : "green");

  // Cleanup test data
  if (results.passed > 0) {
    log("\n🧹 Cleaning up test data...", "yellow");
    try {
      const { error } = await supabase
        .from("error_logs")
        .delete()
        .eq("error_context->test", true);

      if (!error) {
        log("✅ Test data cleaned up successfully", "green");
      } else {
        log(`⚠️  Failed to clean up test data: ${error.message}`, "yellow");
      }
    } catch (error) {
      log(`⚠️  Failed to clean up test data: ${error.message}`, "yellow");
    }
  }

  return results;
}

// Run the tests
testErrorLogging()
  .then((results) => {
    if (results.failed === 0) {
      log(
        "\n✨ All tests passed! Error logging system is working correctly.",
        "green",
      );
      process.exit(0);
    } else {
      log(
        "\n❌ Some tests failed. Please check the error messages above.",
        "red",
      );
      process.exit(1);
    }
  })
  .catch((error) => {
    log(`\n❌ Test script failed: ${error.message}`, "red");
    process.exit(1);
  });
