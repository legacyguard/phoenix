#!/bin/bash

# Professional Components Test Coverage Script
# Runs tests and generates detailed coverage report for professional, non-gamified components

echo "================================================"
echo "Professional Components Test Coverage Report"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create coverage directory if it doesn't exist
mkdir -p coverage/professional

# Run tests with coverage for professional components
echo "Running tests for Professional components..."
echo ""

# Test ProfessionalProgressService
echo "Testing ProfessionalProgressService..."
npx vitest run \
  src/services/__tests__/ProfessionalProgressService.test.ts \
  src/services/__tests__/ProfessionalProgressService.edge-cases.test.ts \
  --coverage \
  --coverage.reporter=text \
  --coverage.reporter=json \
  --coverage.reporter=html \
  --coverage.include="src/services/ProfessionalProgressService.ts" \
  --coverage.outputDirectory=coverage/professional/service \
  2>/dev/null

SERVICE_EXIT_CODE=$?

# Test Professional UI Components
echo "Testing Professional UI Components..."
npx vitest run \
  src/components/professional/__tests__/ProfessionalUIComponents.test.tsx \
  src/components/professional/__tests__/ProfessionalUIComponents.edge-cases.test.tsx \
  --coverage \
  --coverage.reporter=text \
  --coverage.reporter=json \
  --coverage.reporter=html \
  --coverage.include="src/components/professional/ProfessionalUIComponents.tsx" \
  --coverage.outputDirectory=coverage/professional/components \
  2>/dev/null

COMPONENTS_EXIT_CODE=$?

# Test Integration Tests
echo "Testing Professional Integration..."
npx vitest run \
  src/__tests__/professional-onboarding-integration.test.tsx \
  --coverage \
  --coverage.reporter=text \
  --coverage.reporter=json \
  --coverage.include="src/components/professional/**/*.tsx" \
  --coverage.include="src/services/ProfessionalProgressService.ts" \
  --coverage.outputDirectory=coverage/professional/integration \
  2>/dev/null

INTEGRATION_EXIT_CODE=$?

echo ""
echo "================================================"
echo "Coverage Summary"
echo "================================================"
echo ""

