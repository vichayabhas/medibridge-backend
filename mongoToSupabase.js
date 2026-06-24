/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mongoose = require('mongoose')
require('./src/env')

const MODELS_DIR = './src/models';
const OUTPUT_FILE = './supabase_schema.sql';

export function camelToSnake(str) {
  if (typeof str !== "string") return String(str || "");
  if (str === "_id") return "id";
  return str.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

function getPgType(instance) {
  switch (instance) {
    case 'String': return 'TEXT';
    case 'Number': return 'NUMERIC';
    case 'Boolean': return 'BOOLEAN';
    case 'Date': return 'TIMESTAMPTZ';
    case 'ObjectId': return 'UUID';
    case 'Array': return 'JSONB';
    case 'Mixed':
    case 'Object': return 'JSONB';
    default: return 'TEXT';
  }
}

async function generateSql() {
  if (!fs.existsSync(MODELS_DIR)) {
    console.log(`ℹ️ No models folder found at ${MODELS_DIR}. Skipping.`);
    return;
  }

  let fullSqlScript = `-- Generated Supabase Migration Script\n\n`;
  const files = fs.readdirSync(MODELS_DIR).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(process.cwd(), MODELS_DIR, file);
    console.log(`Processing: ${file}`);

    const module = await import(`file://${filePath}`);

    let mongooseModel = module.model || module.default;

    if (mongooseModel && mongooseModel.rawModel) {
      mongooseModel = mongooseModel.rawModel;
    } else if (mongooseModel && !mongooseModel.schema && mongooseModel.model) {
      mongooseModel = mongooseModel.model;
    }

    if (!mongooseModel || (!mongooseModel.schema && !mongooseModel.paths)) {
      console.log(`⚠️ Could not parse Mongoose Schema out of ${file}. Skipping.`);
      continue;
    }

    const schema = mongooseModel.schema || mongooseModel;

    const tableName = mongooseModel.modelName
      ? `${camelToSnake(mongooseModel.modelName)}s`
      : `${camelToSnake(path.parse(file).name)}s`;

    let tableSql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    tableSql += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;

    Object.keys(schema.paths).forEach((key) => {
      if (key === '_id' || key === '__v') return;

      const pgColumnName = camelToSnake(key);
      const pathObj = schema.paths[key];
      const pgType = getPgType(pathObj.instance);

      const isAvatarField = pgColumnName.includes('avatar');
      const isRequired = (pathObj.options?.required && !isAvatarField) ? ' NOT NULL' : '';
      const isUnique = pathObj.options?.unique ? ' UNIQUE' : '';

      // --- UPGRADED DEFAULT VALUE PARSING LOGIC ---
      let defaultVal = '';
      const isDateNow = pathObj.options?.default === Date.now ||
        pathObj.options?.default?.name === 'now' ||
        (pathObj.options?.default && pathObj.options.default.toString().includes('now')) ||
        (pathObj.options?.default instanceof Date) ||
        (typeof pathObj.options?.default === 'number' && pathObj.instance === 'Date');

      if (isDateNow) {
        defaultVal = ' DEFAULT now()';
      } else if (pathObj.options?.default !== undefined && typeof pathObj.options.default !== 'function') {
        const rawDefault = pathObj.options.default;

        if (Array.isArray(rawDefault)) {
          defaultVal = ` DEFAULT '${JSON.stringify(rawDefault)}'::jsonb`;
        } else if (rawDefault instanceof Map || (rawDefault && typeof rawDefault === 'object' && rawDefault.constructor === Object)) {
          defaultVal = ` DEFAULT '{}'::jsonb`;
        } else if (typeof rawDefault === 'string') {
          defaultVal = ` DEFAULT '${rawDefault.replace(/'/g, "''")}'`;
        } else if (typeof rawDefault === 'boolean' || typeof rawDefault === 'number') {
          defaultVal = ` DEFAULT ${rawDefault}`;
        }
      }
      // ---------------------------------------------

      tableSql += `  ${pgColumnName} ${pgType}${isRequired}${isUnique}${defaultVal},\n`;
    });

    tableSql = tableSql.trim().replace(/,$/, '') + '\n);\n\n';
    fullSqlScript += tableSql;
  }

  fs.writeFileSync(OUTPUT_FILE, fullSqlScript);
  console.log(`✅ Supabase SQL Schema with fully parsed default values generated at: ${OUTPUT_FILE}`);
}

generateSql().catch(console.error);