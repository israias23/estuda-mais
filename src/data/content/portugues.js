// src/data/content/portugues.js
// Português — ENEM e Concurso. As 3 primeiras lições têm conteúdo fixo (funcionam
// offline); as demais são desenvolvidas pela IA a partir do "focus".

const L = (id, title, focus) => ({ id, title, focus })

export const portugues = {
  id: 'portugues',
  title: 'Português',
  icon: '📚',
  color: 'ember',
  tracks: ['enem', 'concurso'],
  description: 'Gramática, interpretação e os erros que mais derrubam candidatos.',
  lessons: [
    // ---- Lições com conteúdo fixo (offline) ----
    {
      id: 'pt-1', title: 'Crase', xp: 50,
      theory: [
        'A crase é a fusão da preposição "a" com o artigo "a" (ou com o "a" dos pronomes aquele, aquela). Ela é marcada pelo acento grave: à.',
        'Um teste prático: troque a palavra feminina por uma masculina. Se aparecer "ao", há crase. Exemplo: "Vou à praia" vira "Vou ao parque" — logo, há crase.',
        'Não se usa crase antes de palavras masculinas, antes de verbos e, em geral, antes de pronomes pessoais. Cuidado com expressões como "às vezes", que levam crase.',
      ],
      questions: [
        { q: 'Em qual frase o uso da crase está correto?', options: ['Vou à escola todos os dias', 'Cheguei à pé', 'Refiro-me à você', 'Comecei à estudar'], correct: 0, explain: '"À escola" tem crase. Antes de verbo e pronome pessoal não há crase.' },
        { q: 'O teste prático da crase é trocar a palavra feminina por uma masculina e ver se aparece:', options: ['"de"', '"ao"', '"em"', '"com"'], correct: 1, explain: 'Se ao trocar surge "ao", confirma-se a crase.' },
      ],
    },
    {
      id: 'pt-2', title: 'Concordância Verbal', xp: 50,
      theory: [
        'Concordância verbal é a regra de que o verbo concorda com o sujeito em número e pessoa.',
        'Com sujeito composto antes do verbo, ele vai para o plural: "João e Maria chegaram". O verbo "haver", no sentido de existir, é impessoal e fica no singular: "Havia muitos alunos".',
        'Atenção a "a maioria dos alunos", em que o verbo pode concordar com "maioria" (singular) ou com "alunos" (plural).',
      ],
      questions: [
        { q: 'Assinale a frase correta:', options: ['Haviam muitas pessoas', 'Havia muitas pessoas', 'Existia muitas pessoas', 'Houveram muitas pessoas'], correct: 1, explain: 'O verbo "haver" como existir é impessoal: fica no singular.' },
        { q: 'Com sujeito composto antes do verbo, ele fica:', options: ['No singular', 'No plural', 'No gerúndio', 'No infinitivo'], correct: 1, explain: 'Sujeito composto anteposto leva o verbo ao plural.' },
      ],
    },
    {
      id: 'pt-3', title: 'Interpretação de Texto', xp: 50,
      theory: [
        'Interpretar é ir além do que está escrito: compreender a intenção do autor e as relações entre as ideias.',
        'Diferencie "explícito" (o que o texto diz) de "implícito" (o que se deduz). Cuidado com alternativas verdadeiras que não estão no texto.',
        'Estratégia: leia o enunciado, volte ao trecho indicado e elimine as alternativas que extrapolam ou contrariam o texto.',
      ],
      questions: [
        { q: 'Uma informação deduzida, sem estar escrita, é:', options: ['Explícita', 'Implícita', 'Literal', 'Irrelevante'], correct: 1, explain: 'O implícito é inferido; o explícito está escrito.' },
        { q: 'Boa estratégia é eliminar alternativas que:', options: ['Repetem o texto', 'Extrapolam ou contrariam o texto', 'Citam o autor', 'São curtas'], correct: 1, explain: 'O que vai além do texto ou o contraria costuma estar errado.' },
      ],
    },
    // ---- Lições desenvolvidas pela IA ----
    L('pt-4', 'Classes de palavras', 'substantivo, adjetivo, verbo, advérbio, artigo, pronome, preposição, conjunção'),
    L('pt-5', 'Concordância nominal', 'concordância do adjetivo com o substantivo, casos especiais'),
    L('pt-6', 'Regência verbal e nominal', 'verbos que exigem preposição, regência de assistir, visar, obedecer'),
    L('pt-7', 'Pontuação', 'vírgula, ponto e vírgula, dois-pontos — usos e erros comuns'),
    L('pt-8', 'Ortografia e acentuação', 'regras de acentuação, palavras frequentes, novo acordo'),
    L('pt-9', 'Verbos: tempos e modos', 'indicativo, subjuntivo, imperativo, conjugação'),
    L('pt-10', 'Sintaxe: termos da oração', 'sujeito, predicado, objeto direto e indireto, adjunto'),
    L('pt-11', 'Orações coordenadas e subordinadas', 'período composto, tipos de orações'),
    L('pt-12', 'Figuras de linguagem', 'metáfora, metonímia, hipérbole, ironia, antítese'),
    L('pt-13', 'Funções da linguagem', 'referencial, emotiva, apelativa, fática, metalinguística, poética'),
    L('pt-14', 'Coesão e coerência textual', 'conectivos, referência, progressão das ideias'),
    L('pt-15', 'Variação linguística', 'norma culta x coloquial, regionalismos, preconceito linguístico'),
    L('pt-16', 'Gêneros textuais', 'narrativo, dissertativo, injuntivo, características de cada um'),
  ],
}
