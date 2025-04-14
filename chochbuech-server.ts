import express from 'express';
import {listRecipes, saveRecipe, searchRecipes, validSaveRecipeRequest} from "./chochbuech-service";
import {createRequire} from "module";

const require = createRequire(import.meta.url);
const nconf = require('nconf');
const {MongoClient} = require('mongodb');
const multer = require('multer');


export async function ChochbuechServer(server: express.Express) {
  nconf.argv().file('keys', 'keys.json').file('config', 'config.json').env();

  const mongoUser = nconf.get('mongoUser');
  const mongoPass = nconf.get('mongoPass');
  const mongoUrl = nconf.get('mongoUrl');
  const mongoDb = nconf.get('mongoDb');
  const adminKey = nconf.get('adminKey');

  const client =
    await MongoClient.connect(`mongodb+srv://${mongoUser}:${mongoPass}@${mongoUrl}`);
  const db = client.db(mongoDb);

  server.get('/recipe/recipe:id', async function (req, res) {
    if (isNaN(req.params['id'] as any)) return res.sendStatus(400);
    const recipe = await db.collection('recipes').findOne({_id: Number(req.params['id']) as any});
    if (!recipe) return res.sendStatus(404);
    return res.json(unassign({...recipe, id: recipe._id}, '_id'));
  });

  server.get('/listRecipes', async function (req, res) {
    const category = req.query['category'] as string;
    if (!['easy', 'hard', 'dessert', 'starter', 'all'].includes(category))
      res.sendStatus(400);
    else
      res.json(await listRecipes(db, category));
  });

  server.get('/images/recipe:id.(jpg|png)', async function (req, res) {
    if (isNaN(req.params['id'] as any)) return res.sendStatus(400);
    const image = await db.collection('images').findOne({_id: Number(req.params['id']) as any});
    if (!image) return res.sendStatus(404);
    return res.type(image['mimeType']).send(image['data'].buffer);
  });

  server.get('/properties', function (req, res) {
    const canEdit = (req.headers.cookie || '').indexOf('adminKey=' + adminKey) != -1;
    res.json({canEdit});
  })

  const upload = multer({storage: multer.memoryStorage()});
  server.post('/save', upload.single('image'), async function (req: any, res) {
    try {
      if ((req.headers.cookie || '').indexOf('adminKey=' + adminKey) == -1)
        return res.sendStatus(403);
      if (!validSaveRecipeRequest(req.body, req.file)) return res.sendStatus(400);
      const result = await saveRecipe(db, req.body, req.file);
      return result.status == 200 ?
        res.json({id: result.id}) :
        res.status(result.status).send(result.message || "Error.");
    } catch (e: any) {
      return res.status(500).send(e.name + ': ' + e.message || "Error.");
    }
  });

  server.get('/look', async function (req, res) {
    if (typeof req.query['for'] != 'string' || !req.query['for'].length)
      return res.sendStatus(400);
    return res.json(await searchRecipes(db, req.query['for']));
  });
}

function unassign(obj: Object, ...names: string[]) {
  names.forEach(name => delete (obj as any)[name]);
  return obj;
}
