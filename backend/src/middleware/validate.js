import mongoose from 'mongoose';
import { ApiError } from './errorHandler.js';

// Minimal validation helpers. Kept lightweight (no external schema lib).
// Each rule: { field, type, required, min, max, pattern, values }

function checkRule(value, rule) {
  const errors = [];
  const { field, type, required, min, max, pattern, values, minLength, maxLength } = rule;

  if (value === undefined || value === null || value === '') {
    if (required) errors.push(`${field} is required`);
    return errors;
  }

  if (type === 'string' && typeof value !== 'string') {
    errors.push(`${field} must be a string`);
    return errors;
  }
  if (type === 'number' && typeof value !== 'number') {
    errors.push(`${field} must be a number`);
    return errors;
  }
  if (type === 'email' && (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
    errors.push(`${field} must be a valid email`);
    return errors;
  }

  if (typeof value === 'string') {
    if (minLength !== undefined && value.length < minLength) {
      errors.push(`${field} must be at least ${minLength} characters`);
    }
    if (maxLength !== undefined && value.length > maxLength) {
      errors.push(`${field} must be at most ${maxLength} characters`);
    }
    if (pattern && !pattern.test(value)) {
      errors.push(`${field} has an invalid format`);
    }
  }
  if (typeof value === 'number') {
    if (min !== undefined && value < min) errors.push(`${field} must be ≥ ${min}`);
    if (max !== undefined && value > max) errors.push(`${field} must be ≤ ${max}`);
  }
  if (values && !values.includes(value)) {
    errors.push(`${field} must be one of: ${values.join(', ')}`);
  }

  return errors;
}

export function validateBody(rules) {
  return (req, _res, next) => {
    const errors = [];
    const body = req.body || {};
    for (const rule of rules) {
      errors.push(...checkRule(body[rule.field], rule));
    }
    if (errors.length) return next(new ApiError(400, 'Validation failed', errors));
    next();
  };
}

export function validateObjectId(param = 'id') {
  return (req, _res, next) => {
    const value = req.params[param];
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return next(new ApiError(400, `Invalid ${param} — must be a valid ObjectId`));
    }
    next();
  };
}
