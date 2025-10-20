# Porter AI Policy Configuration Guide

This guide explains how PSA staff can update and customize Porter AI's behavior, personality, and domain knowledge through the centralized policy configuration.

## Overview

All Porter AI policies, business logic, and agent personalities are centralized in `/lib/policy.ts`. This makes it easy to update the agent's behavior without modifying the core agent logic.

## Policy Components

### 1. Agent Identity & Personality

**Location:** `AGENT_IDENTITY` and `AGENT_PERSONALITY` constants

```typescript
export const AGENT_IDENTITY = {
  name: "Porter AI",
  organization: "Port of Singapore Authority (PSA)",
  role: "Intelligent assistant for port operations and analytics",
};
```

**What you can customize:**

- Agent name
- Organization name
- Role description
- Core personality traits
- Communication style
- Response guidelines

### 2. Role-Based Instructions

**Location:** `ROLE_INSTRUCTIONS` constant

Defines how Porter AI responds to different user roles:

- **Top Management**: Executive-level insights, strategic KPIs
- **Middle Management**: Operational metrics, tactical actions
- **Frontline Operations**: Practical guidance, immediate actions

**How to update:**

1. Modify the `response_style` for each role
2. Update the `focus_areas` array to emphasize different metrics
3. Adjust the `language_tone` to match organizational culture

### 3. PSA Domain Knowledge

**Location:** `PSA_OPERATIONS` constant

**What you can update:**

- **Key Metrics**: Add or modify tracked KPIs
- **Terminals**: Update terminal names and locations
- **Vessel Types**: Customize vessel classifications
- **Operational Areas**: Define key operational domains

**Example - Adding a new terminal:**

```typescript
export const PSA_OPERATIONS = {
  // ... existing config
  terminals: [
    "Tuas",
    "Pasir Panjang",
    "Keppel",
    "Brani",
    "Antwerp",
    "Busan",
    "Your New Terminal", // Add here
  ],
};
```

### 4. Few-Shot Examples

**Location:** `FEW_SHOT_EXAMPLES` constant

These examples teach Porter AI how to respond to different types of queries. This is one of the most important sections for customization.

**Current Examples:**

- `dashboard_analysis`: How to interpret dashboard data
- `metric_inquiry`: How to respond to metric questions
- `filter_request`: How to handle filter requests
- `problem_identification`: How to identify and communicate issues
- `comparative_analysis`: How to compare data across time periods

**How to add new examples:**

```typescript
export const FEW_SHOT_EXAMPLES = {
  // ... existing examples

  your_new_example: {
    user_query: "Example user question",
    response: "Example of how Porter AI should respond",
    intent: {
      action: "show_chart",
      parameters: { chartType: "your_chart_type" },
    },
  },
};
```

**Best Practices for Few-Shot Examples:**

1. Use real PSA data and terminology
2. Demonstrate the desired tone and detail level
3. Include proactive insights and recommendations
4. Show how to identify patterns and anomalies
5. Demonstrate appropriate role-based language

### 5. Issue Detection & Remediation

**Location:** `ISSUE_CATEGORIES` and `REMEDIATION_STRATEGIES` constants

Define operational issues and their remediation strategies.

**Current Issue Categories:**

- Berth Utilization Issues
- Vessel Turnaround Time Issues
- Crane Productivity Issues
- Yard Congestion

**How to update remediation strategies:**

Each issue has three levels of actions:

- **Immediate Actions**: Steps to take right now
- **Short-term**: Actions to take within days/weeks
- **Long-term**: Strategic improvements over months

```typescript
export const REMEDIATION_STRATEGIES = {
  your_new_issue: [
    {
      issue: "Description of the issue",
      immediate_actions: ["Action 1", "Action 2"],
      short_term: ["Short-term fix 1", "Short-term fix 2"],
      long_term: ["Strategic improvement 1", "Strategic improvement 2"],
    },
  ],
};
```

### 6. Response Templates

**Location:** `RESPONSE_TEMPLATES` constant

Standardized responses for common scenarios:

- Greetings (multilingual)
- Data unavailable messages
- Clarification requests
- Task completion confirmations
- Graceful error handling

**How to update:**

```typescript
export const RESPONSE_TEMPLATES = {
  your_new_template: (param: string) => `Your template message with ${param}`,
};
```

## Making Changes

