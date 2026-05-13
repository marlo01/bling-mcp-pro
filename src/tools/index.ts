import { FastMCP } from "fastmcp";
import {
  atualizarProdutoTool,
  criarProdutoTool,
  excluirProdutosTool,
  excluirProdutoTool,
  listarProdutosTool,
  obterProdutoTool,
} from "./produtos/blingProdutosTools.js";
import {
  atualizarContaReceberTool,
  baixarContaReceberTool,
  criarContaReceberTool,
  excluirContaReceberTool,
  listarContasReceberTool,
  obterContaReceberTool,
} from "./contasReceber/blingContasReceberTools.js";
import {
  listarVendedoresTool,
  obterVendedorTool,
} from "./vendedores/blingVendedoresTools.js";
import {
  atualizarContaPagarTool,
  baixarContaPagarTool,
  criarContaPagarTool,
  excluirContaPagarTool,
  listarContasPagarTool,
  obterContaPagarTool,
} from "./contasPagar/blingContasPagarTools.js";
import {
  atualizarFormaPagamentoTool,
  criarFormaPagamentoTool,
  excluirFormaPagamentoTool,
  listarFormasPagamentosTool,
  obterFormaPagamentoTool,
} from "./formasPagamentos/blingFormasPagamentosTools.js";
import {
  atualizarCategoriaProdutoTool,
  atualizarCategoriaReceitaDespesaTool,
  criarCategoriaProdutoTool,
  criarCategoriaReceitaDespesaTool,
  excluirCategoriaProdutoTool,
  excluirCategoriaReceitaDespesaTool,
  listarCategoriasProdutosTool,
  listarCategoriasReceitasDespesasTool,
  obterCategoriaProdutoTool,
  obterCategoriaReceitaDespesaTool,
} from "./categorias/blingCategoriasTools.js";
import {
  atualizarContatoTool,
  criarContatoTool,
  excluirContatoTool,
  listarContatosTool,
  listarTiposContatoTool,
  obterConsumidorFinalTool,
  obterContatoTool,
} from "./contatos/blingContatosTools.js";
import { listarContasContabeisTool } from './contasContabeis/blingContasContabeisTools.js';

export function registerTools(mcp: FastMCP<undefined>) {
  // Registrar ferramentas de contatos
  mcp.addTool(listarContatosTool);
  mcp.addTool(obterContatoTool);
  mcp.addTool(criarContatoTool);
  mcp.addTool(atualizarContatoTool);
  mcp.addTool(excluirContatoTool);
  mcp.addTool(listarTiposContatoTool);
  mcp.addTool(obterConsumidorFinalTool);

  // Registrar ferramentas de vendedores
  mcp.addTool(listarVendedoresTool);
  mcp.addTool(obterVendedorTool);

  // Registrar ferramentas de produtos
  mcp.addTool(listarProdutosTool);
  mcp.addTool(obterProdutoTool);
  mcp.addTool(criarProdutoTool);
  mcp.addTool(atualizarProdutoTool);
  mcp.addTool(excluirProdutoTool);
  mcp.addTool(excluirProdutosTool);

  // Registrar ferramentas de contas a receber
  mcp.addTool(listarContasReceberTool);
  mcp.addTool(obterContaReceberTool);
  mcp.addTool(criarContaReceberTool);
  mcp.addTool(atualizarContaReceberTool);
  mcp.addTool(excluirContaReceberTool);
  mcp.addTool(baixarContaReceberTool);

  // Registrar ferramentas de contas a pagar
  mcp.addTool(listarContasPagarTool);
  mcp.addTool(obterContaPagarTool);
  mcp.addTool(criarContaPagarTool);
  mcp.addTool(atualizarContaPagarTool);
  mcp.addTool(excluirContaPagarTool);
  mcp.addTool(baixarContaPagarTool);

  // Registrar ferramentas de formas de pagamento
  mcp.addTool(listarFormasPagamentosTool);
  mcp.addTool(obterFormaPagamentoTool);
  mcp.addTool(criarFormaPagamentoTool);
  mcp.addTool(atualizarFormaPagamentoTool);
  mcp.addTool(excluirFormaPagamentoTool);

  // Registrar ferramentas de categorias de produtos
  mcp.addTool(listarCategoriasProdutosTool);
  mcp.addTool(obterCategoriaProdutoTool);
  mcp.addTool(criarCategoriaProdutoTool);
  mcp.addTool(atualizarCategoriaProdutoTool);
  mcp.addTool(excluirCategoriaProdutoTool);

  // Registrar ferramentas de categorias de receitas/despesas
  mcp.addTool(listarCategoriasReceitasDespesasTool);
  mcp.addTool(obterCategoriaReceitaDespesaTool);
  mcp.addTool(criarCategoriaReceitaDespesaTool);
  mcp.addTool(atualizarCategoriaReceitaDespesaTool);
  mcp.addTool(excluirCategoriaReceitaDespesaTool);

  // Registrar ferramentas de contas contábeis
  mcp.addTool(listarContasContabeisTool);
}
