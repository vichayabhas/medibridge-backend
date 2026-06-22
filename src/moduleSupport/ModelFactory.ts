/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import mongoose from "mongoose";
import {
  camelToSnake,
  toSnakeCaseDeep,
  toCamelCaseDeep,
} from "./caseConverter";
import { isMongo } from "./configTypes";
const dbConfig = { isMongo };

// 🔥 Initialize Supabase ONLY if MongoDB is disabled
let supabase: SupabaseClient | null = null;

if (!dbConfig.isMongo) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

type ExtractModelType<M> = M extends mongoose.Model<infer T, any, any, any> 
  ? T & { 
      _id: mongoose.Types.ObjectId; 
      updateOne: (updateData: Partial<T>) => Promise<any>; 
    } 
  : any;

class UnifiedQuery<T> {
  private projectionString: string | null = null;
  private sortOptions: Record<string, number> | null = null;
  private skipCount: number | null = null;
  private limitCount: number | null = null;

  constructor(
    private isMongo: boolean,
    private mongoQuery: any,
    private supabaseExecutor: (options: {
      projection: string | null;
      sort: Record<string, number> | null;
      skip: number | null;
      limit: number | null;
    }) => Promise<T>,
    private staticUpdateOneReference: (id: any, updateData: any) => Promise<any>
  ) {}

  select(projection: string): this {
    if (this.isMongo) this.mongoQuery.select(projection);
    else this.projectionString = projection;
    return this;
  }

  sort(sortOptions: Record<string, number>): this {
    if (this.isMongo) this.mongoQuery.sort(sortOptions);
    else this.sortOptions = sortOptions;
    return this;
  }

  skip(skip: number): this {
    if (this.isMongo) this.mongoQuery.skip(skip);
    else this.skipCount = skip;
    return this;
  }

  limit(limit: number): this {
    if (this.isMongo) this.mongoQuery.limit(limit);
    else this.limitCount = limit;
    return this;
  }

  then(onfulfilled?: (value: T) => any, onrejected?: (error: any) => any): Promise<any> {
    const execute = async () => {
      let resultData: any;

      if (this.isMongo) {
        const doc = await this.mongoQuery;
        if (!doc) return Array.isArray(doc) ? [] : null;
        resultData = Array.isArray(doc) 
          ? doc.map(d => (typeof d.toObject === 'function' ? d.toObject() : d)) 
          : doc.toObject();
      } else {
        resultData = await this.supabaseExecutor({
          projection: this.projectionString,
          sort: this.sortOptions,
          skip: this.skipCount,
          limit: this.limitCount
        });
      }

      const bindInstanceMethods = (item: any) => {
        if (!item || typeof item !== 'object') return item;
        
        Object.defineProperty(item, 'updateOne', {
          value: async (updatePayload: any) => {
            return await this.staticUpdateOneReference(item._id, updatePayload);
          },
          enumerable: false,
          writable: true,
          configurable: true
        });
        return item;
      };

      if (Array.isArray(resultData)) {
        return resultData.map(bindInstanceMethods);
      } else {
        return bindInstanceMethods(resultData);
      }
    };
    return execute().then(onfulfilled, onrejected);
  }
}

export class UnifiedModel<M extends mongoose.Model<any>> {
  private table: string;
  private mongo: M;

  constructor(mongooseModel: M) {
    this.mongo = mongooseModel;
    const modelName = mongooseModel.modelName;
    this.table = `${camelToSnake(modelName)}s`;
  }

  private parseSupabaseProjection(projection: string | null): string {
    if (!projection) return '*';
    const cleaned = projection.replace(/[+-]/g, '').trim();
    if (projection.startsWith('+') || projection.startsWith('-')) return '*'; 
    return cleaned.split(/\s+/).map(camelToSnake).join(', ');
  }

  /**
   * 1. create
   */
  async create(data: Partial<ExtractModelType<M>>): Promise<ExtractModelType<M>> {
    if (dbConfig.isMongo) {
      const doc = await this.mongo.create(data);
      return doc.toObject() as ExtractModelType<M>;
    } else {
      const supabasePayload = toSnakeCaseDeep(data);
      const { data: result, error } = await supabase!.from(this.table).insert(supabasePayload).select().single();
      if (error) throw error;
      return toCamelCaseDeep<ExtractModelType<M>>(result);
    }
  }

