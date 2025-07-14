import {Db} from "mongodb";
import {createRequire} from "module";

const require = createRequire(import.meta.url);
const {Jimp} = require('jimp');

// https://www.mongodb.com/docs/manual/reference/command/aggregate/
// https://www.mongodb.com/docs/manual/reference/operator/query/

// To update the format of a recipe in the db, go to:
//
// https://cloud.mongodb.com/v2/60ac3027b145744fd08a66b1#clusters
//
// And navigate through "browse collections" -> your collection -> "aggregation",
// then choose your operations, including $set and $merge ($out messes up the index).
//
// Note: If you use the $out aggregation stage to modify a collection with an Atlas Search index,
// you must delete and re-create the search index. If possible, consider using $merge instead of $out.
//
// To create a backup, grab the json response from https://choch-buech.ch/all.
//
// Example:
//
// $set
// {
//   archived: false
// }
//
// $merge
// {
//   into: 'recipes',
//     on: '_id',
//   whenMatched: 'replace',
//   whenNotMatched: 'fail'
// }

export async function listRecipes(db: Db, category: string) {
  if (category == 'all') {
    return await db.collection('recipes').aggregate([
      {$set: {id: "$_id"}}, {$sort: {id: 1}}, {$project: {_id: 0}},
    ]).toArray();
  } else if (category == 'proposed') {
    return await db.collection('recipes').aggregate([
      {$match: {state: 'proposed'}}, {$set: {id: "$_id"}}, {$sort: {id: 1}}, {$project: {_id: 0}},
    ]).toArray();
  }

  let limit = 10;
  if (category == 'menu') {
    category = {$in: ['easy', 'hard']} as any;
    limit = 40;
  }

  return await db.collection('recipes').aggregate([
    {$match: {category, state: 'valid'}},
    {$set: {order: {$rand: {}}, id: "$_id"}},
    {$sort: {order: 1}},
    {$limit: limit},
    {$project: {order: 0, _id: 0}},
  ]).toArray();
}

const TAGS = [
  {value: 'Vegetarisch', synonyms: ['vegetarisch', 'vegi', 'vegan', 'vegetarian']},
  {value: 'Fisch', synonyms: ['fisch', 'fish']},
  {value: 'Fleisch', synonyms: ['fleisch', 'meat']},
  {value: 'Pasta', synonyms: ['pasta', 'nudeln', 'noodle']},
  {value: 'Reis', synonyms: ['reis', 'rice']},
  {value: 'Asiatisch', synonyms: ['asiatisch', 'asian', 'asia', 'chinesisch']}
];

export async function searchRecipes(db: Db, query: string) {
  const lowerQuery = query.toLowerCase();
  if (['all', 'every', 'alle'].includes(lowerQuery)) {
    return await db.collection('recipes')
      .aggregate([
        {$match: {state: 'valid'}},
        {$sort: {name: 1}},
        {$set: {id: "$_id"}},
        {$project: {_id: 0}},
      ]).toArray();
  }

  const tag = TAGS.find(t => t.synonyms.includes(lowerQuery));
  if (tag) {
    return await db.collection('recipes').aggregate([
      {$match: {tags: tag.value, state: 'valid'}},
      {$set: {order: {$rand: {}}, id: "$_id"}},
      {$sort: {order: 1}},
      {$project: {order: 0, _id: 0}},
    ]).toArray();
  }

  // See https://docs.atlas.mongodb.com/atlas-search/operators/.
  return await db.collection('recipes').aggregate([
    {
      $search: {
        index: 'autocomplete-de',
        text: {path: ['name', 'ingredients'], query: query, fuzzy: {maxEdits: 2}},
      }
    },
    {$match: {state: {$ne: 'proposed'}}},
    {$set: {id: "$_id"}},
    {$project: {_id: 0}},
  ]).toArray();
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];
const SAVE_FIELDS = ['mode', 'id', 'name', 'category', 'tags', 'ingredients', 'steps', 'author', 'state'];
const ALLOWED_MODES = ['new', 'edit', 'propose'];
const ALLOWED_STATES = ['valid', 'archived', 'proposed'];

