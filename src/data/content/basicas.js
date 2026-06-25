// src/data/content/basicas.js
// Matérias que aparecem em mais de uma trilha.
// Matemática e Redação: ENEM e Concurso.  Conhecimentos Gerais: Concurso.

const L = (id, title, focus) => ({ id, title, focus })
const sub = (id, title, icon, color, tracks, description, lessons) => ({ id, title, icon, color, tracks, description, lessons })

export const basicasSubjects = {
  matematica: sub('matematica', 'Matemática', '📐', 'ember', ['enem', 'concurso'], 'Do básico à resolução de problemas de prova.', [
    L('mat-1', 'Operações e números', 'as quatro operações, regras de sinais, ordem das operações'),
    L('mat-2', 'Frações e decimais', 'operações com frações, conversões, dízimas'),
    L('mat-3', 'Porcentagem', 'cálculo, aumentos e descontos, juros simples'),
    L('mat-4', 'Juros compostos', 'fórmula, diferença para juros simples, aplicações'),
    L('mat-5', 'Razão, proporção e regra de três', 'proporção direta e inversa, regra de três simples e composta'),
    L('mat-6', 'Equações do 1º grau', 'resolução, problemas do dia a dia'),
    L('mat-7', 'Equações do 2º grau', 'Bhaskara, soma e produto, problemas'),
    L('mat-8', 'Funções', 'função afim e quadrática, gráficos, interpretação'),
    L('mat-9', 'Geometria plana', 'áreas, perímetros, teorema de Pitágoras'),
    L('mat-10', 'Geometria espacial', 'volumes de prismas, cilindros, cones e esferas'),
    L('mat-11', 'Estatística', 'média, moda, mediana, gráficos, interpretação de dados'),
    L('mat-12', 'Probabilidade', 'espaço amostral, eventos, cálculo de probabilidade'),
    L('mat-13', 'Análise combinatória', 'princípio da contagem, arranjos, combinações, permutações'),
    L('mat-14', 'Progressões (PA e PG)', 'termo geral, soma, aplicações'),
  ]),
  redacao: sub('redacao', 'Redação', '✍️', 'violet', ['enem', 'concurso'], 'Estruture textos nota mil — dissertação argumentativa.', [
    L('red-1', 'O que é a dissertação argumentativa', 'estrutura: introdução, desenvolvimento, conclusão; tese'),
    L('red-2', 'As 5 competências do ENEM', 'o que cada competência avalia e como pontuar em cada uma'),
    L('red-3', 'Entendendo o tema e a proposta', 'leitura da coletânea, evitar fuga e tangenciamento'),
    L('red-4', 'A introdução perfeita', 'contextualizar o tema e apresentar a tese com clareza'),
    L('red-5', 'Parágrafos de desenvolvimento', 'tópico frasal, argumento, repertório, fechamento'),
    L('red-6', 'Repertório sociocultural', 'usar dados, citações, fatos históricos de forma produtiva'),
    L('red-7', 'Coesão: conectivos e referências', 'conectivos, retomadas, transição entre parágrafos'),
    L('red-8', 'Coerência e progressão', 'manter a lógica, evitar contradições e repetições'),
    L('red-9', 'A proposta de intervenção', 'agente, ação, meio, finalidade e detalhamento; respeito aos direitos humanos'),
    L('red-10', 'Erros que zeram ou derrubam a nota', 'fuga ao tema, cópia, desrespeito aos direitos humanos, clichês'),
    L('red-11', 'Redação em concursos', 'diferenças para o ENEM, tipos de texto cobrados (parecer, ofício, dissertação)'),
    L('red-12', 'Revisão e treino', 'como revisar, gerir o tempo, treinar com temas atuais'),
  ]),
  conhecimentos: sub('conhecimentos', 'Conhecimentos Gerais', '🌐', 'mint', ['concurso'], 'Atualidades, ética no serviço público e noções essenciais.', [
    L('cg-1', 'Como estudar atualidades', 'principais temas, fontes confiáveis, o que cai em concurso'),
    L('cg-2', 'Ética no serviço público', 'conduta do servidor, código de ética, moralidade'),
    L('cg-3', 'Princípios da administração pública', 'LIMPE: legalidade, impessoalidade, moralidade, publicidade, eficiência'),
    L('cg-4', 'Poderes e organização do Estado', 'Executivo, Legislativo, Judiciário, federação'),
    L('cg-5', 'Constituição: direitos fundamentais', 'direitos e garantias individuais e coletivos'),
    L('cg-6', 'Atos administrativos', 'conceito, atributos, espécies'),
    L('cg-7', 'Raciocínio lógico', 'proposições, conectivos, tabelas-verdade, sequências'),
    L('cg-8', 'Meio ambiente e sustentabilidade', 'temas atuais cobrados em provas'),
    L('cg-9', 'Tecnologia e sociedade', 'IA, dados, fake news, transformação digital'),
  ]),
}
