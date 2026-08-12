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
2. Vá na aba **Regras** e cole:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /bookings/{bookingId} {
         allow read: if true;
         allow create: if request.resource.data.name is string
                       && request.resource.data.name.size() > 0
                       && request.resource.data.name.size() < 100;
         allow update, delete: if false;
       }
     }
   }
   ```

   Isso deixa qualquer pessoa **ver** os horários (necessário pro site
   funcionar) e **criar** uma reserva nova, mas ninguém consegue
   apagar ou sobrescrever uma reserva já feita por outra pessoa — nem
   pelo site, nem tentando chamar a API por fora. Se precisar cancelar
   um horário manualmente, dá pra apagar o documento direto pela aba
   **Dados** do console.
3. Clique em **Publicar**.

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

O app ainda não tem um painel separado para o barbeiro acompanhar a
agenda — hoje, pra ver as reservas, é preciso abrir a aba **Dados** do
Firestore no console do Firebase. Se quiser uma telinha própria com a
lista de horários marcados, dá pra construir depois.
