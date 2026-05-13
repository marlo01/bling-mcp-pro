# Padrão de Organização de Pastas e Arquivos (Atualizado)

## Estrutura de pastas do projeto

```
bling-mcp/
├── src/
│   ├── tools/           # Módulos de integração com APIs externas, separados por domínio
│   │   ├── produtos/
│   │   │   ├── blingProdutos.ts           # Funções de integração com a API do Bling (produtos)
│   │   │   └── blingProdutosTools.ts      # Tools MCP para produtos
│   │   ├── contatos/
│   │   │   ├── blingContatos.ts
│   │   │   └── blingContatosTools.ts
│   │   ├── ... (outros domínios)
│   │   ├── index.ts      # Registro centralizado das tools MCP
│   │   └── blingClient.ts # Cliente HTTP compartilhado
│   ├── types/           # Tipos e interfaces globais
│   ├── config/          # Configurações do projeto
│   ├── server.ts        # Inicialização do MCP (NÃO registra mais tools diretamente)
│   └── index.ts         # Ponto de entrada do projeto
├── docs/                # Documentação de padrões e arquitetura
│   └── ...
├── package.json
└── ...
```

## Explicação das principais pastas/arquivos
- **src/tools/**: Cada recurso do Bling (contatos, vendedores, produtos, etc) tem sua própria subpasta, com arquivos de integração e tools MCP separados.
- **src/tools/index.ts**: Centraliza o registro de todas as tools MCP. Para adicionar uma nova tool, basta importar e registrar aqui.
- **src/tools/blingClient.ts**: Cliente HTTP compartilhado para integração com o Bling.
- **src/types/**: Tipos e interfaces compartilhados entre módulos.
- **src/config/**: Configurações globais (ex: tokens, URLs).
- **src/server.ts**: Inicializa o MCP, mas NÃO registra mais tools diretamente.
- **src/index.ts**: Ponto de entrada do projeto.
- **docs/**: Toda a documentação de padrões, arquitetura e exemplos.

## Como o código funciona: visão geral

1. **Módulos de integração** (`src/tools/<domínio>/bling<Domínio>.ts`): Funções para um recurso do Bling, usando interfaces e tratamento de erro padronizado.
2. **Tools MCP** (`src/tools/<domínio>/bling<Domínio>Tools.ts`): Define as ferramentas (tools) MCP, usando as funções dos módulos de integração e o schema de validação (zod). Não implementa lógica de integração!
3. **Registro centralizado** (`src/tools/index.ts`): Importa e registra todas as tools MCP. Não é necessário alterar o `server.ts`.
4. **Server MCP** (`src/server.ts`): Cria a instância do MCP server (FastMCP) e chama o registro das tools.
5. **Index** (`src/index.ts`): Ponto de entrada, inicia o servidor MCP.

## Exemplo de registro de tools

```ts
// src/tools/index.ts
import { listarProdutosTool, criarProdutoTool } from "./produtos/blingProdutosTools";
import { listarContatosTool } from "./contatos/blingContatosTools";

export function registerTools(mcp: FastMCP<undefined>) {
  mcp.addTool(listarProdutosTool);
  mcp.addTool(criarProdutoTool);
  mcp.addTool(listarContatosTool);
  // ...
}
```

## Fluxo de uma requisição

1. Cliente faz uma chamada para uma tool (ex: listarContatos)
2. MCP valida os parâmetros com zod
3. Executa a função do módulo de integração (ex: listarContatos)
4. Adapta e retorna o resultado para o cliente

## Benefícios da arquitetura
- Separação clara de responsabilidades
- Fácil extensão: para adicionar um novo recurso, basta criar o módulo, a tool e registrar no `tools/index.ts`
- Testes e manutenção facilitados
- Padrão consistente para todo o time

## Referências
- [FastMCP - GitHub](https://github.com/punkpeye/fastmcp)
- [Exemplo de uso do FastMCP](https://github.com/punkpeye/fastmcp#quickstart)