# Function to extract coverage percentage from JSON
extract_coverage() {
  local json_file=$1
  local metric=$2
  
  if [ -f "$json_file" ]; then
    coverage=$(node -e "
      const coverage = require('$json_file');
      const total = coverage.total;
      if (total && total.$metric) {
        console.log(total.$metric.pct);
      } else {
        console.log('N/A');
      }
    " 2>/dev/null)
    echo ${coverage:-N/A}
  else
    echo "N/A"
  fi
}

# Display coverage results
display_coverage() {
  local name=$1
  local json_file=$2
  
  echo "$name Coverage:"
  
  if [ -f "$json_file" ]; then
    lines=$(extract_coverage "$json_file" "lines")
    branches=$(extract_coverage "$json_file" "branches")
    functions=$(extract_coverage "$json_file" "functions")
    statements=$(extract_coverage "$json_file" "statements")
    
    # Color code based on percentage
    format_percentage() {
      local value=$1
      if [ "$value" = "N/A" ]; then
        echo "${YELLOW}N/A${NC}"
      elif (( $(echo "$value >= 100" | bc -l) )); then
        echo "${GREEN}100%${NC} ✓"
      elif (( $(echo "$value >= 95" | bc -l) )); then
        echo "${GREEN}${value}%${NC}"
      elif (( $(echo "$value >= 80" | bc -l) )); then
        echo "${YELLOW}${value}%${NC}"
      else
        echo "${RED}${value}%${NC}"
      fi
    }
    
    echo "  - Lines:      $(format_percentage $lines)"
    echo "  - Branches:   $(format_percentage $branches)"
    echo "  - Functions:  $(format_percentage $functions)"
    echo "  - Statements: $(format_percentage $statements)"
    
    # Check if 100% coverage achieved
    if [ "$lines" = "100" ] && [ "$branches" = "100" ] && [ "$functions" = "100" ] && [ "$statements" = "100" ]; then
      echo "  ${GREEN}✓ 100% COVERAGE ACHIEVED!${NC}"
    fi
  else
    echo "  ${RED}Coverage data not available${NC}"
  fi
  echo ""
}

# Display coverage for each component
display_coverage "ProfessionalProgressService" "coverage/professional/service/coverage-final.json"
display_coverage "Professional UI Components" "coverage/professional/components/coverage-final.json"
display_coverage "Integration Tests" "coverage/professional/integration/coverage-final.json"

# Overall test results
echo "================================================"
echo "Test Results"
echo "================================================"
echo ""

if [ $SERVICE_EXIT_CODE -eq 0 ] && [ $COMPONENTS_EXIT_CODE -eq 0 ] && [ $INTEGRATION_EXIT_CODE -eq 0 ]; then
  echo "${GREEN}✓ All tests passed!${NC}"
  
  # Check for 100% coverage
  service_lines=$(extract_coverage "coverage/professional/service/coverage-final.json" "lines")
  components_lines=$(extract_coverage "coverage/professional/components/coverage-final.json" "lines")
  
  if [ "$service_lines" = "100" ] && [ "$components_lines" = "100" ]; then
    echo ""
    echo "${GREEN}🎉 CONGRATULATIONS! 100% CODE COVERAGE ACHIEVED! 🎉${NC}"
    echo ""
    echo "All professional, non-gamified components have complete test coverage."
    echo "This ensures maximum reliability and maintainability."
  else
    echo ""
    echo "${YELLOW}⚠ Coverage is below 100%. Run additional edge case tests to improve.${NC}"
  fi
else
  echo "${RED}✗ Some tests failed. Please review the errors above.${NC}"
  exit 1
fi

echo ""
echo "================================================"
echo "Coverage Reports"
echo "================================================"
echo ""
echo "HTML reports generated at:"
echo "  - Service:     coverage/professional/service/index.html"
echo "  - Components:  coverage/professional/components/index.html"
echo "  - Integration: coverage/professional/integration/index.html"
echo ""
echo "Open these files in a browser for detailed coverage visualization."
echo ""

# Generate combined coverage report
echo "Generating combined coverage report..."
node -e "
  const fs = require('fs');
  const path = require('path');
  
  function loadCoverage(file) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      return null;
    }
  }
  
  const service = loadCoverage('coverage/professional/service/coverage-final.json');
  const components = loadCoverage('coverage/professional/components/coverage-final.json');
  
  if (service && components) {
    const combined = {
      service: service.total,
      components: components.total,
      overall: {
        lines: { pct: (service.total.lines.pct + components.total.lines.pct) / 2 },
        branches: { pct: (service.total.branches.pct + components.total.branches.pct) / 2 },
        functions: { pct: (service.total.functions.pct + components.total.functions.pct) / 2 },
        statements: { pct: (service.total.statements.pct + components.total.statements.pct) / 2 }
      }
    };
    
    fs.writeFileSync('coverage/professional/combined-coverage.json', JSON.stringify(combined, null, 2));
    
    console.log('Combined coverage:');
    console.log('  Lines:     ', combined.overall.lines.pct.toFixed(1) + '%');
    console.log('  Branches:  ', combined.overall.branches.pct.toFixed(1) + '%');
    console.log('  Functions: ', combined.overall.functions.pct.toFixed(1) + '%');
    console.log('  Statements:', combined.overall.statements.pct.toFixed(1) + '%');
    
    if (combined.overall.lines.pct === 100 && 
        combined.overall.branches.pct === 100 &&
        combined.overall.functions.pct === 100 &&
        combined.overall.statements.pct === 100) {
      console.log('');
      console.log('🏆 PERFECT SCORE: 100% coverage across all metrics!');
    }
  }
" 2>/dev/null

echo ""
echo "================================================"
echo "Next Steps"
echo "================================================"
echo ""
echo "1. Review any uncovered lines in the HTML reports"
echo "2. Add tests for any missing edge cases"
echo "3. Run this script again to verify 100% coverage"
echo "4. Commit your changes with confidence!"
echo ""
