/* eslint-disable @typescript-eslint/no-explicit-any */
// caseConverter.ts
import mongoose from 'mongoose';

export function camelToSnake(str: string): string {
  if (str === '_id') return 'id';
  return str.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

export function snakeToCamel(str: string): string {
  if (str === 'id') return '_id';
  return str.replace(/_([a-z0-9])/g, (_, g) => g[1].toUpperCase());
}

// // 1. Safe helper to convert any string (including UUIDs) into a valid 24-character MongoDB ObjectId
// function convertToObjectId(val: any): mongoose.Types.ObjectId | string {
//   if (!val) return val;
//   if (val instanceof mongoose.Types.ObjectId) return val;
  
//   const str = String(val);
  
//   // If it's already a valid 24-character hex string, convert directly
//   if (mongoose.Types.ObjectId.isValid(str)) {
//     return new mongoose.Types.ObjectId(str);
//   }
  
//   // If it's a Supabase UUID (e.g., "123e4567-e89b-12d3-a456-426614174000"), 
//   // strip hyphens and slice it down to 24 hex characters so Mongoose accepts it safely
//   const cleanHex = str.replace(/[^0-9a-fA-F]/g, '');
//   if (cleanHex.length >= 24) {
//     return new mongoose.Types.ObjectId(cleanHex.substring(0, 24));
//   }
  
//   // Fallback pad if string is too short
//   return new mongoose.Types.ObjectId(cleanHex.padEnd(24, '0').substring(0, 24));
// }

// Helper to check if a value looks like a valid MongoDB ObjectId or UUID string
function isIdValue(val: any): boolean {
  if (!val) return false;
  if (val instanceof mongoose.Types.ObjectId) return true;
  
  const str = String(val);
  // Matches standard 24-char hex strings or standard UUID layouts
  return mongoose.Types.ObjectId.isValid(str) || 
         /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
}

// Helper to stringify an ID cleanly for Supabase payload compliance
function stringifyId(val: any): string {
  if (val instanceof mongoose.Types.ObjectId) {
    return val.toString();
  }
  return String(val);
}

// Deeply convert JS object to Postgres snake_case and clean up IDs
export function toSnakeCaseDeep<T = any>(obj: any): T {
  // If it's an array of reference items (e.g., articlesIds: [ObjectId, "string-id"])
  if (Array.isArray(obj)) {
    // If the array contains ID strings or ObjectIds, map them all directly to strings
    if (obj.length > 0 && isIdValue(obj[0])) {
      return obj.map(stringifyId) as any;
    }
    return obj.map(toSnakeCaseDeep) as any;
  }
  
  // If a single field property value is an explicit ObjectId instance
  if (obj instanceof mongoose.Types.ObjectId) {
    return obj.toString() as any;
  }

  if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc: any, key) => {
      acc[camelToSnake(key)] = toSnakeCaseDeep(obj[key]);
      return acc;
    }, {}) as T;
  }
  return obj;
}

function isIdField(key: string): boolean {
  // Catches id, _id, pharmacyId, userIds, etc.
  return key === '_id' || key === 'id' || /Id(s)?$/.test(key);
}

// Converts values safely to a Mongoose ObjectId instance
function convertToObjectId(val: any): mongoose.Types.ObjectId | any {
  if (!val) return val;
  if (val instanceof mongoose.Types.ObjectId) return val;
  
  const str = String(val);
  if (mongoose.Types.ObjectId.isValid(str)) {
    return new mongoose.Types.ObjectId(str);
  }
  
  // Safe fallback padding for non-standard string formats (like UUID sections)
  const cleanHex = str.replace(/[^0-9a-fA-F]/g, '');
  if (cleanHex.length >= 24) {
    return new mongoose.Types.ObjectId(cleanHex.substring(0, 24));
  }
  return new mongoose.Types.ObjectId(cleanHex.padEnd(24, '0').substring(0, 24));
}

// Deeply maps everything to CamelCase and checks camelKey directly
export function toCamelCaseDeep<T = any>(obj: any): T {
  if (Array.isArray(obj)) return obj.map(toCamelCaseDeep) as any;
  
  if (obj !== null && typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((acc: any, key) => {
      const camelKey = snakeToCamel(key);
      let value = obj[key];

      // We evaluate the camelKey directly ('pharmacyId') against our regex matcher
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