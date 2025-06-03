import { createClient } from "@supabase/supabase-js";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import * as dotenv from "dotenv";
// import { algoliasearch } from "algoliasearch";
// TypeScript-Helpers
import path from "path";
dotenv.config();

// Supabase Setup
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Algolia Setup
const ALGOLIA_APPLICATION_ID = process.env.ALGOLIA_APPLICATION_ID!;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY!;
const INDEX_NAME = "ffbsearch-test";

// Configuration
const BATCH_SIZE = 1000;
const WORKER_COUNT = 4;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // in ms

// -------------------------
// Interfaces for Supabase Tables
// -------------------------
interface Hauptartikeldaten {
  UNIT_CODE?: string;
  PART_NO: string;
  DESCRIPTION: string;
  INFO_TEXT?: string;
  WEIGHT_NET?: string;
  UOM_FOR_WEIGHT_NET?: string;
}

interface ReferenzArtikelMerkmale {
  KEY_VALUE: string;
  TECHNICAL_SPEC_NO: string;
  TECHNICAL_CLASS: string;
}

interface Merkmalsdaten {
  PART_NO: string;
  TECHNICAL_SPEC_NO: string;
  TECHNICAL_CLASS: string;
  ATTRIBUTE: string;
  VALUE_TEXT: string;
  INFO: string;
}

interface Location {
  LOCATION_ID: string;
  LOCATION_NAME: string;
}

// -------------------------
// Existing Article interface (intermediate step)
// -------------------------
interface Article {
  articleNo: string;
  description: string;
  infoText: string;
  weight?: number;
  weightUnit?: string;
  properties?: Array<{ name: string; value: string; technicalClassName: string; info?: string }>;
  stocks?: Array<{ qty: number; warehouse: string; lastCountDate: string; unit?: string; locationId?: string }>;
  image: string;
}

// -------------------------
// New ProductRecord interface for Algolia
// -------------------------
interface ProductRecord {
  objectID: string;
  articleNo: string;
  description: string;
  infoText: string;
  searchableText: string;
  weight?: number;
  weightUnit?: string;
  properties: Array<{ name: string; value: string; technicalClassName: string; info?: string }>;
  categories: string[];
  totalStock: number;
  inStock: boolean;
  stockDetails: Array<{ warehouse: string; qty: number; lastCountDate: string; unit?: string; locationId?: string }>;
}

// -------------------------
// Helper: Remove keys with null/undefined/empty values
// -------------------------
function cleanObject<T extends object>(obj: T): Partial<T> {
  const cleaned = {} as Partial<T>;
  for (const key in obj) {
    const value = (obj as any)[key];
    if (value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (key === "infoText" && typeof value === "string" && value.toUpperCase() === "NULL") continue;
    if (key === "_score") continue;
    cleaned[key] = value;
  }
  return cleaned;
}

// -------------------------
// Helper: Safely trim text values
// -------------------------
const safeTrim = (value?: string | null): string => (typeof value === "string" ? value.trim() : "");

// -------------------------
// Helper to safely clean text values for searchableText
// -------------------------
const safeText = (text?: string): string => {
  const trimmed = safeTrim(text);
  return trimmed.toLowerCase() === "null" ? "" : trimmed;
};

// -------------------------
// New Transformation Function: Article -> ProductRecord
// -------------------------
function transformArticleToProductRecord(article: Article): ProductRecord {
  const propTexts = article.properties ? article.properties.map((p) => safeText(`${p.name} ${p.value}`)) : [];
  const searchableText = [safeText(article.description), safeText(article.infoText)]
    .concat(propTexts)
    .filter(Boolean)
    .join(" ");

  const categories = article.properties
    ? Array.from(new Set(article.properties.map((p) => safeTrim(p.technicalClassName))))
    : [];

  const totalStock = article.stocks ? article.stocks.reduce((sum, stock) => sum + stock.qty, 0) : 0;
  const inStock = totalStock > 0;

  return {
    objectID: article.articleNo,
    articleNo: article.articleNo,
    description: article.description,
    infoText: article.infoText,
    searchableText,
    weight: article.weight,
    weightUnit: article.weightUnit,
    properties: article.properties || [],
    categories,
    totalStock,
    inStock,
    stockDetails: article.stocks || [],
  };
}

// -------------------------
// Retry Helper
// -------------------------
async function retryAsync<T>(fn: () => Promise<T>, retries = MAX_RETRIES, delay = RETRY_DELAY): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error("Max retries reached");
}

