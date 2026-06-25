# Estuda+ 🎓

App web gamificado de estudos para **ENEM** e **concursos públicos**. Trilhas de lições,
ofensiva (streak) diária, metas semanais, ranking entre estudantes, questões geradas por
IA e **certificado em PDF** ao concluir cada trilha. Mobile-first (feito pensando no celular),
mas funciona bem em tablet e computador.

---

## ✨ Novidades desta versão

- **Visual repaginado**: identidade própria com tipografia de display, paleta refinada e
  cartões/sidebar escuros. Nada de emojis — cada matéria e trilha agora tem seu **ícone
  vetorial (SVG) próprio**, desenhado à mão e colorido por tema.
- **Fórum da comunidade** (novo no menu): perguntas e respostas entre estudantes,
  organizadas por **trilha e matéria**, com busca, ordenação (recentes, populares, sem
  resposta), votos e marcação de **"Resolvido"**. Em modo local já vem com exemplos; com
  Firebase ativo, funciona entre usuários de verdade.
- **Instalável como app (PWA)**: dá para **adicionar à tela inicial** no celular ou
  computador e abrir como aplicativo, inclusive offline. Veja o convite no **Perfil**.
- **Trilha redesenhada**: caminho serpenteante com estados claros (concluída, atual,
  bloqueada) e anel de progresso por matéria.
- **Avaliação no fim da lição**: o "Este conteúdo te ajudou?" agora aparece na conclusão
  da lição, logo **acima do botão de finalizar**.
- **Início, Ranking e Login** repaginados: cartão de "continuar de onde parou", anel de
  nível, meta semanal, pódio do ranking e tela de login em dois painéis.

> A geração de conteúdo por IA **não foi alterada** — apenas a interface e a experiência.

### Conta, estudos e anotações (novo)

- **Anotações por aula**: durante a aula há um botão flutuante para anotar. Tudo fica salvo
  no seu perfil em **Perfil → Minhas anotações**, organizado por matéria.
- **Configurações** (Perfil → Configurações): editar **nome e e-mail** (com validação),
  **alterar a senha**, ajustar a **meta semanal de XP** e definir a **data da prova**.
- **Contagem regressiva** da prova no Início, a partir da data configurada.
- **Login só com e-mail** (sem criar senha) e **"Esqueci minha senha"** na tela de entrada.
  Com Firebase ativo, ambos funcionam por e-mail (link de acesso / link de redefinição);
  no modo local, o login por e-mail entra direto.
- **Certificado premium** com selo, código de verificação e a assinatura do fundador.

### Praticar: revisão, simulado e estatísticas (novo)

- **Revisão espaçada**: toda questão que você erra entra numa fila e volta na hora certa
  para fixar (sistema de caixas — acertou, demora mais para voltar; errou, volta logo).
  Acesse em **Início → Praticar → Revisão** (o número mostra quantas estão na hora).
- **Simulado** cronometrado: monte uma prova com questões das suas matérias, responda sem
  ver o gabarito e, no fim, veja a nota, o tempo e a correção questão a questão. As que você
  errar entram automaticamente na revisão.
- **Estatísticas**: XP nos últimos 14 dias e **acerto por matéria** (as mais fracas aparecem
  destacadas) — em **Início → Praticar → Estatísticas** ou pelo Perfil.

> Tudo isso usa apenas as questões que já existem (fixas ou já geradas) — **não gasta IA**.

### Rotina, fórum e anotação fixa (novo)

- **Rotina de estudos** (Perfil → Rotina de estudos): monte sua semana escolhendo o que
  estudar em cada dia. O **plano de hoje** aparece no Início.
- **Anotações sempre à mão**: o botão de anotações agora fica **fixo na tela** durante a
  aula inteira — anote a qualquer momento, sem precisar rolar até o fim.
- **Fórum**: quem perguntou pode **marcar a melhor resposta como aceita** (a pergunta vira
  "Resolvida") e qualquer um pode **votar** nas respostas.

---

## 🛠️ Painel administrativo (acesso restrito)

O painel **não aparece em nenhuma tela do usuário comum** — só é alcançável pelo endereço:

```
/painel        (ex.: https://seusite.com/painel)
```

