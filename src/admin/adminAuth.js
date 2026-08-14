/* Login simples de tela — sem Firebase Auth (exigiria plano pago no projeto).
   Protege o acesso ao painel, mas não ao banco de dados em si: as regras do
   Firestore ficam abertas para leitura/escrita nas coleções do admin. Se um dia
   ativar o plano Blaze, dá pra trocar por login de verdade e travar as regras. */
const SESSION_KEY = "agb-admin-session";
const ADMIN_USERNAME = "agbarbearia";
const ADMIN_PASSWORD = "barbearia";

export function tryLogin(username, password) {
  if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    localStorage.setItem(SESSION_KEY, "1");
    return true;
  }
  return false;
}

export function isLoggedIn() {
  return localStorage.getItem(SESSION_KEY) === "1";
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
