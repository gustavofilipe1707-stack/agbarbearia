/* Login simples de tela — sem Firebase Auth (exigiria plano pago no projeto).
   Protege o acesso ao painel, mas não ao banco de dados em si: as regras do
   Firestore ficam abertas para leitura/escrita nas coleções do admin. Se um dia
   ativar o plano Blaze, dá pra trocar por login de verdade e travar as regras.
   Usuário e senha ficam salvos em settings/adminAuth (editável na aba Conta). */
import { db } from "../firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";

const SESSION_KEY = "agb-admin-session";
const AUTH_REF = ["settings", "adminAuth"];
const DEFAULT_CREDENTIALS = { username: "agbarbearia", password: "barbearia" };

async function getCredentials() {
  const snap = await getDoc(doc(db, ...AUTH_REF));
  const data = snap.data();
  return {
    username: data?.username || DEFAULT_CREDENTIALS.username,
    password: data?.password || DEFAULT_CREDENTIALS.password,
  };
}

export async function tryLogin(username, password) {
  const creds = await getCredentials();
  if (username.trim() === creds.username && password === creds.password) {
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

export async function changePassword(currentPassword, newUsername, newPassword) {
  const creds = await getCredentials();
  if (currentPassword !== creds.password) {
    throw new Error("SENHA_ATUAL_INCORRETA");
  }
  const username = newUsername.trim();
  if (!username) throw new Error("USUARIO_INVALIDO");
  if (!newPassword || newPassword.length < 4) throw new Error("SENHA_INVALIDA");
  await setDoc(doc(db, ...AUTH_REF), { username, password: newPassword }, { merge: true });
}

export async function getCurrentUsername() {
  const creds = await getCredentials();
  return creds.username;
}