### Step 1: Edit the Policy File

Open `/lib/policy.ts` and locate the section you want to modify.

### Step 2: Update Constants

Modify the relevant constants following the existing structure.

### Step 3: Test Your Changes

1. Restart your development server
2. Test Porter AI with queries that should trigger your changes
3. Verify the responses match your expectations

### Step 4: Deploy

Once tested, commit your changes and deploy to production.

## Common Customization Scenarios

### Scenario 1: Updating PSA Metrics

**Goal:** Add a new KPI "Environmental Compliance Score"

**Steps:**

1. Open `/lib/policy.ts`
2. Locate `PSA_OPERATIONS.key_metrics`
3. Add `'Environmental Compliance Score'` to the array
4. Save and test

### Scenario 2: Changing Agent Personality

**Goal:** Make Porter AI more formal

**Steps:**

1. Open `/lib/policy.ts`
2. Update `AGENT_PERSONALITY.communication_style.general` to `'Highly formal and precise'`
3. Update response guidelines to emphasize formal language
4. Save and test

### Scenario 3: Adding New Remediation Strategy

**Goal:** Add strategies for "Equipment Maintenance Delays"

**Steps:**

1. Open `/lib/policy.ts`
2. Add new entry to `ISSUE_CATEGORIES`:

```typescript
equipment_maintenance: {
  name: 'Equipment Maintenance Delays',
  thresholds: {
    critical: 48, // hours
    warning: 24,
    target: 12,
  },
  indicators: [
    'Maintenance duration exceeding 24 hours',
    'Multiple equipment failures',
    'Spare parts shortage',
  ],
}
```

3. Add corresponding `REMEDIATION_STRATEGIES.equipment_maintenance` entry
4. Save and test

### Scenario 4: Improving Response Quality with Few-Shot Examples

**Goal:** Teach Porter AI to provide better crane productivity insights

**Steps:**

1. Open `/lib/policy.ts`
2. Add new example to `FEW_SHOT_EXAMPLES`:

```typescript
crane_productivity_analysis: {
  user_query: 'How is crane productivity today?',
  response: 'Current crane productivity is averaging 28 moves per hour across all terminals. Tuas is performing exceptionally well at 32 moves/hour, while Pasir Panjang is slightly below target at 26 moves/hour. Based on the pattern, I recommend checking for equipment issues at Berth 4 in Pasir Panjang, as it has dropped from 30 to 24 moves/hour in the last 2 hours.',
  intent: {
    action: 'highlight_metric',
    parameters: { metric: 'crane_productivity' }
  },
}
```

3. The agent will now use this example to guide similar responses

## Multilingual Support

Porter AI supports multiple languages. Update greetings and response templates for each language:

```typescript
export const RESPONSE_TEMPLATES = {
  greeting: (language: string) => {
    const greetings: Record<string, string> = {
      English: "Hello! I'm Porter AI...",
      Chinese: "您好！我是 Porter AI...",
      Malay: "Hello! Saya Porter AI...",
      Tamil: "வணக்கம்! நான் Porter AI...",
      // Add more languages here
    };
    return greetings[language] || greetings.English;
  },
};
```

## Advanced: System Prompt Customization

The system prompts are built dynamically using the `buildSystemPrompt()` and `buildStreamingSystemPrompt()` functions. These functions pull from all the policy constants.

If you need to modify the prompt structure itself, edit these functions in `/lib/policy.ts`.

## Best Practices

1. **Test incrementally**: Make small changes and test before making large updates
2. **Use real data**: Base few-shot examples on actual PSA operations data
3. **Keep it current**: Regularly update metrics, terminals, and operational knowledge
4. **Document changes**: Add comments explaining why specific policies exist
5. **Version control**: Commit policy changes with clear commit messages
6. **Multilingual**: Update all language variants when modifying templates

## Getting Help

If you need assistance with policy updates:

1. Review this guide thoroughly
2. Check the inline comments in `/lib/policy.ts`
3. Test changes in development environment first
4. Contact the development team for major structural changes

## File Structure

```
/lib/
  ├── policy.ts           # Main policy configuration (edit this)
  └── agents/
      └── main.ts         # Agent implementation (references policy.ts)
```

The agent code in `/lib/agents/main.ts` automatically uses the policies from `policy.ts`, so you typically only need to edit `policy.ts` for policy updates.
