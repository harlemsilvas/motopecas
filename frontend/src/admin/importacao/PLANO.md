// Plano para feature de importação de produtos via CSV

/\*\*

- Estrutura da feature:
-
- 1.  Subpasta: src/admin/importacao/
- - ImportacaoProdutos.jsx: Página principal de importação
- - modelo-produtos.csv: Exemplo de arquivo CSV para download
- - utilsImportacao.js: utilitários para parse/conversão CSV
-
- 2.  Funcionalidades da página:
- - Download do modelo CSV
- - Upload do arquivo CSV
- - Preview dos dados antes de importar
- - Validação dos campos obrigatórios (nome, preco, imagens, categorias)
- - Mapeamento de categorias por nome ou ID
- - Envio dos dados para a API backend (em lote)
- - Exibição de erros e sucesso
-
- 3.  Backend:
- - Endpoint para receber lote de produtos (POST /api/produtos/importar)
- - Validação e inserção em lote
- - Retorno de erros por linha, se houver
-
- 4.  CSV modelo:
- - nome,preco,precoPromocional,descricao,imagens,categorias,itemDoDia,ativo
- - imagens: separadas por ; (ponto e vírgula)
- - categorias: nomes ou IDs separados por ;
- - itemDoDia,ativo: true/false
-
- 5.  Passos sugeridos:
- a) Criar modelo-produtos.csv
- b) Criar ImportacaoProdutos.jsx com UI básica
- c) Implementar utilitário de parse CSV
- d) Implementar preview/validação frontend
- e) Implementar endpoint backend
- f) Integrar envio e feedback
  \*/

export const planoImportacaoProdutos = true;
