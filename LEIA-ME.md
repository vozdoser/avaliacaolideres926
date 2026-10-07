# Ficha de Avaliação Comunicacional · CONX

Instrumento de coleta das avaliações dos quatro Terapeutas da Comunicação sobre os quatro
participantes do programa Comunicação com Propósito da CONX Empreendimentos.
As respostas viram a camada quantitativa do relatório para os contratantes.

## Arquivos desta pasta

| Arquivo | Para que serve |
|---|---|
| `index.html` | A ficha. Arquivo único, logo embutida, funciona no celular e sem internet depois de aberta. |
| `apps-script.gs` | Receptor das respostas. Instruções de instalação estão no topo do próprio arquivo. |
| `.nojekyll` | Necessário para o GitHub Pages servir o arquivo direito. |

## Antes de publicar

1. Instale o `apps-script.gs` seguindo as dez etapas descritas no topo dele.
2. Copie a URL que termina em `/exec`.
3. Abra o `index.html`, procure a linha `var ENDPOINT = "";` e cole a URL entre as aspas.

Sem esse passo a ficha continua funcionando: o botão Enviar passa a baixar um arquivo e a
abrir o e-mail já preenchido para `silvia.vozdoser@gmail.com`. Com o passo feito, as
respostas caem sozinhas numa planilha no seu Drive e você recebe um aviso por e-mail.

## Publicar

Arraste a pasta inteira para o repositório do GitHub, como você já faz com os outros
`SITE_*_GITHUB`. A página nasce com `noindex, nofollow`, então não aparece em busca.

## Quem preenche o quê

Cada terapeuta preenche **uma ficha por participante que acompanhou** e **uma única ficha
de grupo**. A distribuição sugerida segue quem conduziu a terapia individual, porque é quem
viu o ponto de partida de perto:

| Terapeuta | Fichas individuais | Ficha de grupo |
|---|---|---|
| Gabriel Hatt | Guilherme, Rodrigo, Gabriel | 1 |
| Luana Curti | Guilherme, Luiza | 1 |
| Silvia Maciel | Rodrigo, Gabriel | 1 |
| Luiza Lio | Luiza | 1 |

Total: 8 fichas individuais (duas por participante, de avaliadores diferentes) e 4 fichas de
grupo. Cada ficha leva de 6 a 10 minutos.

**Regra que não pode cair:** os dois avaliadores de um mesmo participante não combinam notas
antes de enviar. A distância entre as duas avaliações entra no relatório como medida de
consistência, e só vale se forem independentes.

## O que a ficha mede

16 itens, agrupados em 5 eixos, cada um avaliado duas vezes: como a pessoa estava no primeiro
contato (15 a 24 de setembro) e como estava no último encontro (1º de outubro).

1. Autoconhecimento e leitura de perfil (3 itens)
2. Expressividade, o que é visto e o que é ouvido (4 itens)
3. Estrutura e impacto da mensagem (3 itens)
4. Pressão, exposição e resposta (3 itens)
5. Inteligência emocional, relacional e liderança (3 itens)

Mais duas leituras do momento atual (prontidão como porta-voz e quanto o avaliador observou
aquela pessoa) e quatro campos abertos, inclusive uma evidência concreta que sustente a
maior nota dada.

Os eixos saíram diretamente dos dez pontos que a proposta de 09 de setembro prometeu
trabalhar, cruzados com o que foi efetivamente dado nos quatro encontros.

## Como o índice é calculado

Cada item vale de 1 a 5. O Índice de Evolução Comunicacional é a média dos itens
respondidos, normalizada para uma escala de 0 a 100:

```
IEC = ((média dos itens − 1) / 4) × 100
```

Itens marcados como `NO` (não observei) ficam de fora da média, não entram como zero.
A evolução é a diferença entre o índice final e o índice de início, em pontos.
No relatório, a nota de cada participante combina os dois avaliadores, ponderada pela
resposta de quanto cada um observou aquela pessoa.

## Limites do método, para constar no relatório

O programa não teve linha de base formal, então a medida é uma avaliação retrospectiva
pareada: o mesmo avaliador mede os dois momentos com a mesma régua, de uma vez só.
Os avaliadores são os próprios facilitadores, e não observadores independentes, e o grupo
tem quatro pessoas. Isso é dito com todas as letras no relatório. O que sustenta a medida
são três controles: descritores de comportamento em cada item, dois avaliadores
independentes por participante e uma evidência concreta pedida junto com as notas.

Para a continuidade, a recomendação é instalar linha de base de verdade no mês zero e
remedir em 90 e 180 dias, somando uma avaliação de pares.

---

Instituto Voz do Ser · documento interno.
