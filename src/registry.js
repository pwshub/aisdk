/**
 * @fileoverview Model registry — in-memory store for model records.
 *
 * Default models are loaded automatically from ./models.js at import time.
 * Users can modify the registry via addModels() and setModels().
 *
 * This module provides O(1) lookups at runtime via a Map indexed by model ID.
 *
 * `supportedParams` is optional per record. When absent, the provider's
 * default param set is used.
 *
 * @typedef {'openai'|'anthropic'|'google'|'dashscope'|'deepseek'} ProviderId
 */

import { DEFAULT_MODELS } from './models.js'

/**
 * Mirrors the Directus collection schema exactly.
 * `supportedParams` is optional — added later via Directus field.
 *
 * @typedef {Object} ModelRecord
 * @property {string} id
 * @property {string} name                  - Official model name used in API calls
 * @property {ProviderId} provider
 * @property {number} input_price           - Per 1M tokens, USD
 * @property {number} output_price          - Per 1M tokens, USD
 * @property {number} cache_price           - Per 1M tokens, USD
 * @property {number} max_in                - Max input tokens (context window)
 * @property {number} max_out               - Max output tokens
 * @property {boolean} enable
 * @property {string[]} [supportedParams]   - Canonical param names; falls back to provider default
 */

/**
 * Default supported params per provider.
 * Used as fallback when a model record has no `supportedParams` field.
 *
 * @type {Record<ProviderId, string[]>}
 */
export const PROVIDER_DEFAULT_PARAMS = {
  openai: ['temperature', 'maxTokens', 'topP', 'frequencyPenalty', 'presencePenalty', 'seed', 'stop'],
  anthropic: ['temperature', 'maxTokens', 'topP', 'topK', 'stop'],
  google: ['temperature', 'maxTokens', 'topP', 'topK', 'seed', 'stop'],
  dashscope: ['temperature', 'maxTokens', 'topP', 'topK', 'stop'],
  deepseek: ['temperature', 'maxTokens', 'topP', 'frequencyPenalty', 'presencePenalty', 'stop'],
}

/** @type {ProviderId[]} */
const VALID_PROVIDERS = ['openai', 'anthropic', 'google', 'dashscope', 'deepseek']

/** @type {Map<string, ModelRecord>} */
let REGISTRY = new Map()

/**
 * Initializes the registry with default models.
 * Called automatically at module import.
 */
const initRegistry = () => {
  REGISTRY = new Map(DEFAULT_MODELS.map((model) => [model.id, model]))
}

// Initialize with default models on import
initRegistry()

/**
 * Validates a single model record structure and types.
 *
 * @param {Object} model - The model record to validate
 * @param {number} index - Index in the array for error messages
 * @throws {Error} When validation fails
 */
const validateModelRecord = (model, index) => {
  const errors = []

  // Check required string fields
  if (!model.id || typeof model.id !== 'string') {
    errors.push('"id" must be a non-empty string')
  }

  if (!model.name || typeof model.name !== 'string') {
    errors.push('"name" must be a non-empty string')
  }

  // Check provider is valid
  if (!model.provider || typeof model.provider !== 'string') {
    errors.push('"provider" must be a string')
  } else if (!VALID_PROVIDERS.includes(model.provider)) {
    errors.push(`"provider" must be one of: ${VALID_PROVIDERS.join(', ')}. Got: "${model.provider}"`)
  }

  // Check required number fields (must be non-negative)
  const numberFields = ['input_price', 'output_price', 'cache_price', 'max_in', 'max_out']
  for (const field of numberFields) {
    if (typeof model[field] !== 'number') {
      errors.push(`"${field}" must be a number`)
    } else if (model[field] < 0) {
      errors.push(`"${field}" must be non-negative, got: ${model[field]}`)
    }
  }

  // Check enable is boolean
  if (typeof model.enable !== 'boolean') {
    errors.push('"enable" must be a boolean')
  }

  // Check optional supportedParams if present
  if (model.supportedParams !== undefined) {
    if (!Array.isArray(model.supportedParams)) {
      errors.push('"supportedParams" must be an array')
    } else {
      model.supportedParams.forEach((param, i) => {
        if (typeof param !== 'string') {
          errors.push(`"supportedParams[${i}]" must be a string`)
        }
      })
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid model record at index ${index}: ${errors.join('; ')}`)
  }
}

/**
 * Looks up a model by ID, validates it is enabled, and resolves its
 * effective supported params (record-level override or provider default).
 *
 * @param {string} modelId
 * @returns {{ record: ModelRecord, supportedParams: string[] }}
 * @throws {Error} When the model is not found or is disabled
 */
export const getModel = (modelId) => {
  const record = REGISTRY.get(modelId)

  if (!record) {
    const available = [...REGISTRY.keys()].join(', ')
    throw new Error(`Unknown model "${modelId}". Available: ${available}`)
  }

  if (!record.enable) {
    throw new Error(`Model "${modelId}" is currently disabled.`)
  }

  const supportedParams = record.supportedParams ?? PROVIDER_DEFAULT_PARAMS[record.provider]

  return {
    record, supportedParams,
  }
}

/**
 * Returns all enabled model records.
 *
 * @returns {ModelRecord[]}
 */
export const listModels = () =>
  [...REGISTRY.values()].filter((m) => m.enable)

/**
 * Adds one or more models to the registry.
 * Existing models with the same ID are overwritten.
 *
 * @param {ModelRecord[]} models - Array of model records to add
 * @throws {Error} When models is not an array or contains invalid records
 */
export const addModels = (models) => {
  if (!Array.isArray(models)) {
    throw new Error(`addModels expects an array. Got: ${typeof models}`)
  }

  // Validate each model record
  models.forEach((model, index) => {
    validateModelRecord(model, index)
  })

  // Add models to the registry
  models.forEach((model) => {
    REGISTRY.set(model.id, model)
  })
}

/**
 * Replaces the entire model registry with a new list of models.
 * Use this to load models from a CMS or other external source.
 *
 * @param {ModelRecord[]} models - Array of model records
 * @throws {Error} When models is not an array or contains invalid records
 */
export const setModels = (models) => {
  if (!Array.isArray(models)) {
    throw new Error(`setModels expects an array. Got: ${typeof models}`)
  }

  // Validate each model record strictly
  models.forEach((model, index) => {
    validateModelRecord(model, index)
  })

  REGISTRY = new Map(models.map((model) => [model.id, model]))
}
