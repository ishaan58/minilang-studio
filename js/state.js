// ══ SHARED APP STATE ══
// Single mutable object shared across all modules via import reference.
export const AppState = {
  CU:        null,   // current Firebase user: { uid, name, email }
  projs:     [],     // loaded project list
  curP:      null,   // active project
  lastTrace: [],     // last execution trace
  curTab:    'o',    // active console tab ('o' | 't')
};