// -------------------------
// Helper Functions for Chunked Queries
// -------------------------
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

async function fetchInChunks(table: string, column: string, values: string[], chunkSize: number = 200): Promise<any[]> {
  const chunks = chunkArray(values, chunkSize);
  let results: any[] = [];
  for (const chunk of chunks) {
    const { data, error } = await supabase.from(table).select('*').in(column, chunk);
    if (error) console.error(error);
    else results = results.concat(data!);
  }
  return results;
}

async function fetchReferenzData(keyValues: string[]): Promise<ReferenzArtikelMerkmale[]> {
  return fetchInChunks('__technical_object_reference_tab', 'KEY_VALUE', keyValues) as any;
}

async function fetchMerkmalsData(technicalSpecNos: string[]): Promise<Merkmalsdaten[]> {
  return fetchInChunks('__technical_specification_tab', 'TECHNICAL_SPEC_NO', technicalSpecNos) as any;
}

async function fetchAttributeMapping(attributes: string[]): Promise<any[]> {
  return fetchInChunks('__mapping_attribute_description', 'ATTRIBUTE', attributes, 50);
}

async function fetchArtikelbestand(partNos: string[]): Promise<any[]> {
  return fetchInChunks('__inventory_part_in_stock_tab', 'PART_NO', partNos);
}

async function fetchLocations(contracts: string[]): Promise<Location[]> {
  return fetchInChunks('__locations', 'LOCATION_ID', contracts) as any;
}

// -------------------------
// Assemble Articles with Joins
// -------------------------
async function assembleArticles(hauptData: Hauptartikeldaten[]): Promise<Article[]> {
  const partNos = hauptData.map((row) => safeTrim(row.PART_NO));
  const keyValues = partNos.map((p) => `${p}^`);

  const referenzData = await fetchReferenzData(keyValues);
  const technicalSpecNos = Array.from(new Set(referenzData.map((r) => safeTrim(r.TECHNICAL_SPEC_NO))));
  const merkmalsData = await fetchMerkmalsData(technicalSpecNos);
  const technicalClasses = Array.from(
    new Set(merkmalsData.map((m) => safeTrim(m.TECHNICAL_CLASS)))
  );
  const { data: techClassMapping } = await supabase
    .from('__mapping_technical_class_description')
    .select('*')
    .in('TECHNICAL_CLASS', technicalClasses);

  const attributes = Array.from(new Set(merkmalsData.map((m) => safeTrim(m.ATTRIBUTE))));
  const attributeMapping = await fetchAttributeMapping(attributes);

  const artikelbestandData = await fetchArtikelbestand(partNos);
  const contracts = Array.from(new Set(artikelbestandData.map((ab) => safeTrim(ab.CONTRACT))));
  const locationsData = await fetchLocations(contracts);
  const locationMap = new Map<string, Location>();
  locationsData.forEach((loc) => locationMap.set(safeTrim(loc.LOCATION_ID), loc));

  return hauptData.map((haupt) => {
    const articleNo = safeTrim(haupt.PART_NO);
    const description = safeTrim(haupt.DESCRIPTION);
    const infoText = safeTrim(haupt.INFO_TEXT);
    const weight = haupt.WEIGHT_NET ? parseFloat(safeTrim(haupt.WEIGHT_NET)) : undefined;
    const weightUnit = haupt.UOM_FOR_WEIGHT_NET ? safeTrim(haupt.UOM_FOR_WEIGHT_NET) : undefined;
    const image = `https://admin.api.ffbsearch.aifano.com/storage/v1/object/public/ffbsearch/${articleNo}.jpg`;

    const referenz = referenzData.find((r) => safeTrim(r.KEY_VALUE) === `${articleNo}^`);
    let properties: Article['properties'] = [];

    if (referenz) {
      const matchingMerkmals = merkmalsData.filter((m) =>
        safeTrim(m.TECHNICAL_SPEC_NO) === safeTrim(referenz.TECHNICAL_SPEC_NO)
      );

      properties = matchingMerkmals.map((m) => {
        const techMapping = techClassMapping?.find(
          (tm) => safeTrim(tm.TECHNICAL_CLASS) === safeTrim(m.TECHNICAL_CLASS)
        );
        const attributeMap = attributeMapping.find(
          (am) => safeTrim(am.ATTRIBUTE) === safeTrim(m.ATTRIBUTE)
        );

        return {
          name: attributeMap ? safeTrim(attributeMap.DESCRIPTION) : safeTrim(m.ATTRIBUTE),
          value: safeTrim(m.VALUE_TEXT),
          technicalClassName: techMapping ? safeTrim(techMapping.DESCRIPTION) : safeTrim(m.TECHNICAL_CLASS),
          info: safeTrim(m.INFO) || undefined,
        };
      });
    }

    const stocks = artikelbestandData
      .filter((ab) => safeTrim(ab.PART_NO) === articleNo)
      .map((ab) => {
        const loc = locationMap.get(safeTrim(ab.CONTRACT));
        const qty = parseFloat(ab.QTY_ONHAND.replace(',', '.'));
        return {
          qty,
          warehouse: loc ? safeTrim(loc.LOCATION_NAME) : 'unbekannt',
          lastCountDate: ab.LAST_COUNT_DATE,
          unit: haupt.UNIT_CODE ? safeTrim(haupt.UNIT_CODE) : undefined,
          locationId: loc ? safeTrim(loc.LOCATION_ID) : undefined,
        };  
      });

    return { articleNo, description, infoText, weight, weightUnit, properties, stocks, image };
  });
}

