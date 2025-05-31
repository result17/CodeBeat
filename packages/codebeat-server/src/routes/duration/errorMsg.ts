export enum GrandTotalSchemaMsg {
  InvalidText = 'Duration must be in format "X min(s)" or "X hr(s) Y min(s)" with minutes 0-59',
  InvalidTotalMs = 'totalMs must be greater than or equal to sum of other fields',
}