  /**
   * 2. findOne
   */
  findOne(query: Record<string, any> = {}): UnifiedQuery<ExtractModelType<M> | null> {
    const safeQuery = query || {};
    // Only pass reference query string configuration safely; Mongo will not run until awaited
    const mongoQuery = dbConfig.isMongo ? this.mongo.findOne(safeQuery) : null;

    const supabaseExecutor = async (options: any): Promise<ExtractModelType<M> | null> => {
      const columns = this.parseSupabaseProjection(options.projection);
      let builder = supabase!.from(this.table).select(columns);
      
      const snakeQuery = toSnakeCaseDeep(safeQuery);
      Object.keys(snakeQuery).forEach((key) => {
        builder = builder.eq(key, snakeQuery[key]);
      });

      const { data, error } = await builder.limit(1).maybeSingle();
      if (error) throw error;
      return data ? toCamelCaseDeep<ExtractModelType<M>>(data) : null;
    };

    return new UnifiedQuery<ExtractModelType<M> | null>(
      dbConfig.isMongo, 
      mongoQuery, 
      supabaseExecutor, 
      this.findByIdAndUpdate.bind(this)
    );
  }

  /**
   * 3. findById
   */
  findById(id: string | mongoose.Types.ObjectId | null | undefined): UnifiedQuery<ExtractModelType<M> | null> {
    // 🔥 Guard: If ID is not provided, null, or undefined, return a safe null query immediately
    if (!id) {
      return new UnifiedQuery<ExtractModelType<M> | null>(
        dbConfig.isMongo,
        dbConfig.isMongo ? this.mongo.findById(null) : null, // Mongoose handles findById(null) safely by returning null
        async () => null, // Supabase bypass executor path
        this.findByIdAndUpdate.bind(this)
      );
    }

    const mongoQuery = dbConfig.isMongo ? this.mongo.findById(id) : null;

    const supabaseExecutor = async (options: any): Promise<ExtractModelType<M> | null> => {
      const columns = this.parseSupabaseProjection(options.projection);
      const stringId = id instanceof mongoose.Types.ObjectId ? id.toString() : id;

      const { data, error } = await supabase!.from(this.table).select(columns).eq('id', stringId).maybeSingle();
      if (error) throw error;
      return data ? toCamelCaseDeep<ExtractModelType<M>>(data) : null;
    };

    return new UnifiedQuery<ExtractModelType<M> | null>(
      dbConfig.isMongo, 
      mongoQuery, 
      supabaseExecutor, 
      this.findByIdAndUpdate.bind(this)
    );
  }

  /**
   * 4. find
   */
  find(query: Record<string, any> = {}): UnifiedQuery<ExtractModelType<M>[]> {
    const safeQuery = query || {};
    const mongoQuery = dbConfig.isMongo ? this.mongo.find(safeQuery) : null;

    const supabaseExecutor = async (options: {
      projection: string | null;
      sort: Record<string, number> | null;
      skip: number | null;
      limit: number | null;
    }): Promise<ExtractModelType<M>[]> => {
      const columns = this.parseSupabaseProjection(options.projection);
      let builder = supabase!.from(this.table).select(columns);
      const snakeQuery = toSnakeCaseDeep(safeQuery);

      Object.keys(snakeQuery).forEach((key) => {
        builder = builder.eq(key, snakeQuery[key]);
      });

      if (options.sort) {
        Object.keys(options.sort).forEach((key) => {
          const direction = options.sort![key];
          builder = builder.order(camelToSnake(key), { ascending: direction === 1 });
        });
      }

      if (options.skip !== null || options.limit !== null) {
        const from = options.skip || 0;
        if (options.limit !== null) {
          builder = builder.range(from, from + options.limit - 1);
        } else {
          builder = builder.range(from, 999999999);
        }
      }

      const { data, error } = await builder;
      if (error) throw error;
      return (data || []).map(item => toCamelCaseDeep<ExtractModelType<M>>(item));
    };

    return new UnifiedQuery<ExtractModelType<M>[]>(
      dbConfig.isMongo, 
      mongoQuery, 
      supabaseExecutor, 
      this.findByIdAndUpdate.bind(this)
    );
  }

