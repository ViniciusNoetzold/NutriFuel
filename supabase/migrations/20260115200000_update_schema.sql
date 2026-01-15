-- Add home_layout_order and favorite_recipes to profiles
ALTER TABLE public.profiles ADD COLUMN home_layout_order JSONB DEFAULT '["macros", "hydration", "sleep", "meals"]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN favorite_recipes TEXT[] DEFAULT '{}';

-- Ensure meal_plans can handle multiple entries (it already has an ID, so duplicate date/type is allowed by default unless there is a unique constraint)
-- Let's check for constraints. The context shows `match({ user_id, date, type })` in delete, which implies we might need to be careful.
-- If we want multiple recipes per meal slot, we should allow multiple rows with same user_id, date, type. 
-- The current code uses `match({ user_id: authUser.id, date, type })` for updates/deletes, which might affect all items in that slot.
-- We should probably manage items by ID if possible, but the store uses date/type lookup often.
-- For "Multi-Item Meal Support", we need to ensure we can identify specific entries. 
-- The current store `mealPlan` is `MealSlot[]` where `MealSlot` has `recipeId`.
-- If we have multiple recipes for same date/type, `mealPlan.find(s => ...)` returns the first one.
-- We need to update logic to `filter` instead of `find`.

