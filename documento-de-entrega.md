# Documento de Entrega

## a) Identificação
- Nome do aluno: João Paulo Gonçalves Vellasco Campos
- Turma: 5 periodo Sistemas da Informação
- Data: 18/05/2026

## b) Tecnologias utilizadas
- Frontend: React 18 + Vite + React Router
- Backend: Node.js + Express
- Banco de dados: NeDB (embedded)
- Autenticação: JWT + bcryptjs
- Estilo: CSS customizado
- Deploy: Render / Railway / Heroku / outro serviço similar

## c) Evidências dos commits
- Histórico de commits criado e sincronizado com o GitHub.
- Commits recentes:
  - `d552900` docs: adicionar link do repositório remoto
  - `d5b57be` chore: adicionar configuração de deploy e atualizar documentação
  - `f8e9352` docs: atualizar documento de entrega com status Git
  - `db90220` chore: ajustes finais e README
  - `9f80ae8` feat(frontend): implementar frontend e integração com API
  - `f1a3f69` feat(backend): implementar backend produtos e usuários
  - `e1c8518` chore: inicializar projeto mini e-commerce
- Para obter evidência visual, abra o histórico de commits no GitHub e insira um print neste documento.

## d) Link do repositório GitHub
- https://github.com/Joao19Paulo/mini-ecommerce

## e) Link do deploy funcionando
- Pendente: criação do serviço no Render bloqueada porque a conta exige informação de pagamento.

## Observações importantes
- O projeto possui os requisitos principais implementados:
  - CRUD de produtos
  - CRUD de usuários
  - Integração frontend/backend por API
  - Persistência em banco de dados
  - Autenticação e autorização de perfis
  - Busca, filtros e paginação
- O backend está preparado para rodar em produção e servir o `frontend/dist` quando `NODE_ENV=production`.
- Tentativa de deploy no Render feita via API com `type: web_service` e `serviceDetails`, mas o Render retornou:
  - `402 Payment information is required to complete this request`
- Para completar o deploy, adicione uma forma de pagamento ao workspace Render ou escolha outro serviço de hospedagem similar.
