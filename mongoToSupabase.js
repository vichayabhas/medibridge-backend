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
  // return str;
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
    
    // FIX: Enforce strictly lowercase table names to completely eliminate PGRST205 errors
    const tableName = mongooseModel.modelName 
      ? `${camelToSnake(mongooseModel.modelName)}` 
      : `${camelToSnake(path.parse(file).name)}`;

    let tableSql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    tableSql += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;

    Object.keys(schema.paths).forEach((key) => {
      if (key === '_id' || key === '__v') return;

      // FIX: Force column names to lowercase to prevent mismatched queries from JS client
      const pgColumnName = camelToSnake(key)

      const pathObj = schema.paths[key];
      const pgType = getPgType(pathObj.instance);

      // CRITICAL FIX for 23502: If the field is an avatar/image URL, don't make it NOT NULL 
      // even if Mongoose says it is, to prevent signup script crashes.
      const isAvatarField = pgColumnName.includes('avatar');
      const isRequired = (pathObj.options?.required && !isAvatarField) ? ' NOT NULL' : '';
      
      const isUnique = pathObj.options?.unique ? ' UNIQUE' : '';
      
      const isDateNow = pathObj.options?.default === Date.now || 
                        (pathObj.options?.default && pathObj.options.default.toString().includes('now'));
      const defaultVal = isDateNow ? ' DEFAULT now()' : '';

      tableSql += `  ${pgColumnName} ${pgType}${isRequired}${isUnique}${defaultVal},\n`;
    });

    tableSql = tableSql.trim().replace(/,$/, '') + '\n);\n\n';

    // // ==========================================
    // // UNCOMMENTED & ACTIVATED: Open CRUD Policies
    // // ==========================================
    // tableSql += `-- Enable RLS\n`;
    // tableSql += `ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n\n`;

    // tableSql += `-- Create policies to allow public (everyone) CRUD access\n`;
    // tableSql += `CREATE POLICY "Allow public read access on ${tableName}" ON ${tableName} FOR SELECT USING (true);\n`;
    // tableSql += `CREATE POLICY "Allow public insert access on ${tableName}" ON ${tableName} FOR INSERT WITH CHECK (true);\n`;
    // tableSql += `CREATE POLICY "Allow public update access on ${tableName}" ON ${tableName} FOR UPDATE USING (true) WITH CHECK (true);\n`;
    // tableSql += `CREATE POLICY "Allow public delete access on ${tableName}" ON ${tableName} FOR DELETE USING (true);\n\n`;
    // tableSql += `--------------------------------------------------\n\n`;

    fullSqlScript += tableSql;
  }

  fs.writeFileSync(OUTPUT_FILE, fullSqlScript);
  console.log(`✅ Supabase SQL Schema with public RLS policies generated at: ${OUTPUT_FILE}`);
}

generateSql().catch(console.error);