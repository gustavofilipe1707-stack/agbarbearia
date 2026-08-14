import React, { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { changePassword, getCurrentUsername } from "./adminAuth.js";

export default function AdminAccount() {
  const [currentUsername, setCurrentUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCurrentUsername().then((u) => {
      setCurrentUsername(u);
      setNewUsername(u);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("A confirmação não bate com a nova senha.");
      return;
    }
    setSaving(true);
    try {
      await changePassword(currentPassword, newUsername, newPassword);
      setSuccess("Senha atualizada com sucesso.");
      setCurrentUsername(newUsername.trim());
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err.message === "SENHA_ATUAL_INCORRETA") setError("Senha atual incorreta.");
      else if (err.message === "USUARIO_INVALIDO") setError("Informe um usuário válido.");
      else if (err.message === "SENHA_INVALIDA") setError("A nova senha precisa ter pelo menos 4 caracteres.");
      else setError("Não foi possível salvar agora. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-sm">
      <h3 className="text-lg mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
        ACESSO DO ADMIN
      </h3>
      <p className="text-xs text-[#9B9285] mb-6">Usuário atual: {currentUsername}</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs uppercase tracking-wide text-[#9B9285] block mb-1">Usuário</label>
          <input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full bg-[#171310] border border-[#2E2620] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9962C]"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-[#9B9285] block mb-1">Senha atual</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-[#171310] border border-[#2E2620] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9962C]"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-[#9B9285] block mb-1">Nova senha</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[#171310] border border-[#2E2620] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9962C]"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-[#9B9285] block mb-1">Confirmar nova senha</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[#171310] border border-[#2E2620] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#C9962C]"
          />
        </div>

        {error && <p className="text-[#E6897B] text-sm">{error}</p>}
        {success && <p className="text-[#C9962C] text-sm">{success}</p>}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium bg-[#C9962C] text-[#14100D] hover:bg-[#E6B85C] transition-colors disabled:opacity-50"
        >
          <KeyRound size={16} /> {saving ? "Salvando…" : "Salvar"}
        </button>
      </form>
    </div>
  );
}
