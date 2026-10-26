import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// מוחק את החשבון של המשתמש שמבקש את המחיקה בלבד.
// השרת מאמת את הזהות מול הטוקן של המבקש, ומחייב הקלדה מדויקת של כתובת המייל של החשבון עצמו.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const confirmEmail = typeof body?.confirm_email === 'string' ? body.confirm_email.trim().toLowerCase() : '';
    const ownEmail = String(user.email || '').trim().toLowerCase();
    if (!confirmEmail || !ownEmail || confirmEmail !== ownEmail) {
      return Response.json({ error: 'email_mismatch' }, { status: 400 });
    }

    const authenticated = await base44.auth.isAuthenticated().catch(() => false);
    if (!authenticated) return Response.json({ error: 'unauthorized' }, { status: 401 });

    await base44.asServiceRole.entities.User.delete(user.id);
    return Response.json({ deleted: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}