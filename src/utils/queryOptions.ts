export interface QueryOptions {
  page: number;
  perPage: number;
  sort: Record<string, 1 | -1>;
  fields?: string[];
  expand?: string[];
  skipTotal: boolean;
  isRandomSort: boolean;
}

// Parse PocketBase URL query options: page, perPage, sort, fields, expand, skipTotal
export function parseQueryOptions(query: Record<string, any>): QueryOptions {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const rawPerPage = parseInt(query.perPage || '30', 10);
  const perPage = Math.min(500, Math.max(1, rawPerPage));
  const skipTotal = query.skipTotal === 'true' || query.skipTotal === true;

  const sort: Record<string, 1 | -1> = {};
  let isRandomSort = false;

  if (typeof query.sort === 'string' && query.sort.trim()) {
    const parts = query.sort.split(',').map((s: string) => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part === '@random') {
        isRandomSort = true;
      } else if (part.startsWith('-')) {
        const field = part.substring(1);
        sort[field === 'id' ? '_id' : field] = -1;
      } else {
        const field = part.startsWith('+') ? part.substring(1) : part;
        sort[field === 'id' ? '_id' : field] = 1;
      }
    }
  } else {
    sort.created = -1;
  }

  const fields = typeof query.fields === 'string' && query.fields.trim()
    ? query.fields.split(',').map((f: string) => f.trim()).filter(Boolean)
    : undefined;

  const expand = typeof query.expand === 'string' && query.expand.trim()
    ? query.expand.split(',').map((e: string) => e.trim()).filter(Boolean)
    : undefined;

  return {
    page,
    perPage,
    sort,
    fields,
    expand,
    skipTotal,
    isRandomSort,
  };
}

