// Accessibility Checker for WCAG 2 Standards
// This script uses the axe-core library to evaluate a URL for accessibility issues

const puppeteer = require("puppeteer")
const { AxePuppeteer } = require("@axe-core/puppeteer")
const fs = require("fs")

async function checkAccessibility(url) {
  console.log(`Starting accessibility check for: ${url}`)

  // Launch a headless browser
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  try {
    // Navigate to the URL
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 })
    console.log("Page loaded successfully")

    // Run axe accessibility analysis
    const results = await new AxePuppeteer(page).analyze()

    // Close the browser
    await browser.close()

    // Process and categorize the results
    const report = processResults(results, url)

    // Generate report file
    const timestamp = new Date().toISOString().replace(/:/g, "-")
    const filename = `accessibility-report-${timestamp}.json`
    fs.writeFileSync(filename, JSON.stringify(report, null, 2))

    console.log(`Report saved as ${filename}`)
    return report
  } catch (error) {
    console.error("Error during accessibility check:", error)
    await browser.close()
    throw error
  }
}

function processResults(results, url) {
  const violations = results.violations
  const passes = results.passes
  const incomplete = results.incomplete

  // Group violations by WCAG criteria
  const groupedViolations = groupByWCAGCriteria(violations)

  // Generate improvement suggestions
  const suggestions = generateSuggestions(groupedViolations)

  return {
    url: url,
    timestamp: new Date().toISOString(),
    summary: {
      totalViolations: violations.length,
      totalPasses: passes.length,
      totalIncomplete: incomplete.length,
      impactBreakdown: countImpactLevels(violations),
    },
    violations: groupedViolations,
    suggestions: suggestions,
    passedTests: passes.map(item => ({
      id: item.id,
      description: item.description,
      impact: item.impact,
      nodes: item.nodes.length,
    })),
  }
}

function groupByWCAGCriteria(violations) {
  const grouped = {}

  violations.forEach(violation => {
    const wcagTags = violation.tags.filter(tag => tag.startsWith("wcag"))

    wcagTags.forEach(tag => {
      if (!grouped[tag]) {
        grouped[tag] = []
      }

      grouped[tag].push({
        id: violation.id,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        impact: violation.impact,
        nodes: violation.nodes.map(node => ({
          html: node.html,
          failureSummary: node.failureSummary,
          target: node.target,
        })),
      })
    })
  })

  return grouped
}

function countImpactLevels(violations) {
  const impacts = { critical: 0, serious: 0, moderate: 0, minor: 0 }

  violations.forEach(violation => {
    if (impacts[violation.impact] !== undefined) {
      impacts[violation.impact]++
    }
  })

  return impacts
}

function generateSuggestions(groupedViolations) {
  const suggestions = []

  // Common remediation suggestions by issue type
  const remediationStrategies = {
    "color-contrast":
      "Increase the contrast ratio between text and background to at least 4.5:1 for normal text or 3:1 for large text.",
    "image-alt":
      "Add descriptive alt text to all informative images. Use empty alt attributes for decorative images.",
    "aria-required-attr": "Ensure ARIA elements have all required attributes.",
    "document-title": "Add a descriptive and unique title to the page.",
    label:
      "Associate labels with form controls using the label element or aria-label/aria-labelledby.",
    "link-name":
      "Ensure all links have discernible text that describes their purpose.",
    list: "Use appropriate list markup (ul, ol, dl) for lists.",
    "heading-order":
      "Structure headings in a logical hierarchical order (h1 followed by h2, etc.).",
    landmark: "Use landmark regions to identify sections of the page.",
    "focus-visible": "Ensure focus indicators are visible for keyboard users.",
    keyboard: "Make all functionality available via keyboard.",
    bypass:
      "Provide a way to bypass blocks of content (like skip links or landmarks).",
  }

  // Generate prioritized suggestions
  for (const [wcagCriteria, issues] of Object.entries(groupedViolations)) {
    // Get WCAG level from criteria tag
    const level = wcagCriteria.includes("aaa")
      ? "AAA"
      : wcagCriteria.includes("aa")
      ? "AA"
      : "A"

    // Process each issue in this WCAG criteria
    issues.forEach(issue => {
      const issueType = issue.id
      const impact = issue.impact
      const affectedElements = issue.nodes.length

      // Calculate priority based on impact and WCAG level
      let priority = 3 // Default medium priority

      if (impact === "critical" || level === "A") {
        priority = 1 // High priority
      } else if (impact === "serious" || level === "AA") {
        priority = 2 // Medium-high priority
      }

      let remediation =
        remediationStrategies[issueType] ||
        `Fix ${issueType} issues according to guidelines at ${issue.helpUrl}`

      suggestions.push({
        issueType: issueType,
        description: issue.description,
        wcagCriteria: wcagCriteria,
        level: level,
        impact: impact,
        affectedElements: affectedElements,
        priority: priority,
        remediation: remediation,
        helpUrl: issue.helpUrl,
      })
    })
  }

  // Sort suggestions by priority
  return suggestions.sort((a, b) => a.priority - b.priority)
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    console.error("Please provide a URL to check")
    console.log("Usage: node accessibility-checker.js https://example.com")
    process.exit(1)
  }

  const url = args[0]

  checkAccessibility(url)
    .then(report => {
      console.log("\nAccessibility Check Summary:")
      console.log(`URL: ${report.url}`)
      console.log(`Total violations: ${report.summary.totalViolations}`)
      console.log(`Total passes: ${report.summary.totalPasses}`)
      console.log("\nPrioritized improvement suggestions:")

      report.suggestions.slice(0, 5).forEach((suggestion, index) => {
        console.log(
          `${index + 1}. ${suggestion.description} (${
            suggestion.wcagCriteria
          }, Priority: ${suggestion.priority})`
        )
        console.log(`   Remediation: ${suggestion.remediation}`)
      })

      console.log(`\nFull report saved to: ${report.timestamp}.json`)
    })
    .catch(error => {
      console.error("Error:", error.message)
      process.exit(1)
    })
}

// Export function for use as a module
module.exports = { checkAccessibility }
