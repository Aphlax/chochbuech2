import {Db} from "mongodb";
import {createRequire} from "module";

const require = createRequire(import.meta.url);
const {Jimp} = require('jimp');

// https://www.mongodb.com/docs/manual/reference/command/aggregate/


export async function listRecipes(db: Db, category: string) {
  if (category == 'all') {
    return await db.collection('recipes').aggregate([
      {$set: {id: "$_id"}}, {$sort: {id: 1}}, {$project: {_id: 0}},
    ]).toArray();
  }

  let limit = 10;
  if (category == 'menu') {
    category = {$in: ['easy', 'hard']} as any;
    limit = 40;
  }

  return await db.collection('recipes').aggregate([
    {$match: {category, archived: false}},
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
        {$match: {archived: false}},
        {$set: {id: "$_id"}},
        {$sort: {name: 1}},
        {$project: {_id: 0}},
      ]).toArray();
  }

  const tag = TAGS.find(t => t.synonyms.includes(lowerQuery));
  if (tag) {
    return await db.collection('recipes').aggregate([
      {$match: {tags: tag.value, archived: false}},
      {$set: {order: {$rand: {}}, id: "$_id"}},
      {$sort: {order: 1}},
      {$limit: 10},
      {$project: {order: 0, _id: 0}},
    ]).toArray();
  }

  // See https://docs.atlas.mongodb.com/atlas-search/operators/.
  return await db.collection('recipes').aggregate([
    {
      $search: {
        index: 'autocomplete-de',
        autocomplete: {path: 'name', query: query, fuzzy: {maxEdits: 1, prefixLength: 1}},
      }
    },
    {$set: {id: "$_id"}},
    {$project: {_id: 0}},
  ]).toArray();
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];
const RECIPE_FIELDS = ['id', 'name', 'ingredients', 'steps', 'category', 'tags', 'archived'];

export function validSaveRecipeRequest(body: any, file: any) {
  return body && Object.keys(body).every(key => RECIPE_FIELDS.includes(key)) &&
    (!body.id || !isNaN(body.id)) &&
    typeof body.name == 'string' && body.name.length && body.name.length < 100 &&
    typeof body.ingredients == 'string' && body.ingredients.length && body.ingredients.length < 1000 &&
    typeof body.steps == 'string' && body.steps.length && body.steps.length < 3000 &&
    ['easy', 'hard', 'dessert', 'starter'].includes(body.category) &&
    typeof body.tags == 'string' && (body.tags == '' ||
      body.tags.split(',').every((tag: string) => TAGS.some(t => t.value == tag))) &&
    ['true', 'false'].includes(body.archived) &&
    (!file || ALLOWED_MIME_TYPES.includes(file.mimetype)) && !!(file || body.id);
}

export async function saveRecipe(db: Db, body: any, file: any) {
  if (body.id) { // Update existing recipe.
    body.id = Number(body.id);
    const result = await db.collection('recipes')
      .updateOne({_id: body.id}, {$set: unassign(sanitizeRecipe(body), 'id')});
    if (result.matchedCount == 0)
      return {status: 400, message: "Unable to find recipe to update."};
  } else { // Create new recipe.
    const recipeUID = (await db.collection('values').findOneAndUpdate(
      {_id: 'recipeUID' as any}, {$inc: {value: 1}}, {upsert: true}))?.['value'].value;
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
    ...recipe,
    ingredients: sanitizeStringItems(recipe.ingredients),
    steps: sanitizeStringItems(recipe.steps),
    tags: typeof recipe.tags != 'string' || recipe.tags == '' ? [] : recipe.tags.split(','),
    archived: recipe.archived == true || recipe.archived == 'true',
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