Ele mostra: total de usuários, total e **percentual de avaliações positivas (geral e por
matéria)**, lista de feedbacks, um **editor de conteúdo** (melhora/cria o conteúdo de
qualquer lição) e um **cadastro de novas matérias e objetivos** (entram no catálogo na hora).

### Modo Firebase (nuvem) — para os dados aparecerem de verdade

Para o painel ler os feedbacks e usuários reais, o admin precisa **estar autenticado** e ter
permissão. Configure uma vez:

1. Crie a sua conta de admin normalmente no app (e-mail/senha).
2. Pegue o **UID** dela em Firebase Console → Authentication → coluna "User UID".
3. No Firestore, crie a coleção **`admins`** e dentro dela um documento cujo **ID é esse UID**
   (pode ficar vazio).
4. Publique o `firestore.rules` (já vem com `isAdmin()` e as regras de `certificates`).
5. Acesse `/painel` e entre com o **e-mail e senha** dessa conta.

> Se a conta não estiver na coleção `admins`, o painel recusa o acesso.

### Modo local (sem Firebase) — para testar

Funciona direto, com os dados do navegador. O acesso é por **senha provisória**:

```
Estuda@Admin2026
```

No primeiro acesso o sistema **obriga a trocar** essa senha (mín. 8 caracteres). A senha
fica guardada só como hash. Para produção, o ideal é reforçar com *custom claims* no servidor.

---

## 🎓 Certificados e validação pública

- O certificado é **registrado globalmente** ao ser emitido (com nome, CPF mascarado,
  matéria, XP, data e código). Assim aparece no seu perfil **em qualquer aparelho**.
- Cada certificado tem um **código de verificação** e pode ser conferido por qualquer pessoa
  na página pública:

```
/validar-certificado          (ou /validar-certificado?code=XXXX-XXXX)
```

O PDF traz o código, o link de validação e a assinatura do fundador.

---

## 🔔 Lembretes e 🔄 atualizações

- **Lembretes da ofensiva**: ative em Configurações. O app avisa para você não perder a
  sequência. *Observação:* lembretes com o app **fechado** exigem Web Push + servidor (VAPID);
  sem isso, o lembrete aparece ao abrir o app quando você ainda não estudou no dia.
- **Ofensiva corrigida**: se passar um dia sem estudar, a sequência zera automaticamente.
- **Nova versão disponível**: quando você publica uma atualização, o usuário vê um aviso e
  escolhe **atualizar agora** (com animação de "aplicando atualização") ou depois — e o app
  volta a perguntar nos próximos acessos até ele atualizar.
- **Página de apresentação** no primeiro acesso, antes do login.
- **Marcador de texto**: nas aulas, selecione um trecho e escolha a cor para destacá-lo.

---

## 🔐 Segurança e cadastro (importante)

Esta versão endurece o cadastro e o acesso. Resumo do que mudou e o que **você precisa fazer**:

### Verificação de e-mail OBRIGATÓRIA
- Ao criar conta, o Firebase envia um e-mail de confirmação. **O usuário não acessa o app
  até clicar no link.** Isso elimina cadastros com e-mails inexistentes (ex.: `teste@gmail.com`).
- Já vem pronto — funciona com os templates padrão do Firebase Authentication.
- ⚠️ **Usuários antigos não verificados** ficarão na tela "Confirme seu e-mail" até confirmar
  (inclusive sua conta, se nunca confirmou). É o comportamento esperado do endurecimento.
- Login **só com e-mail** (link mágico) também conta como verificado.

### Senha forte e e-mail criterioso
- Senha exige no mínimo 8 caracteres com letras e números (com medidor de força).
- Bloqueio de **domínios descartáveis** (mailinator, tempmail, etc.) e **sugestão de correção**
  de digitação (`gmial.com` → `gmail.com`).

### App Check (reCAPTCHA v3) — ATIVE NO CONSOLE
Impede que usem suas chaves do Firebase **fora do seu app** (o maior ganho de segurança real).
Passo a passo:
1. Firebase Console → **App Check** → registre o app **Web** com o provedor **reCAPTCHA v3**.
2. Copie a **chave de site** gerada.
3. Cole em `src/firebase/config.js`, na constante `RECAPTCHA_SITE_KEY = '...'`.
4. Em **App Check**, ative o *enforcement* para Firestore/Authentication quando estiver pronto.
> Enquanto `RECAPTCHA_SITE_KEY` estiver vazio, o App Check fica desligado (não quebra nada).

