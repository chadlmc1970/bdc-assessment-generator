/**
 * Anthropic Claude Client
 * Uses direct Anthropic API for POC deployment
 */

const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Generate text using Claude Sonnet 4.6
 */
async function generateText({ systemPrompt, userPrompt, maxTokens = 4000 }) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6-20250303',
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  });

  return response.content[0].text;
}

/**
 * Generate all 8 sections in sequence
 *
 * @param {Object} context - Assessment context (customer, benchmarks, components, businessContext)
 * @returns {Promise<Object>} All 8 sections as markdown strings
 */
async function generateFullAssessment(context) {
  const { customerProfile, benchmarks, selectedComponents, businessContext } = context;

  // Import all section prompts
  const { section1Prompt } = require('./prompts/section-1-business-problem');
  const { section2Prompt } = require('./prompts/section-2-current-state');
  const { section3Prompt } = require('./prompts/section-3-industry-context');
  const { section4Prompt } = require('./prompts/section-4-future-state');
  const { section5Prompt } = require('./prompts/section-5-scenario-comparison');
  const { section6Prompt } = require('./prompts/section-6-financial-model');
  const { section7Prompt } = require('./prompts/section-7-risk-management');
  const { section8Prompt } = require('./prompts/section-8-roadmap');

  console.log('Generating Section 1: Business Problem Definition...');
  const section1 = await generateText(section1Prompt({ customerProfile, businessContext, selectedComponents }));

  console.log('Generating Section 2: Current-State Assessment...');
  const section2 = await generateText(section2Prompt({ customerProfile, benchmarks }));

  console.log('Generating Section 3: Industry & Market Context...');
  const section3 = await generateText(section3Prompt({ customerProfile, benchmarks }));

  console.log('Generating Section 4: Future-State Architecture...');
  const section4 = await generateText(section4Prompt({ customerProfile, businessContext, selectedComponents, benchmarks }));

  console.log('Generating Section 5: Three-Scenario Comparison...');
  const section5 = await generateText(section5Prompt({ customerProfile, selectedComponents }));

  console.log('Generating Section 6: Financial Model & Sensitivity Analysis...');
  const section6 = await generateText(section6Prompt({ customerProfile, selectedComponents }));

  console.log('Generating Section 7: Risk & Change Management...');
  const section7 = await generateText(section7Prompt({ customerProfile, selectedComponents }));

  console.log('Generating Section 8: Recommended Roadmap...');
  const section8 = await generateText(section8Prompt({ customerProfile, businessContext, selectedComponents }));

  return {
    section1,
    section2,
    section3,
    section4,
    section5,
    section6,
    section7,
    section8
  };
}

module.exports = {
  generateText,
  generateFullAssessment
};
