# Table Extractor Pro

Uma extensão leve e prática para Google Chrome (e navegadores baseados no Chromium) desenvolvida com **Manifest V3**. Ela é capaz de escanear a página e identificar dinamicamente tabelas HTML presentes na aba ativa, fornecendo a listagem detalhada e viabilizando a exportação direta dos dados para planilhas do Microsoft Excel (`.xlsx`).

---

## 🚀 Funcionalidades

- **Detecção Inteligente de Tabelas**: Analisa a página ativa em busca de tabelas, calculando a quantidade de linhas e colunas para cada uma.
- **Incorrência de Título Contextual**: Tenta nomear de forma inteligente as tabelas utilizando cabeçalhos próximos (`<h1>` a `<h6>`), painéis proprietários (`.card`, `.x_panel`, etc.) ou contêineres circundantes.
- **Janela Flutuante Dedicada**: Ao invés do popup comum, a extensão opera em uma janela popup limpa de dimensões fixas (380x600 px), facilitando a visualização e interação.
- **Processamento 100% Local**: Utiliza a renomada biblioteca **SheetJS (xlsx)** de forma empacotada localmente, o que significa que seus dados não saem da máquina, garantindo total privacidade e segurança.
- **Exportação Simples**: Geração rápida de arquivos `.xlsx` nativos e sem dependência de APIs externas de terceiros.

---

## 📂 Estrutura do Repositório

```
├── README.md               # Este arquivo de documentação
├── manifest.json           # Arquivo de configuração da extensão (Chrome Manifest V3)
├── popup.html              # Interface do usuário (painel de controle da extensão)
├── css/
│   └── style.css           # Estilos e design visual do popup
├── icons/
│   └── icon128.png         # Ícones utilizados pela extensão
└── scripts/
    ├── background.js       # Service worker em segundo plano para inicialização e controle da janela popup
    ├── popup.js            # Lógica responsável por injetar script na tab, rastrear tabelas e processá-las
    └── xlsx.full.min.js    # SheetJS para conversão de dados HTML e JSON para XLSX localmente
```

---

## 🛠️ Como Instalar e Executar (Modo Desenvolvedor)

Como se trata de uma extensão em desenvolvimento, você pode instalá-la facilmente em seu navegador utilizando o seguinte passo a passo:

1. **Faça o clone ou baixe os arquivos** deste repositório para o seu computador.
2. Abra o Google Chrome (ou seu navegador de preferência baseado em Chromium, como Edge, Opera, Brave ou Vivaldi).
3. Na barra de endereços, digite e acesse:
   ```txt
   chrome://extensions/
   ```
4. No canto superior direito da página de Extensões, ative a chave **Modo do desenvolvedor**.
5. No menu superior que aparecer, clique em **Carregar sem compactação** (ou *Load unpacked*).
6. Localize e selecione a pasta raiz deste repositório (`table-extractor`).
7. Pronto! A extensão **Table Extractor Pro** estará visível no topo do seu navegador, pronta para uso.

---

## 💻 Tecnologias Utilizadas

- **HTML5** e **CSS3** para a interface do painel.
- **Vanilla JavaScript (ES6+)** para manipulação do DOM e injeção de scripts na página ativa.
- **Chrome Extension API (Manifest V3)** com permissões focadas em `activeTab` e `scripting` para maior segurança.
- **[SheetJS / js-xlsx](https://sheetjs.com/)** para manipulação offline e conversão para o formato Microsoft Excel (.xlsx).

---

## 📄 Autoria e Contato

Desenvolvido por **Thomas Marcelino**  
- ✉️ Email: [lage.thomas@gmail.com](mailto:lage.thomas@gmail.com)  
- 🌐 Site Oficial: [WP Masters](https://wpmasters.com.br)  
- Repositório no GitHub: [table-extractor](https://github.com/thomasmarcelino/table-extractor)