  /**
   * 5. findByIdAndUpdate
   */
  async findByIdAndUpdate(
    id: string | mongoose.Types.ObjectId, 
    updateData: Partial<ExtractModelType<M>>
  ): Promise<ExtractModelType<M> | null> {
    const cleanUpdate = (updateData as any).$set || updateData;

    if (dbConfig.isMongo) {
      const doc = await this.mongo.findByIdAndUpdate(id, cleanUpdate, { new: true });
      return doc ? (doc.toObject() as ExtractModelType<M>) : null;
    } else {
      const stringId = id instanceof mongoose.Types.ObjectId ? id.toString() : id;
      const supabasePayload = toSnakeCaseDeep(cleanUpdate);
      const { data, error } = await supabase!.from(this.table).update(supabasePayload).eq('id', stringId).select().maybeSingle();
      if (error) throw error;
      return data ? toCamelCaseDeep<ExtractModelType<M>>(data) : null;
    }
  }

  /**
   * 6. findOneAndUpdate
   */
  async findOneAndUpdate(
    query: Record<string, any>,
    updateData: Partial<ExtractModelType<M>>
  ): Promise<ExtractModelType<M> | null> {
    const safeQuery = query || {};
    const cleanUpdate = (updateData as any).$set || updateData;

    if (dbConfig.isMongo) {
      const doc = await this.mongo.findOneAndUpdate(safeQuery, cleanUpdate, { new: true });
      return doc ? (doc.toObject() as ExtractModelType<M>) : null;
    } else {
      const snakeQuery = toSnakeCaseDeep(safeQuery);
      const supabasePayload = toSnakeCaseDeep(cleanUpdate);

      let selectBuilder = supabase!.from(this.table).select('id');
      Object.keys(snakeQuery).forEach((key) => {
        selectBuilder = selectBuilder.eq(key, snakeQuery[key]);
      });

      const { data: targetRow, error: findError } = await selectBuilder.limit(1).maybeSingle();
      if (findError) throw findError;
      if (!targetRow) return null;

      const { data, error: updateError } = await supabase!
        .from(this.table)
        .update(supabasePayload)
        .eq('id', targetRow.id)
        .select()
        .maybeSingle();

      if (updateError) throw updateError;
      return data ? toCamelCaseDeep<ExtractModelType<M>>(data) : null;
    }
  }

  /**
   * 7. updateOne
   */
  async updateOne(
    query: Record<string, any>, 
    updateData: Partial<ExtractModelType<M>>
  ): Promise<{ acknowledged: boolean; modifiedCount: number }> {
    if (!updateData) {
      throw new Error(`[UnifiedModel] updateOne requires TWO arguments: .updateOne(filter, updateData).`);
    }

    const safeQuery = query || {};
    const cleanUpdate = (updateData as any).$set || updateData;

    if (dbConfig.isMongo) {
      const res = await this.mongo.updateOne(safeQuery, cleanUpdate);
      return { acknowledged: res.acknowledged, modifiedCount: res.modifiedCount };
    } else {
      const snakeQuery = toSnakeCaseDeep(safeQuery);
      const supabasePayload = toSnakeCaseDeep(cleanUpdate);

      let selectBuilder = supabase!.from(this.table).select('id');
      Object.keys(snakeQuery).forEach((key) => {
        selectBuilder = selectBuilder.eq(key, snakeQuery[key]);
      });

      const { data: targetRow, error: findError } = await selectBuilder.limit(1).maybeSingle();
      if (findError) throw findError;
      if (!targetRow) return { acknowledged: true, modifiedCount: 0 };

      const { error: updateError } = await supabase!.from(this.table).update(supabasePayload).eq('id', targetRow.id);
      if (updateError) throw updateError;
      return { acknowledged: true, modifiedCount: 1 };
    }
  }

  /**
   * 8. countDocuments
   */
  async countDocuments(query: Record<string, any> = {}): Promise<number> {
    const safeQuery = query || {};

    if (dbConfig.isMongo) {
      return await this.mongo.countDocuments(safeQuery);
    } else {
      let builder = supabase!.from(this.table).select('*', { count: 'exact', head: true });
      const snakeQuery = toSnakeCaseDeep(safeQuery);

      Object.keys(snakeQuery).forEach((key) => {
        builder = builder.eq(key, snakeQuery[key]);
      });

      const { count, error } = await builder;
      if (error) throw error;
      return count || 0;
    }
  }
}