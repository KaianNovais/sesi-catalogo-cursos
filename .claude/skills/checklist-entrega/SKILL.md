---
name: checklist-entrega
description: Confere o projeto contra todos os requisitos e entregáveis do edital da atividade prática (funcionalidades, dados, README, USO_DE_IA, publicação, ZIP) e lista o que falta. Use antes de entregar ou para saber o que ainda falta.
disable-model-invocation: true
context: fork
background: false
---

Audite este repositório contra o edital abaixo (resumo fiel do PDF da atividade). Para cada item, procure
a evidência (arquivo e linha, teste, comando ou URL) e classifique: ✅ atendido · ⚠️ parcial · ❌ ausente ·
🚧 planejado para a próxima etapa. Rode `npm run check` em `frontend/` uma vez. Não edite arquivos.

## 1. Desafio

- Front-end baseado no Figma, considerando responsividade e acessibilidade
- Back-end em C#/.NET · API para consulta dos cursos · banco de dados de código aberto
- Integração entre front-end, API e banco
- Publicação da aplicação em plataforma gratuita, sem contratar serviço pago nem gerar custo ao SESI-SP
- Documentação técnica
- Registro do uso de IA e de suas finalidades em pelo menos uma etapa

## 2. Cada curso contém

Nome completo · nome breve · descrição · categoria · modalidade · carga horária · público-alvo · status ·
imagem de apresentação · data de disponibilização (quando aplicável).

## 3. Dados mínimos

6 cursos · 3 categorias · 2 modalidades · 3 status diferentes · cargas horárias, módulos, descrições de
aulas e públicos-alvo diferentes entre os cursos · todos os dados fictícios.

## 4. Funcionalidades obrigatórias

Listar os cursos por meio da API · pesquisar pelo nome · filtrar por categoria, modalidade ou status ·
combinar pesquisa e filtros · mostrar a quantidade de resultados · limpar os filtros · abrir os detalhes
de um curso · mensagem quando nenhum curso for encontrado · estado de carregamento · mensagem de erro ·
interface funcional em diferentes tamanhos de tela. Fora do escopo: cadastro, edição e exclusão.

## 5. USO_DE_IA.md contém

Ferramenta utilizada · objetivo do uso · prompts relevantes (o que foi aproveitado ou descartado) · como
o conteúdo foi validado · um exemplo de erro ou inadequação identificado · correção realizada.

## 6. README.md apresenta

Objetivo · tecnologias · arquitetura da solução · estrutura das pastas · instruções para execução
(inclusive local, caso a hospedagem esteja indisponível) · configuração do banco · endpoints · modelo de
dados · estratégia de responsividade · decisões de acessibilidade · processo de publicação ·
limitações conhecidas.

## 7. Entregáveis

Link do repositório no GitHub · link da aplicação publicada · código-fonte do front-end · código-fonte
do back-end · scripts, migrations ou arquivo do banco · README.md · USO_DE_IA.md · relação dos arquivos
de publicação em ZIP · relação das limitações ou itens não concluídos · diferenças em relação ao Figma
identificadas e justificadas.

## Resultado

Uma tabela por seção (item · status · evidência) e, no fim, a lista priorizada do que falta para a entrega.
