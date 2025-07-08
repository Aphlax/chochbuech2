export interface Recipe {
  id: number;
  name: string;
  image: string;
  ingredients: string;
  steps: string;
  category: string;
  tags: string[];
  archived: boolean;
  author?: string;
}

export const EMPTY_RECIPE = {
  id: undefined,
  name: '',
  image: 'images/take-picture.png',
  ingredients: '',
  steps: '',
  category: '',
  tags: [],
  archived: false,
} as unknown as Recipe;

export const RECIPE_CATEGORIES = {
  easy: 'easy',
  hard: 'hard',
  dessert: 'dessert',
  starter: 'starter'
};

interface IngredientGroup {
  name: string;
  items: string[];
}

export interface ActionString {
  type: number;
  value: string;
  href?: string;
}

export interface RecipeDisplay {
  ingredientGroups: IngredientGroup[];
  preparation: string;
  steps: string[];
  notes: ActionString[];
}

export function recipeDisplay(recipe: Recipe): RecipeDisplay {
  const ingredientGroups = recipe.ingredients.split('--').map((g, i) => g ? ({
    name: i ? g.substring(0, g.indexOf('\n')).trim() : '',
    items: g.split('\n').filter((item, j) => item && (!i || j)),
  }) : undefined).filter((g): g is IngredientGroup => !!g);

  const prepText = 'Vorbereitung: ';
  const prepIndex = recipe.steps.startsWith(prepText) ? recipe.steps.indexOf('\n') : 0;

  let noteIndex = recipe.steps.indexOf('\n\n'), notes: ActionString[] = [];
  if (noteIndex == -1) noteIndex = recipe.steps.length;
  const noteString = recipe.steps.substring(noteIndex + 2);
  let regex = /([^[]+)(?:\[([^\]]+)]\(([^)]*)\))?/g, match;
  while (match = regex.exec(noteString)) {
    notes.push({type: 0, value: match[1]});
    if (match[2]) notes.push({type: 1, value: match[2], href: match[3]});
  }

  return {
    ingredientGroups,
    preparation: prepIndex ? recipe.steps.substring(prepText.length, prepIndex) : '',
    steps: recipe.steps.substring(prepIndex, noteIndex).split('\n').filter(s => s),
    notes,
  };
}
