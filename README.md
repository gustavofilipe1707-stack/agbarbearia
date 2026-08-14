# AGBARBEARIA — Site de agendamento

## Configurar o Firestore (banco de dados compartilhado)

Os agendamentos agora ficam salvos no Firebase (Firestore), então todo
mundo — cliente pelo celular, barbeiro pelo computador — vê a mesma
agenda em tempo real. Antes de publicar, faça isso uma vez no
[console do Firebase](https://console.firebase.google.com/), no projeto
`agbarbearia-f5ddc`:

1. No menu lateral, abra **Firestore Database** → **Criar banco de
   dados**. Escolha um local (ex: `southamerica-east1`) e comece em
   **modo de produção**.
2. Vá na aba **Regras** e cole o conteúdo do arquivo [`firestore.rules`](firestore.rules)
   deste repositório.
3. Clique em **Publicar**.

   Essas regras deixam qualquer pessoa **ver** os horários e **criar**
   uma reserva nova (necessário pro site funcionar), e deixam as
   coleções usadas pelo painel admin (`historico`, `settings`, e
   editar/cancelar em `bookings`) abertas para leitura e escrita. Isso
   é uma escolha consciente: o projeto está no plano gratuito (Spark),
   e login de verdade (Firebase Authentication) exige o plano pago
   (Blaze) — o uso continuaria gratuito nessa escala, mas exige
   cadastrar cartão. Enquanto isso, a proteção do painel admin é só a
   tela de login (usuário/senha em `src/admin/adminAuth.js`); alguém
   com conhecimento técnico poderia, em teoria, editar o banco direto
   pela API sem passar pelo site. Se algum dia quiser fechar essa
   brecha, dá pra migrar pra Firebase Auth de verdade e travar as
   regras por `request.auth`.

## Como publicar (GitHub + Vercel)

1. Crie um repositório novo no GitHub (ex: `agbarbearia`) e envie todos os
   arquivos desta pasta para ele (arrastar e soltar funciona direto pelo
   site do GitHub).
2. Entre em [vercel.com](https://vercel.com), clique em **Add New Project**
   e selecione esse repositório.
3. Deixe as configurações padrão (o Vercel detecta o Vite automaticamente)
   e clique em **Deploy**.
4. Em cerca de 1 minuto você recebe um link público, tipo
   `agbarbearia.vercel.app`.
5. Abra esse link no celular e toque em **"Adicionar à tela de início"**
   para usar como se fosse um app.

## Rodar localmente (opcional)

```
npm install
npm run dev
```

## Sobre os agendamentos

Os horários marcados ficam salvos no Firestore (configuração em
`src/firebase.js`), compartilhados entre todos os aparelhos em tempo
real — assim que alguém marca um horário, ele já aparece bloqueado
pra qualquer outra pessoa acessando o site, em qualquer celular ou
computador.

## Painel do administrador

Acesse `/admin` no site (ex: `agbarbearia.vercel.app/admin`).

- **Usuário:** `agbarbearia`
- **Senha:** `barbearia`

(login definido em `src/admin/adminAuth.js`, dá pra trocar direto no código.)

O painel tem três abas:

- **Agenda** — lista os horários esporádicos e fixos marcados, com nome,
  telefone e serviço. Cada reserva tem dois botões: **Atendido** (registra
  o corte no histórico, usado nos relatórios) e **Cancelar** (libera o
  horário).
- **Relatórios** — cortes e faturamento do mês atual, filtro por período
  (ex: "esta semana"), busca por cliente, e ranking dos top 10 clientes
  por número de cortes.
- **Configurações** — editar o preço de cada serviço, e abrir/fechar a
  agenda (quando fechada, o site do cliente avisa que não está aceitando
  agendamentos, em vez de mostrar o fluxo de marcação).
