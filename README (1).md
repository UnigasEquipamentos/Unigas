# Termo de Responsabilidade — Unigás

Sistema de controle de entrega e devolução de equipamentos, com login próprio,
banco de dados e assinatura digital. Roda inteiramente no navegador (GitHub
Pages) e usa o Firebase (gratuito) como banco de dados, autenticação e
armazenamento das assinaturas.

## Arquivos

- `index.html` — a página do sistema (estrutura e estilo).
- `app.js` — toda a lógica (login, fichas, permissões).
- `logo-unigas.jpg` — logo usada no cabeçalho e na tela de login.

## 1. Criar o projeto no Firebase (gratuito)

1. Acesse https://console.firebase.google.com e crie um projeto novo.
2. **Build > Authentication > Get started** → ative o provedor **E-mail/senha**.
3. **Build > Firestore Database > Create database** → escolha a região
   `southamerica-east1` (São Paulo) → comece em modo produção.
4. **Build > Storage > Get started** → aceite a configuração padrão.
5. No ícone de engrenagem → **Configurações do projeto** → aba **Geral** →
   role até "Seus apps" → clique no ícone `</>` (Web) → registre um app.
   Copie o bloco `firebaseConfig`.
6. Abra `index.html` neste projeto e substitua os valores de
   `window.FIREBASE_CONFIG` pelos que você copiou.

## 2. Colar as regras de segurança

No console do Firebase:

**Firestore Database > Regras**, cole:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/config/admins) &&
        request.auth.token.email in get(/databases/$(database)/documents/config/admins).data.emails;
    }
    match /config/admins {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    match /fichas/{fichaId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}
```

**Storage > Regras**, cole:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /assinaturas/{fichaId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

Isso garante: qualquer pessoa logada pode **ver** as fichas, mas só quem
estiver na lista de administradores pode **criar, editar ou excluir**.

## 3. Cadastrar o primeiro responsável (admin)

Como ainda ninguém é admin, você precisa criar essa lista manualmente uma
única vez:

1. Abra o sistema publicado, clique em **Criar conta** e cadastre seu
   próprio e-mail (fica como "consulta" por enquanto, é normal).
2. No console do Firebase, vá em **Firestore Database > Dados**.
3. Clique em **Iniciar coleção**, nome da coleção: `config`.
4. ID do documento: `admins`.
5. Adicione um campo: nome `emails`, tipo **array**, e adicione o(s)
   e-mail(s) do(s) responsável(is) (o mesmo que você cadastrou no passo 1).
6. Salve. Recarregue o sistema — o e-mail cadastrado agora aparece como
   **RESPONSÁVEL** e tem acesso completo.

Para adicionar ou remover responsáveis depois, edite esse mesmo array de
e-mails diretamente ali no Firestore (Firebase > Firestore Database > Dados
> config > admins).

## 4. Publicar no GitHub Pages

1. Crie um repositório novo no GitHub (pode ser privado ou público) e suba
   estes três arquivos (`index.html`, `app.js`, `logo-unigas.jpg`).
2. No repositório, vá em **Settings > Pages**.
3. Em "Source", selecione a branch `main` e a pasta `/ (root)`. Salve.
4. Em alguns minutos, o GitHub mostra o link do site publicado
   (algo como `https://seu-usuario.github.io/nome-do-repositorio/`).

Pronto — esse link já é o sistema funcionando, com login, banco de dados e
assinatura digital, sem nenhuma dependência do Claude.

## Limites do plano gratuito do Firebase (Spark)

- Firestore: ~1 GB armazenado, 50 mil leituras e 20 mil gravações por dia.
- Storage: 5 GB armazenados, 1 GB de download por dia.
- Authentication: sem limite de contas para e-mail/senha.

Mais do que suficiente para o volume de fichas de uma operação como essa.
Se um dia isso mudar, o Firebase avisa antes de qualquer cobrança — nada é
cobrado automaticamente no plano gratuito.
