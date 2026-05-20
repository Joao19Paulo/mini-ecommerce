const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, PageBreak
} = require('docx');
const fs = require('fs');

const ACCENT = "E8401C";
const DARK = "1A1A1A";
const GRAY = "666666";
const LIGHT_GRAY = "F5F5F0";
const border = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorders = { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } };

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 160 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 6 } },
  children: [new TextRun({ text, bold: true, size: 36, color: DARK, font: "Arial" })]
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 300, after: 120 },
  children: [new TextRun({ text, bold: true, size: 26, color: DARK, font: "Arial" })]
});

const p = (text, opts = {}) => new Paragraph({
  spacing: { before: 80, after: 80 },
  children: [new TextRun({ text, size: 22, color: DARK, font: "Arial", ...opts })]
});

const bullet = (text) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { before: 60, after: 60 },
  children: [new TextRun({ text, size: 22, font: "Arial", color: DARK })]
});

const check = (text, done = true) => new Paragraph({
  numbering: { reference: "checks", level: 0 },
  spacing: { before: 60, after: 60 },
  children: [
    new TextRun({ text: done ? "✅ " : "⬜ ", size: 22, font: "Arial" }),
    new TextRun({ text, size: 22, font: "Arial", color: DARK })
  ]
});

const makeTable = (headers, rows, colWidths) => new Table({
  width: { size: 9360, type: WidthType.DXA },
  columnWidths: colWidths,
  rows: [
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) => new TableCell({
        borders,
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: "1A1A1A", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: "FFFFFF", font: "Arial" })] })]
      }))
    }),
    ...rows.map((row, ri) => new TableRow({
      children: row.map((cell, ci) => new TableCell({
        borders,
        width: { size: colWidths[ci], type: WidthType.DXA },
        shading: { fill: ri % 2 === 0 ? "FFFFFF" : "F9F9F9", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, font: "Arial", color: DARK })] })]
      }))
    }))
  ]
});

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
      { reference: "checks", levels: [{ level: 0, format: LevelFormat.BULLET, text: "", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 0 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Arial", size: 36, bold: true }, paragraph: { spacing: { before: 400, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Arial", size: 26, bold: true }, paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    children: [

      // ── CAPA ──────────────────────────────────────────────────────────────
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1200, after: 200 },
        children: [new TextRun({ text: "👕 DRIP STORE", bold: true, size: 72, color: ACCENT, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "Mini E-commerce de Camisas", size: 36, color: GRAY, font: "Arial" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 600 },
        children: [new TextRun({ text: "Documento de Entrega — Trabalho Full Stack", size: 24, color: GRAY, font: "Arial", italics: true })]
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ── 1. IDENTIFICAÇÃO ──────────────────────────────────────────────────
      h1("1. Identificação"),
      makeTable(
        ["Campo", "Informação"],
        [
          ["Nome do Aluno", "___________________________________________"],
          ["Turma", "___________________________________________"],
          ["Data de Entrega", new Date().toLocaleDateString('pt-BR')],
          ["Projeto", "DRIP Store — Mini E-commerce de Camisas"],
          ["Repositório", "https://github.com/SEU_USUARIO/mini-ecommerce"],
          ["Deploy", "https://SEU_DEPLOY.vercel.app"],
        ],
        [2500, 6860]
      ),

      // ── 2. TECNOLOGIAS ────────────────────────────────────────────────────
      new Paragraph({ children: [new PageBreak()] }),
      h1("2. Tecnologias Utilizadas"),

      h2("Frontend"),
      makeTable(
        ["Tecnologia", "Versão", "Finalidade"],
        [
          ["React", "18.2", "Framework UI principal"],
          ["Vite", "5.x", "Build tool e dev server"],
          ["React Router v6", "6.22", "Roteamento SPA"],
          ["Axios", "1.6", "Client HTTP para API"],
          ["CSS Custom", "—", "Design System próprio (sem framework)"],
        ],
        [3000, 1800, 4560]
      ),

      new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }),
      h2("Backend"),
      makeTable(
        ["Tecnologia", "Versão", "Finalidade"],
        [
          ["Node.js", "18+", "Runtime JavaScript"],
          ["Express", "4.18", "Framework HTTP / API REST"],
          ["NeDB", "latest", "Banco de dados embedded (NoSQL)"],
          ["JWT (jsonwebtoken)", "9.0", "Autenticação stateless"],
          ["bcryptjs", "2.4", "Hash seguro de senhas"],
        ],
        [3000, 1800, 4560]
      ),

      new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }),
      h2("Banco de Dados"),
      p("Banco utilizado: NeDB (embedded JavaScript NoSQL database)"),
      bullet("Banco sem instalação — arquivo .db gerado automaticamente na pasta /data"),
      bullet("Collections: users.db, produtos.db, categorias.db"),
      bullet("Suporte a índices, queries, ordenação e paginação"),
      bullet("Seed automático com 8 produtos em 5 categorias e 1 usuário admin"),

      new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }),
      h2("Deploy"),
      makeTable(
        ["Serviço", "Tipo", "URL"],
        [
          ["Vercel / Render", "Frontend + Backend", "https://SEU_DEPLOY.vercel.app"],
        ],
        [2500, 3000, 3860]
      ),

      // ── 3. FUNCIONALIDADES ─────────────────────────────────────────────────
      new Paragraph({ children: [new PageBreak()] }),
      h1("3. Funcionalidades Implementadas"),

      h2("3.1 CRUD de Produtos"),
      check("Cadastrar novo produto (nome, descrição, preço, estoque, categoria, imagem, tamanhos, cores, ativo)"),
      check("Listar todos os produtos com paginação (10 por página)"),
      check("Filtrar por nome/descrição (busca textual)"),
      check("Filtrar por categoria"),
      check("Filtrar por status (ativo/inativo)"),
      check("Editar produto existente via modal"),
      check("Excluir produto (remoção física com confirmação)"),
      check("Ativar/desativar produto (toggle de status)"),
      check("Preview de imagem no formulário"),
      check("Chips interativos para tamanhos e cores"),

      new Paragraph({ spacing: { before: 160, after: 0 }, children: [] }),
      h2("3.2 CRUD de Usuários"),
      check("Cadastrar novo usuário (nome, email, senha, perfil, ativo)"),
      check("Listar todos os usuários com paginação"),
      check("Filtrar por nome/email, perfil e status"),
      check("Editar usuário (com senha opcional na edição)"),
      check("Excluir usuário (com proteção contra auto-exclusão)"),
      check("Ativar/desativar usuário"),
      check("Registro público de usuário comum"),

      new Paragraph({ spacing: { before: 160, after: 0 }, children: [] }),
      h2("3.3 Autenticação e Autorização (Bônus)"),
      check("Login com JWT (expira em 8h)"),
      check("Rotas protegidas por autenticação"),
      check("Autorização por perfil: admin vs user"),
      check("Registro público de usuário comum"),
      check("Proteção de rotas no frontend (PrivateRoute / AdminRoute)"),
      check("Persistência de sessão via localStorage"),

      new Paragraph({ spacing: { before: 160, after: 0 }, children: [] }),
      h2("3.4 Outros Recursos"),
      check("Dashboard com estatísticas (total produtos, ativos, estoque, usuários)"),
      check("Catálogo público de camisas com grid responsivo"),
      check("Design System próprio (DRIP Store) com tipografia Bebas Neue"),
      check("Feedback visual com sistema de Toasts"),
      check("Sidebar de navegação responsiva"),
      check("Seed automático com dados de exemplo"),

      // ── 4. API ENDPOINTS ──────────────────────────────────────────────────
      new Paragraph({ children: [new PageBreak()] }),
      h1("4. Documentação da API"),

      h2("4.1 Autenticação"),
      makeTable(
        ["Método", "Rota", "Auth", "Descrição"],
        [
          ["POST", "/api/auth/login", "—", "Login (retorna JWT)"],
          ["POST", "/api/auth/register", "—", "Registro de usuário comum"],
          ["GET", "/api/auth/me", "Token", "Dados do usuário logado"],
        ],
        [1200, 3000, 1200, 3960]
      ),

      new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }),
      h2("4.2 Produtos"),
      makeTable(
        ["Método", "Rota", "Auth", "Descrição"],
        [
          ["GET", "/api/produtos", "—", "Listar (page, limit, search, categoria_id, ativo)"],
          ["GET", "/api/produtos/:id", "—", "Detalhe do produto"],
          ["POST", "/api/produtos", "Admin", "Criar produto"],
          ["PUT", "/api/produtos/:id", "Admin", "Atualizar produto"],
          ["PATCH", "/api/produtos/:id/toggle", "Admin", "Ativar/desativar"],
          ["DELETE", "/api/produtos/:id", "Admin", "Excluir produto"],
          ["GET", "/api/produtos/categorias/lista", "—", "Listar categorias"],
        ],
        [1200, 3200, 1200, 3760]
      ),

      new Paragraph({ spacing: { before: 200, after: 0 }, children: [] }),
      h2("4.3 Usuários"),
      makeTable(
        ["Método", "Rota", "Auth", "Descrição"],
        [
          ["GET", "/api/usuarios", "Admin", "Listar (page, limit, search, perfil, ativo)"],
          ["GET", "/api/usuarios/:id", "Token", "Detalhe do usuário"],
          ["POST", "/api/usuarios", "Admin", "Criar usuário"],
          ["PUT", "/api/usuarios/:id", "Token", "Atualizar usuário"],
          ["PATCH", "/api/usuarios/:id/toggle", "Admin", "Ativar/desativar"],
          ["DELETE", "/api/usuarios/:id", "Admin", "Excluir usuário"],
        ],
        [1200, 3200, 1200, 3760]
      ),

      // ── 5. COMMITS ────────────────────────────────────────────────────────
      new Paragraph({ children: [new PageBreak()] }),
      h1("5. Histórico de Commits"),
      p("Evidências dos commits do repositório GitHub:", { color: GRAY, italics: true }),
      new Paragraph({ spacing: { before: 160, after: 80 }, children: [new TextRun({ text: "[INSERIR PRINT DO HISTÓRICO DE COMMITS AQUI]", size: 22, color: GRAY, italics: true, font: "Arial" })] }),
      p("Commits sugeridos:"),
      makeTable(
        ["Hash", "Mensagem do Commit"],
        [
          ["abc1234", "chore: estrutura inicial do projeto"],
          ["def5678", "feat(backend): configuração Express + NeDB + seed"],
          ["ghi9012", "feat(backend): autenticação JWT (login/register)"],
          ["jkl3456", "feat(backend): CRUD de produtos com filtros e paginação"],
          ["mno7890", "feat(backend): CRUD de usuários com autorização por perfil"],
          ["pqr1234", "feat(frontend): estrutura React + Vite + design system"],
          ["stu5678", "feat(frontend): layout sidebar + contextos Auth e Toast"],
          ["vwx9012", "feat(frontend): página login/registro"],
          ["yza3456", "feat(frontend): dashboard com estatísticas"],
          ["bcd7890", "feat(frontend): catálogo de produtos público"],
          ["efg1234", "feat(frontend): admin - CRUD completo de produtos"],
          ["hij5678", "feat(frontend): admin - CRUD completo de usuários"],
          ["klm9012", "chore: README, .gitignore e ajustes finais"],
        ],
        [2000, 7360]
      ),

      // ── 6. CRITÉRIOS ──────────────────────────────────────────────────────
      new Paragraph({ children: [new PageBreak()] }),
      h1("6. Critérios de Avaliação"),
      makeTable(
        ["Critério", "Pontos", "Status"],
        [
          ["CRUD Produtos funcionando", "2,0", "✅ Implementado"],
          ["CRUD Usuários funcionando", "2,0", "✅ Implementado"],
          ["Integração frontend + backend", "2,0", "✅ Implementado"],
          ["Persistência em banco", "1,5", "✅ NeDB"],
          ["Qualidade do código", "1,0", "✅ Separação de responsabilidades"],
          ["Histórico de commits", "0,5", "✅ Ver seção 5"],
          ["Deploy funcionando", "1,0", "⬜ Pendente (configurar deploy)"],
          ["TOTAL", "10,0", "—"],
          ["Bônus: Autenticação JWT", "+0,5", "✅ Implementado"],
          ["Bônus: Autorização por perfil", "+0,5", "✅ Implementado"],
          ["Bônus: Busca e filtros", "+0,5", "✅ Implementado"],
          ["Bônus: Paginação", "+0,5", "✅ Implementado"],
        ],
        [4500, 1500, 3360]
      ),

      new Paragraph({ spacing: { before: 400, after: 0 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "DRIP Store — Mini E-commerce de Camisas", size: 18, color: GRAY, italics: true, font: "Arial" })]
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/mnt/user-data/outputs/entrega-drip-store.docx', buffer);
  console.log('✅ Documento criado: entrega-drip-store.docx');
}).catch(err => { console.error('Erro:', err); process.exit(1); });
