
Plano de Centralização de Caminhos de Imagens/Uploads
1. Pontos de Exibição e Montagem de Imagens
- Frontend
  - Função utilitária central: getImageUrl(path) em imageUtils.js
    - Usa a variável de ambiente VITE_UPLOADS_URL para montar URLs de imagens.
    - Fallback para placeholder SVG se não houver imagem.
  - Componentes/Admin: Diversos componentes usam funções locais apiImg (ItemDoDia.jsx, Produtos.jsx, Categorias.jsx, Configuracoes.jsx), mas o ideal é migrar todos para usar getImageUrl. -> Sim, podemos fazer.
  - Componente Destaques já usa getImageUrl.
  - Inputs de upload em ProdutoForm.jsx, CategoriaForm.jsx, Configuracoes.jsx.
- Backend

  - Servidor Express serve /uploads como estático.
  - Uploads via Multer, com subpastas para produtos/categorias.
  - Controllers retornam apenas o caminho relativo (ex: /uploads/produtos/ID/arquivo.jpg). -> este caminho é salvo no banco e retornado para o frontend.

- Infraestrutura

  - O arquivo hrmmotos (Nginx) define:
    - /motopecas/uploads/ → pasta de uploads do backend.
    - /motopecas/sem-imagem.png → fallback de imagem. -> esta imagem deve existir e ser servida corretamente
    - /motopecas/public/ → arquivos públicos.
  -   Deploy.sh exporta VITE_UPLOADS_URL para o build do frontend.

2. Proposta de Estrutura Centralizada

- Arquivo de configuração único:
Criar um arquivo JS/TS central (ex: src/config/paths.js) exportando funções e constantes para caminhos de API, uploads e imagens. -> Sim, podemos centralizar as URLs e caminhos em um arquivo de configuração.

- Variáveis de ambiente:
Usar .env e .env.production para DEV/PROD, sempre com as mesmas chaves.

- Função única para montar URLs:
Todos os componentes devem usar getImageUrl(path). ->  Sim, podemos migrar os componentes para usar esta função utilitária.

3. O que preciso para montar o arquivo de referência (.md):
  Exemplos reais de:
  - Caminho de imagem salvo no banco (produto/categoria). 
  Exemplo: id_produto = /uploads/produtos/ID/arquivo.jpg
  - Caminho de imagem salvo no ambiente local (DEV).
  - Caminho de imagem salvo em produção (PROD).
  - Algum caso de uso onde há erro de caminho (ex: imagem não aparece em DEV mas aparece em PROD, ou vice-versa).
  - Alguma particularidade de deploy local (ex: uploads ficam em pasta diferente?).

Exemplo de arquivo de referência para revisão

```
# Centralização de Caminhos de Imagens e Uploads

## Variáveis de Ambiente

- VITE_API_URL
- VITE_UPLOADS_URL

## Função utilitária padrão

```js
// src/utils/imageUtils.js
export function getImageUrl(path) {
  if (!path) return PLACEHOLDER;
  if (path.startsWith("http")) return path;
  const cleanPath = path.replace(/^\/+/, "").replace(/^uploads\//, "");
  const baseUrl = import.meta.env.VITE_UPLOADS_URL || "/uploads";
  return `${baseUrl}/${cleanPath}`;
}
```

### Exemplos de uso
 - Caminho salvo no banco: /uploads/produtos/ID/arquivo.jpg -> ok, onde id é o id do produto e categoria /uploads/categorias/ID/arquivo.jpg.
 - Caminho exibido no frontend DEV: http://localhost:5173/uploads/produtos/ID/arquivo.jpg -> ok, usando VITE_UPLOADS_URL=/uploads
 - Caminho exibido no frontend PROD: https://hrmmotos.com.br/motopecas/uploads/produtos/ID/arquivo.jpg -> ok, usando VITE_UPLOADS_URL=/uploads

### Checklist para DEV e PROD
 [] Todos os componentes usam getImageUrl.
 [] Variáveis de ambiente estão corretas em .env e .env.production. -> se vamos deixar iguais, pode deixar um unico exemplo.
 [] Nginx serve /motopecas/uploads/ corretamente. -> sim já serve, mas é bom validar.
 [] Imagem fallback /motopecas/sem-imagem.png existe e está configurada. -> sim, mas é bom validar.

### Pontos de ajuste
[] Migrar funções locais apiImg para usar getImageUrl. -> sim, podemos migrar.
[] Garantir que uploads em DEV e PROD salvam caminhos relativos iguais. -> sim, o caminho salvo no banco deve ser o mesmo, o que muda é a variável de ambiente para montar a URL completa.
[] Validar deploy.sh para sempre exportar as variáveis corretas. 
### O que preciso de você
[] Exemplos reais de caminhos de imagens salvos no banco (DEV e PROD).
- /uploads/produtos/ID/arquivo.jpg, não consegui mais fazer o upload para pegar o caminho salvo no banco, mas acredito que seja esse formato, onde id é o id do produto e categoria /uploads/categorias/ID/arquivo.jpg.
[] Algum caso de erro de caminho para analisar. - Não tenho um caso específico, mas já vi que em DEV as imagens não aparecem, o que pode ser por causa do caminho ou da configuração do Nginx.
[] Alguma particularidade do ambiente local. -> No ambiente local, os uploads ficam na pasta do backend, e o Nginx serve essa pasta como /motopecas/uploads/. É importante garantir que o caminho salvo no banco seja relativo (ex: /uploads/produtos/ID/arquivo.jpg) para que a função getImageUrl possa montar a URL correta tanto em DEV quanto em PROD.

Me envie essas informações para eu montar o arquivo final de referência e sugerir os ajustes de código!## Exemplos de uso

- Caminho salvo no banco: /uploads/produtos/ID/arquivo.jpg -> ok, onde id é o id do produto e em categoria /uploads/categorias/ID/arquivo.jpg, onde ID é o id da categoria.
- Caminho exibido no frontend DEV: http://localhost:5173/uploads/produtos/ID/arquivo.jpg
- Caminho exibido no frontend PROD: https://hrmmotos.com.br/motopecas/uploads/produtos/ID/arquivo.jpg

### Checklist para DEV e PROD
 [] Todos os componentes usam getImageUrl.
 [] Variáveis de ambiente estão corretas em .env e .env.production.
 [] Nginx serve /motopecas/uploads/ corretamente.
 [] Imagem fallback /motopecas/sem-imagem.png existe e está configurada.
### Pontos de ajuste
- Migrar funções locais apiImg para usar getImageUrl. ok, podemos migrar.
- Garantir que uploads em DEV e PROD salvam caminhos relativos iguais. ok, o caminho salvo no banco deve ser o mesmo, o que muda é a variável de ambiente para montar a URL completa.
- Validar deploy.sh para sempre exportar as variáveis corretas. ok, podemos validar o deploy.sh para garantir que as variáveis de ambiente estão sendo exportadas corretamente durante o build do frontend.
### O que preciso de você
- Exemplos reais de caminhos de imagens salvos no banco (DEV e PROD). ja temos acima
- Algum caso de erro de caminho para analisar. ja temos acima
- Alguma particularidade do ambiente local. ja temos acima
Me envie essas informações para eu montar o arquivo final de referência e sugerir os ajustes de código!