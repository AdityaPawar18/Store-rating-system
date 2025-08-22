// Input validation schemas using Joi
import Joi from "joi"

// Password validation: 8-16 characters, at least one uppercase and one special character
const passwordSchema = Joi.string()
  .min(8)
  .max(16)
  .pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/)
  .required()
  .messages({
    "string.pattern.base": "Password must contain at least one uppercase letter and one special character",
  })

// Name validation: 20-60 characters
const nameSchema = Joi.string().min(20).max(60).required().messages({
  "string.min": "Name must be at least 20 characters long",
  "string.max": "Name must not exceed 60 characters",
})

// Address validation: max 400 characters
const addressSchema = Joi.string().max(400).required().messages({
  "string.max": "Address must not exceed 400 characters",
})

export const validateRegistration = Joi.object({
  name: nameSchema,
  email: Joi.string().email().required(),
  password: passwordSchema,
  address: addressSchema,
})

export const validateLogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

export const validatePasswordUpdate = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordSchema,
})

export const validateUserCreation = Joi.object({
  name: nameSchema,
  email: Joi.string().email().required(),
  password: passwordSchema,
  address: addressSchema,
  role: Joi.string().valid("admin", "user", "store_owner").required(),
})

export const validateStoreCreation = Joi.object({
  name: nameSchema,
  email: Joi.string().email().required(),
  address: addressSchema,
  ownerId: Joi.number().integer().positive().required(),
})

export const validateRating = Joi.object({
  storeId: Joi.number().integer().positive().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
})

export const validateSearch = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().optional(),
  address: Joi.string().optional(),
  role: Joi.string().valid("admin", "user", "store_owner").optional(),
  sortBy: Joi.string().valid("name", "email", "address", "role", "created_at").optional(),
  sortOrder: Joi.string().valid("asc", "desc").optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
})