// -------------------------
// Worker Thread Code for Algolia
// -------------------------
if (!isMainThread) {
  (async () => {
    // const client = algoliasearch(ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY);
    const records = (workerData.articles as Article[]).map(transformArticleToProductRecord);

    console.log(JSON.stringify(records));

    try {
    //   await client.saveObjects({
    //     indexName: INDEX_NAME,
    //     objects: records as unknown as Record<string, unknown>[]
    //   });
      parentPort?.postMessage({ status: 'success', count: records.length });
    } catch (error) {
      parentPort?.postMessage({ status: 'error', error });
    }
  })();
}

// -------------------------
// Process Batch using Worker Threads
// -------------------------
async function processBatch(articles: Article[], batchNumber: number) {
  const chunkSize = Math.ceil(articles.length / WORKER_COUNT);
  const workers: Promise<any>[] = [];
  for (let i = 0; i < WORKER_COUNT; i++) {
    const chunk = articles.slice(i * chunkSize, (i + 1) * chunkSize);
    if (chunk.length === 0) continue;
    const workerFile = path.resolve(__dirname, __filename);
    const worker = new Worker(workerFile, { workerData: { articles: chunk }, execArgv: ['-r', 'ts-node/register'] });
    const promise = new Promise((resolve, reject) => {
      worker.on("message", (msg) => resolve(msg));
      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        else resolve(null);
      });
    });
    workers.push(promise);
  }

  return Promise.all(workers);
}

// -------------------------
// Main Batch Job
// -------------------------
async function runBatchJob() {
  let lastProcessedPartNo: string | null = null;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from('__part_catalog_tab')
      .select('PART_NO, DESCRIPTION, INFO_TEXT, WEIGHT_NET, UOM_FOR_WEIGHT_NET, UNIT_CODE')
      .order('PART_NO', { ascending: true })
      .limit(BATCH_SIZE);

    if (lastProcessedPartNo) {
      query = query.gt('PART_NO', lastProcessedPartNo);
    }

    const { data: hauptData, error: hauptError } = await query;
    if (hauptError || !hauptData || hauptData.length === 0) break;

    const articles = await assembleArticles(hauptData);
    console.log(`Processing batch with ${articles.length} products.`);
    await processBatch(articles, 0);

    lastProcessedPartNo = safeTrim(hauptData[hauptData.length - 1].PART_NO);

    hasMore = hauptData.length === BATCH_SIZE;
  }

  console.log('Batch job completed.');
  process.exit(0);
}

if (isMainThread) {
  runBatchJob().catch(err => console.error('Error in main:', err));
}
