/**
 * @fileoverview Shared utilities for provider evaluation scripts.
 */

/**
 * @typedef {Object} Usage
 * @property {number} inputTokens
 * @property {number} outputTokens
 * @property {number} cacheTokens
 * @property {number} reasoningTokens
 * @property {number} estimatedCost
 */

/**
 * @typedef {Object} TestResult
 * @property {boolean} success
 * @property {string} [text]
 * @property {Usage} [usage]
 * @property {string} [error]
 * @property {number} [durationMs]
 */

/**
 * Runs a single test case and measures duration.
 * @param {import('../src/index.js').AskFn} ask
 * @param {string} prompt
 * @param {import('../src/index.js').AskParams} [options]
 * @returns {Promise<TestResult>}
 */
export const runTest = async (ask, prompt, options = {}) => {
  const start = Date.now()
  try {
    const result = await ask({
      prompt,
      ...options,
    })
    const duration = Date.now() - start
    return {
      success: true,
      text: result.text,
      usage: result.usage,
      durationMs: duration,
    }
  } catch (error) {
    const duration = Date.now() - start
    return {
      success: false,
      error: error.message,
      durationMs: duration,
    }
  }
}

/**
 * Formats a test result for console output.
 * @param {TestResult} result
 * @param {string} modelId
 */
export const printResult = (result, modelId) => {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Model: ${modelId}`)
  console.log(`Status: ${result.success ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Duration: ${result.durationMs}ms`)

  if (result.success) {
    console.log(`Input tokens: ${result.usage.inputTokens}`)
    console.log(`Reasoning tokens: ${result.usage.reasoningTokens}`)
    console.log(`Output tokens: ${result.usage.outputTokens}`)
    console.log(`Cache tokens: ${result.usage.cacheTokens}`)
    console.log(`Estimated cost: $${result.usage.estimatedCost.toFixed(6)}`)
    console.log(`\nResponse preview (first 200 chars):`)
    console.log(`  ${result.text.slice(0, 200)}${result.text.length > 200 ? '...' : ''}`)
  } else {
    console.log(`Error: ${result.error}`)
  }
  console.log('='.repeat(60))
}

/**
 * Runs multiple test cases for a provider.
 * Models are loaded automatically from src/models.js.
 * @param {import('../src/index.js').AskFn} ask
 * @param {string[]} modelIds
 * @param {string[]} prompts
 * @param {string} apikey
 * @param {import('../src/index.js').AskParams} [options]
 */
export const runEvalSuite = async (ask, modelIds, prompts, apikey, options = {}) => {
  const results = []

  for (const modelId of modelIds) {
    for (const prompt of prompts) {
      const result = await runTest(ask, prompt, {
        ...options, model: modelId, apikey,
      })
      results.push({
        modelId, prompt, result,
      })
      printResult(result, modelId)

      // Small delay between tests to avoid rate limits
      await new Promise((resolve) => {
        setTimeout(resolve, 500)
      })
    }
  }

  // Summary
  const passed = results.filter((r) => r.result.success).length
  const failed = results.length - passed
  console.log(`\n\n${'='.repeat(60)}`)
  console.log(`SUMMARY: ${passed} passed, ${failed} failed out of ${results.length} tests`)
  console.log('='.repeat(60))

  return results
}
