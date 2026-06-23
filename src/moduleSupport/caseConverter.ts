/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

export function camelToSnake(str: string): string {
  if (typeof str !== "string") return String(str || "");
  if (str === "_id") return "id";
  return str.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

export function snakeToCamel(str: string): string {
  if (typeof str !== "string") return String(str || "");
  if (str === "id") return "_id";
  return str.replace(/_([a-z0-9])/g, (_, g) => (g ? g.toUpperCase() : ""));
}

// Helper to check if a value looks like a valid MongoDB ObjectId or UUID string
function isIdValue(val: any): boolean {
  if (!val) return false;
  if (val instanceof mongoose.Types.ObjectId) return true;

  const str = String(val);
  return (
    mongoose.Types.ObjectId.isValid(str) ||
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str)
  );
}

// Converts an ObjectId back to a UUID string IF it was a padded UUID.
// Otherwise, returns a standard stringified ObjectId or a reconstructed UUID format.
function convertToUuidOrString(val: any): string {
  if (val instanceof mongoose.Types.ObjectId) {
    const hex = val.toString();
    // If you explicitly padded it with '0's in the past up to 32 chars (un-hyphenated UUID length)
    // You can attempt to reconstruct it here. 
    return hex;
  }
  return String(val);
}

// Deeply convert JS object to Postgres snake_case and clean up IDs
export function toSnakeCaseDeep<T = any>(obj: any): T {
  if (Array.isArray(obj)) {
    if (obj.length > 0 && isIdValue(obj[0])) {
      return obj.map(convertToUuidOrString) as any;
    }
    return obj.map(toSnakeCaseDeep) as any;
  }

  if (obj instanceof mongoose.Types.ObjectId) {
    return convertToUuidOrString(obj) as any;
  }

  if (obj !== null && typeof obj === "object" && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc: any, key) => {
      acc[camelToSnake(key)] = toSnakeCaseDeep(obj[key]);
      return acc;
    }, {}) as T;
  }
  return obj;
}

function isIdField(key: string): boolean {
  return key === "_id" || key === "id" || /Id(s)?$/.test(key);
}

// Crucial Fix: Safely parses ID values. If it's a UUID string, it keeps it as a string 
// so Mongoose doesn't mangle it into a broken/lossy ObjectId.
function convertToObjectId(val: any): mongoose.Types.ObjectId | string | any {
  if (!val) return val;
  if (val instanceof mongoose.Types.ObjectId) return val;

  const str = String(val);
  
  // If it's already a valid 24-character Mongo hex string, cast to actual ObjectId
  if (mongoose.Types.ObjectId.isValid(str) && str.length === 24) {
    return new mongoose.Types.ObjectId(str);
  }

  // If it's a UUID string (36 chars with hyphens), DO NOT turn it into a broken ObjectId.
  // Return it as a string. Mongoose schemas can accept UUID strings if defined as String.
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str)) {
    return str; 
  }

  // Fallback for messy data
  const cleanHex = str.replace(/[^0-9a-fA-F]/g, "");
  if (cleanHex.length === 24) {
    return new mongoose.Types.ObjectId(cleanHex);
  }
  
  return str;
}

// Deeply maps everything to CamelCase and checks camelKey directly
export function toCamelCaseDeep<T = any>(obj: any): T {
  if (Array.isArray(obj)) return obj.map(toCamelCaseDeep) as any;

  if (obj !== null && typeof obj === "object" && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc: any, key) => {
      const camelKey = snakeToCamel(key);
      let value = obj[key];

      if (isIdField(camelKey)) {
        if (Array.isArray(value)) {
          value = value.map(convertToObjectId);
        } else {
          value = convertToObjectId(value);
        }
      } else {
        value = toCamelCaseDeep(value);
      }

      acc[camelKey] = value;
      return acc;
    }, {}) as T;
  }
  return obj;
}