### Regras do Firestore mais rígidas
- Escrever progresso, enviar feedback e postar no fórum agora exige **e-mail verificado**
  (`isVerified()`). **Republique o `firestore.rules`** após atualizar.

### Limite de requisições (rate limiting)
- O servidor de IA (`server/`) agora limita ~30 req/min por IP nas rotas `/api`.

### ⚠️ Chaves: o que é público e o que NÃO pode vazar
- As chaves do **Firebase no front são públicas por design** — a proteção vem das regras +
  App Check + verificação, não de escondê-las.
- A **chave da Anthropic (IA) é secreta** e fica só no `server/.env` (fora do navegador).
  O `server/.env` **não vai** no pacote — recrie a partir de `server/.env.example`.
- 🔴 **Importante:** a chave que estava no projeto foi exposta durante o desenvolvimento.
  **Gere uma nova** no console da Anthropic e descarte a antiga.

---

## 🔔 Web Push — lembretes com o app fechado (Fase B)

Agora os lembretes funcionam de verdade mesmo com o app fechado, via Web Push + o servidor.

**Como ligar:**
1. Gere um par de chaves VAPID:  `npx web-push generate-vapid-keys`
2. No `server/.env`, preencha `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` e `VAPID_SUBJECT`
   (um e-mail seu, no formato `mailto:voce@dominio.com`). Defina `REMINDER_HOUR` (0–23).
3. No front, em `src/services/webpush.js`, troque `VAPID_PUBLIC_KEY` pela **mesma chave pública**.
4. Rode o servidor (`npm run server`) num host que fique **sempre ligado** (Render, Railway, VPS).
5. No app, em **Configurações → Lembretes**, o usuário ativa e autoriza as notificações.

