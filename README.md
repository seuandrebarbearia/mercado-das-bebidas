# Mercado das Bebidas

Vitrine estática em HTML, CSS e JavaScript puros. Abra `index.html` no navegador. Não requer instalação nem compilação. Para uma prévia por HTTP, execute `node preview.cjs` e abra http://127.0.0.1:4173. Encerre com Ctrl+C.

## Personalizar

Contato configurado: **(48) 99223-3863**, confirmado na ficha pública do Google Maps em 15/11/2026: https://maps.app.goo.gl/B8hvU9M4s6fxE9q47 . Todos os botões de WhatsApp usam esse número; o telefone na seção de contato também permite ligar. A configuração dos links foi testada; não foi enviada mensagem nem realizada ligação para verificar atendimento.

O bloco `SITE_CONFIG`, no início de `script.js`, centraliza nome, WhatsApp, telefone exibido, endereço, horários, mensagem, Google Maps, logotipo e fotos reais. Preencha somente com dados confirmados.

- `whatsapp`: número real com país e DDD, somente dígitos. Enquanto vazio, os botões explicam que o contato está pendente e oferecem a localização.
- `address` e `hours`: endereço e horários reais. Campos vazios mostram textos neutros.
- `logo`: caminho do logotipo, por exemplo `assets/logotipo.png`. Enquanto vazio, a página usa uma assinatura tipográfica provisória com símbolo de garrafas.
- `photos.facade` e `photos.interior`: caminhos das fotos reais. Enquanto vazios, espaços identificados aguardam essas fotos, sem representar outro estabelecimento como a loja.
- Paleta e fontes: variáveis no início de `style.css`.

As fotografias da galeria podem ser substituídas no HTML. Atualize também seus textos alternativos e dimensões. Mantenha `assets/` junto dos três arquivos principais ao copiar ou hospedar a página. Fontes e ícones são locais/nativos: não há bibliotecas nem fontes externas.

## Interações

Filtros mostram as fotos da categoria selecionada. A ampliação percorre o conjunto visível. Use os botões ou as setas do teclado; Escape fecha. Os diálogos nativos mantêm o foco dentro da janela e devolvem o foco ao botão de origem. O menu móvel fecha ao escolher um destino, pressionar Escape ou sair do cabeçalho. A preferência por movimento reduzido desativa as transições e entradas.

## Fotografias

As fotos são ilustrativas, comprimidas e armazenadas localmente. As imagens abaixo da primeira seção usam carregamento sob demanda. Fontes e licença estão em [assets/CREDITOS.md](assets/CREDITOS.md). Não representam estoque confirmado.

## Validação

Verificação de sintaxe JavaScript e testes locais das interações com DOM simulado. A conferência visual no Edge não pôde ser concluída porque a ferramenta de navegador estava indisponível. Conferir o layout em dispositivos reais antes de publicar.

## Subir para o GitHub

Envie `index.html`, `style.css`, `script.js` e a pasta `assets/` para a raiz do repositório, preservando a estrutura. Não envie o arquivo ZIP para hospedar: extraia seu conteúdo antes.

Para publicar no GitHub Pages, abra Settings → Pages, escolha Deploy from a branch e selecione a branch do site com a pasta `/ (root)`. Salve e aguarde o GitHub informar a URL. O site usa caminhos relativos e pode funcionar em um repositório de projeto, sem compilação.
