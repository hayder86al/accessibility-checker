# WCAG 2 Accessibility Checker

A Node.js tool that evaluates web pages for accessibility compliance against WCAG 2 standards and provides actionable improvement suggestions.

## Features

- Automatically analyzes web pages for accessibility issues
- Evaluates against WCAG 2.0 and 2.1 standards
- Provides detailed reports with prioritized suggestions
- Groups issues by WCAG criteria and impact levels
- Identifies both failures and passed tests
- Generates JSON reports for documentation and tracking

## Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

## Installation

1. Clone this repository or download the script:

```bash
git clone https://github.com/yourusername/accessibility-checker.git
cd accessibility-checker
```

2. Install the required dependencies:

```bash
npm install puppeteer @axe-core/puppeteer
```

## Usage

### Command Line Interface

Run the script with a URL as an argument:

```bash
node accessibility-checker.js https://example.com
```

The script will:
1. Load the specified URL in a headless browser
2. Run accessibility tests using axe-core
3. Print a summary of findings to the console
4. Save a detailed JSON report to the current directory

### Using as a Module

You can also import and use the accessibility checker in your own Node.js applications:

```javascript
const { checkAccessibility } = require('./accessibility-checker');

async function runAccessibilityTest() {
  try {
    const report = await checkAccessibility('https://example.com');
    console.log(`Found ${report.summary.totalViolations} violations`);
    // Process the report as needed
  } catch (error) {
    console.error('Error running accessibility check:', error);
  }
}

runAccessibilityTest();
```

## Understanding the Report

The generated report includes:

### Summary Section
- Total count of violations, passes, and incomplete tests
- Breakdown of issues by impact level (critical, serious, moderate, minor)

### Violations
- Grouped by WCAG criteria (e.g., wcag2a, wcag2aa)
- Each violation includes:
  - Description of the issue
  - Impact level
  - Affected elements
  - Help URL for more information

### Suggestions
- Prioritized list of improvements
- Specific remediation strategies
- Links to relevant documentation

### Passed Tests
- List of accessibility tests that passed
- Useful for documenting compliance

## Example Output

The console output will look something like this:

```
Starting accessibility check for: https://example.com
Page loaded successfully

Accessibility Check Summary:
URL: https://example.com
Total violations: 12
Total passes: 43

Prioritized improvement suggestions:
1. Images must have alternate text (wcag2a, Priority: 1)
   Remediation: Add descriptive alt text to all informative images. Use empty alt attributes for decorative images.
2. Form elements must have labels (wcag2a, Priority: 1)
   Remediation: Associate labels with form controls using the label element or aria-label/aria-labelledby.
3. Links must have discernible text (wcag2a, Priority: 1)
   Remediation: Ensure all links have discernible text that describes their purpose.

Full report saved to: accessibility-report-2025-03-14T12-34-56.789Z.json
```

## Interpreting WCAG Levels

- **WCAG 2.0 Level A**: Minimum level of accessibility
- **WCAG 2.0 Level AA**: Addresses the most common and impactful barriers
- **WCAG 2.0 Level AAA**: Highest level of accessibility

Most organizations aim for WCAG 2.0 Level AA compliance as a standard.

## Common Accessibility Issues and Fixes

| Issue | Remediation |
|-------|-------------|
| Insufficient color contrast | Increase contrast between text and background to at least 4.5:1 |
| Missing alt text | Add descriptive alternative text to images |
| Keyboard inaccessible elements | Ensure all interactive elements are keyboard accessible |
| Missing form labels | Associate labels with form controls |
| Improper heading structure | Use headings in a logical hierarchical order |
| Missing document language | Specify the language of the document |

## Limitations

- The tool cannot detect all accessibility issues; manual testing is still recommended
- Some tests may require human judgment to determine if the content is truly accessible
- Dynamic content that loads after the initial page load may not be fully tested

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.