export function validSaveRecipeRequest(body: any, file: any) {
  return body && Object.keys(body).every(key => SAVE_FIELDS.includes(key)) &&
    ALLOWED_MODES.includes(body.mode) &&
    (body.mode == 'edit' ? !isNaN(body.id) : !body.id) &&
    typeof body.name == 'string' && body.name.length && body.name.length < 100 &&
    ['easy', 'hard', 'dessert', 'starter'].includes(body.category) &&
    typeof body.tags == 'string' && (body.tags == '' ||
      body.tags.split(',').every((tag: string) => TAGS.some(t => t.value == tag))) &&
    typeof body.ingredients == 'string' && body.ingredients.length && body.ingredients.length < 1500 &&
    typeof body.steps == 'string' && body.steps.length && body.steps.length < 5000 &&
    ((typeof body.author == 'string' && body.author.length < 15 && body.author.length > 2) || !body.author) &&
    ALLOWED_STATES.includes(body.state) && (body.mode != 'propose' || body.state == 'proposed') &&
    (!file || ALLOWED_MIME_TYPES.includes(file.mimetype)) && (body.mode == 'edit' || !!file);
}

export async function dbProperties(db: Db) {
  const proposedCount = await db.collection('recipes').countDocuments({state: 'proposed'});
  return {proposedCount};
}

export async function saveRecipe(db: Db, body: any, file: any) {
  if (body.mode == 'edit') { // Update existing recipe.
    body.id = Number(body.id);
    const result = await db.collection('recipes')
      .updateOne({_id: body.id}, {$set: unassign(sanitizeRecipe(body), 'id')});
    if (result.matchedCount == 0)
      return {status: 400, message: "Unable to find recipe to update."};
  } else { // Create new recipe.
    let incrementOp = await db.collection('values').findOneAndUpdate(
      {_id: 'recipeUID' as any}, {$inc: {value: 1}}, {upsert: true});
    const recipeUID = incrementOp?.['value'];
    await db.collection('recipes').insertOne(
      {_id: recipeUID, ...sanitizeRecipe(body), image: `images/recipe${recipeUID}.png`});
    body.id = recipeUID;
  }

  if (file) {
    const image = await Jimp.read(file.buffer);

    const size = Math.min(image.bitmap.width, image.bitmap.height);
    if (image.bitmap.width != image.bitmap.height) {
      await image.crop({
        x: (image.bitmap.width - size) / 2,
        y: (image.bitmap.height - size) / 2,
        w: size,
        h: size,
      });
    }
    if (size > 600) {
      await image.resize({w: 600, h: 600});
    }

    const buffer = await image.getBuffer('image/png');
    await db.collection('images').updateOne(
      {_id: body.id},
      {$set: {data: buffer, mimeType: 'image/png'}},
      {upsert: true});
  }
  return {id: body.id, status: 200};
}

function sanitizeRecipe(recipe: any) {
  return {
    ...(recipe.id ? {id: recipe.id} : {}),
    name: recipe.name,
    category: recipe.category,
    tags: typeof recipe.tags != 'string' || recipe.tags == '' ? [] : recipe.tags.split(','),
    ingredients: sanitizeStringItems(recipe.ingredients),
    steps: sanitizeStringItems(recipe.steps),
    ...(recipe.author ? {author: recipe.author} : {}),
    state: recipe.state,
  };
}

function sanitizeStringItems(str: string): string {
  if (str.length && !str.endsWith('\n'))
    return str.replace(/\r\n/g, '\n') + '\n';
  return str.replace(/\r\n/g, '\n');
}

function unassign(obj: Object, ...names: string[]) {
  names.forEach(name => delete (obj as any)[name]);
  return obj;
}
