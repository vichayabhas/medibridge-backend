/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mongoose = require('mongoose')
require('./src/env')

const MODELS_DIR = './src/models';
const OUTPUT_FILE = './supabase_schema.sql';

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

    // Dynamic import of the ES Module file
    const module = await import(`file://${filePath}`);
    
    // FIX: Look for the named 'model' export first, then fallback to default, 
    // or unwrap it if it's trapped inside UnifiedModel
    let mongooseModel = module.model || module.default;
    
    if (mongooseModel && mongooseModel.rawModel) { 
      // If your UnifiedModel exposes the raw mongoose model under a property like 'rawModel'
      mongooseModel = mongooseModel.rawModel;
    } else if (mongooseModel && !mongooseModel.schema && mongooseModel.model) {
      // General fallback if it's attached to an instantiation property
      mongooseModel = mongooseModel.model;
    }

    // Safety check: if we still can't find a valid schema configuration, skip
    if (!mongooseModel || (!mongooseModel.schema && !mongooseModel.paths)) {
      console.log(`⚠️ Could not parse Mongoose Schema out of ${file}. Skipping.`);
      continue;
    }

    const schema = mongooseModel.schema || mongooseModel;
    // Set explicit fallback table name using the model name or file name
    const tableName = mongooseModel.modelName ? `${mongooseModel.modelName.toLowerCase()}s` : `${path.parse(file).name.toLowerCase()}s`;

    let tableSql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    tableSql += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;

    Object.keys(schema.paths).forEach((key) => {
      if (key === '_id' || key === '__v') return;

      const pathObj = schema.paths[key];
      const pgType = getPgType(pathObj.instance);

      const isRequired = pathObj.options?.required ? ' NOT NULL' : '';
      const isUnique = pathObj.options?.unique ? ' UNIQUE' : '';
      
      // Handle function assignment structures safely
      const isDateNow = pathObj.options?.default === Date.now || 
                        (pathObj.options?.default && pathObj.options.default.toString().includes('now'));
      const defaultVal = isDateNow ? ' DEFAULT now()' : '';

      tableSql += `  ${key} ${pgType}${isRequired}${isUnique}${defaultVal},\n`;
    });

    tableSql = tableSql.trim().replace(/,$/, '') + '\n);\n\n';
    fullSqlScript += tableSql;
  }

  fs.writeFileSync(OUTPUT_FILE, fullSqlScript);
  console.log(`✅ Supabase SQL Schema generated at: ${OUTPUT_FILE}`);
}

generateSql().catch(console.error);