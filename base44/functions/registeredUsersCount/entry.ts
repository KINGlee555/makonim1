import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let count = 0;
    const pageSize = 200;
    for (let page = 0; page < 50; page++) {
      const users = await base44.asServiceRole.entities.User.list('-created_date', pageSize, page * pageSize);
      count += users.length;
      if (users.length < pageSize) break;
    }
    return Response.json({ count });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}