O servidor envia um lembrete diário no horário definido e tem `/api/push/test` (botão "Enviar
teste" nas Configurações). As inscrições ficam em `server/subscriptions.json`.

> O par de chaves que veio no projeto é de demonstração — **gere o seu** para produção.
> Em deploy só com Netlify (sem o servidor Express rodando), o push não funciona; suba o
> `server/` num host persistente. Sem push, o app ainda avisa ao ser aberto.

---

## 🌗 Tema, 🏆 conquistas e 🔎 busca (Fase C)

- **Modo escuro**: em **Configurações → Aparência** (Claro / Escuro / Sistema). Respeita o
  tema do sistema e não pisca ao carregar.
- **Conquistas**: medalhas por metas (lições, ofensiva, nível, XP, certificados, acerto…),
  em **Perfil → Conquistas**, com barra de progresso nas que faltam.
- **Busca global**: ícone de lupa no topo (ou "Buscar" no menu). Procura matérias, lições e
  até suas anotações.

---

## 🛡️ Painel: novos usuários e moderação (Fase D)

- **Novos usuários por dia** (gráfico de 14 dias) na aba **Visão geral**. Conta a partir da
  data de criação da conta — vale para cadastros novos.
- **Moderação do fórum**: aba **Fórum** no painel lista os tópicos e permite **excluir**
  os impróprios (apaga também as respostas). Requer ser admin (regras já atualizadas).

---

## ⚡ Começo rápido (3 passos)

> Você precisa do **Node.js** instalado (versão 18 ou superior).

### 1. Instalar as dependências

Abra o terminal **dentro da pasta do projeto** e rode:

```bash
npm install
cd server && npm install && cd ..
```

### 2. Rodar o app

Você precisa de **dois terminais abertos** (um para o app, outro para o servidor de IA).

**Terminal 1 — o app:**
```bash
npm run dev
```
Abra o endereço que aparecer (normalmente http://localhost:5173).

**Terminal 2 — o servidor de IA** (opcional, mas recomendado):
```bash
npm run server
```

> Sem o servidor de IA, o app **funciona mesmo assim**: ele usa o banco de questões
> que já vem pronto em cada lição. O servidor só é necessário para a IA gerar
> questões novas.

### 3. Usar

Crie uma conta (em modo local, qualquer e-mail/senha serve), escolha ENEM ou Concurso,
selecione as matérias e comece a estudar. Conclua a trilha de **Informática** inteira
para ver o certificado funcionando.

---

## 🔑 Configurar a IA (sua chave da Anthropic)

A chave fica **só no servidor**, nunca no navegador. Para ativar:

1. Copie o arquivo de exemplo:
   ```bash
   cp server/.env.example server/.env
   ```
2. Abra `server/.env` e cole sua chave em `ANTHROPIC_API_KEY=`.
3. Reinicie o servidor (`npm run server`).

Pronto — agora as questões das lições passam a ser geradas por IA.

---

## ☁️ Configurar o Firebase (salvar na nuvem)

Sem isso, o app guarda os dados **só no navegador** (ótimo para testar). Para salvar na
nuvem e habilitar o ranking real entre usuários:

1. Crie um projeto em https://console.firebase.google.com
2. Ative **Authentication** > método **E-mail/senha**.
3. Crie um **Firestore Database**.
4. Em **Configurações do projeto > Seus apps**, crie um app **Web** e copie as chaves.
5. Copie o exemplo e preencha:
   ```bash
   cp .env.example .env
   ```
   Cole os valores no `.env` (campos que começam com `VITE_FB_`).
6. Cole o conteúdo do arquivo `firestore.rules` em **Firestore > Regras** e publique.
7. Reinicie o app (`npm run dev`).

O app detecta o Firebase automaticamente e passa a usar a nuvem.

---

## 🗂️ Como o projeto é organizado

Cada parte tem seu arquivo, para facilitar atualizações futuras:

```
estuda-mais/
├── index.html
├── server/                  → servidor Node (guarda a chave da IA)
│   └── index.js
├── firestore.rules          → regras de segurança do banco
└── src/
    ├── main.jsx             → ponto de entrada
    ├── App.jsx              → rotas e proteção de acesso
    ├── firebase/config.js   → conexão com Firebase (com fallback local)
    ├── context/             → estado global (login e progresso)
    ├── services/            → lógica de negócio (auth, progresso, IA, certificado)
    ├── data/
    │   ├── tracks.js        → trilhas (ENEM/Concurso) e catálogo de matérias
    │   └── content/         → conteúdo de cada matéria (1 arquivo por matéria)
    ├── components/          → peças de interface reutilizáveis
    └── pages/               → cada tela do app
```

### Como o conteúdo é gerado

Cada matéria é um **currículo** — uma lista de temas. Quando o usuário abre uma lição,
a **IA desenvolve a explicação detalhada e as atividades** na hora, e o resultado fica
**em cache** (não gera de novo e funciona offline depois). As matérias Informática e
Português têm conteúdo fixo embutido, que serve de fallback quando a IA está desligada.

### Como adicionar uma nova matéria

1. Crie (ou edite) um arquivo em `src/data/content/` exportando um objeto de matéria:
   ```js
   export const minhaMateria = {
     id: 'minha-materia', title: 'Minha Matéria', icon: '📘', color: 'violet',
     tracks: ['enem'], description: '...',
     lessons: [
       { id: 'mm-1', title: 'Tema da lição', focus: 'o que a IA deve cobrir nesta aula' },
     ],
   }
   ```
2. Importe e registre em `src/data/tracks.js` (no objeto `registry`).

Pronto — trilha, aula gerada por IA, quiz, XP e certificado funcionam automaticamente.
Para conteúdo fixo (sem depender da IA), adicione `theory: [...]` e `questions: [...]`
na lição, como em `informatica.js`.

### Trilhas disponíveis

ENEM, Concurso Público, Programação (Python, JavaScript, Java, C, SQL),
CyberSegurança (hacking ético/defensivo e CTFs) e Sistemas Operacionais (Linux, Windows).

---

## 🛠️ Tecnologias

- **React + Vite** (interface rápida e moderna)
- **Tailwind CSS** (estilo responsivo)
- **Firebase** (login + banco de dados na nuvem) — opcional
- **jsPDF** (geração do certificado)
- **Node + Express** (servidor que protege a chave da IA)

---

## ❓ Problemas comuns

- **"A IA não gera questões"** → confira se o servidor está rodando (`npm run server`)
  e se a chave está no `server/.env`. Sem isso, o app usa as questões prontas.
- **"Meus dados sumiram"** → no modo local, os dados ficam no navegador. Limpar o
  histórico/cache apaga tudo. Configure o Firebase para não perder nada.
- **Porta ocupada** → mude a `PORT` no `server/.env` ou feche o programa que usa a 5173.
```
