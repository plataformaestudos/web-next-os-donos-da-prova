import HttpClient from '@/util/http-client/fetch-client.util';
import { createClient } from '@/util/supabase/client';

export async function logoutClient() {
  // First revoke the backend session and expire the API/shared-domain cookie.
  // A failure must keep the user on the current page so logout can be retried.
  await HttpClient.fetch('/auth/logout', { method: 'POST', cache: 'no-store' }, false);
  const response = await fetch('/auth/logout', {
    method: 'POST', credentials: 'same-origin', cache: 'no-store',
  });
  if (!response.ok) throw new Error('Não foi possível limpar a sessão do navegador. Tente sair novamente.');
  // Supabase Auth is separate from the application's backend session.
  await createClient().auth.signOut({ scope: 'local' }).catch(() => undefined);
}
