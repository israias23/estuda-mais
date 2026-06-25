// src/data/content/informatica.js
// Matéria COMPLETA — serve de modelo para as demais.
// Estrutura: cada lição tem teoria (texto de estudo) e um banco de questões
// (usado quando a IA está offline). Conteúdo original, voltado a ENEM e concursos.

export const informatica = {
  id: 'informatica',
  title: 'Informática',
  icon: '💻',
  color: 'violet',
  tracks: ['concurso'],
  description: 'Do básico de hardware à segurança digital — o essencial de concursos.',
  lessons: [
    {
      id: 'inf-1',
      title: 'Hardware e Software',
      xp: 50,
      theory: [
        'Hardware é toda a parte física do computador: aquilo que você consegue tocar, como o processador, a memória, o disco e o teclado. Software é a parte lógica — os programas e instruções que dizem ao hardware o que fazer.',
        'O processador (CPU) é o "cérebro" que executa as instruções. A memória RAM guarda temporariamente o que está em uso e perde os dados ao desligar (memória volátil). O armazenamento (HD ou SSD) guarda os dados de forma permanente, mesmo sem energia.',
        'Os softwares se dividem em dois grandes grupos: os de sistema (como o sistema operacional) e os aplicativos (como editores de texto e navegadores). Sem software, o hardware é apenas um conjunto de peças sem utilidade.',
      ],
      questions: [
        {
          q: 'Qual componente é responsável por armazenar dados de forma temporária enquanto o computador está ligado?',
          options: ['HD', 'Memória RAM', 'Processador', 'Fonte de energia'],
          correct: 1,
          explain: 'A memória RAM é volátil: guarda dados em uso e os perde ao desligar.',
        },
        {
          q: 'Um editor de textos é classificado como:',
          options: ['Hardware', 'Software de sistema', 'Software aplicativo', 'Periférico'],
          correct: 2,
          explain: 'Editores de texto são aplicativos — programas que o usuário usa para tarefas específicas.',
        },
        {
          q: 'O que diferencia um SSD de uma memória RAM?',
          options: [
            'O SSD perde dados ao desligar; a RAM não',
            'A RAM perde dados ao desligar; o SSD mantém',
            'Ambos perdem dados ao desligar',
            'Nenhum guarda dados',
          ],
          correct: 1,
          explain: 'A RAM é volátil; o SSD é armazenamento permanente.',
        },
      ],
    },
    {
      id: 'inf-2',
      title: 'Sistemas Operacionais',
      xp: 50,
      theory: [
        'O sistema operacional (SO) é o software que gerencia todos os recursos do computador e faz a ponte entre o hardware e os aplicativos. Windows, Linux, macOS e Android são exemplos.',
        'Entre as funções do SO estão: gerenciar a memória, controlar os arquivos e pastas, administrar os processos em execução e cuidar dos dispositivos conectados.',
        'No Windows, o Explorador de Arquivos organiza pastas e documentos. No Linux, é comum usar o terminal com comandos de texto. Em concursos, é frequente cobrar atalhos e a organização de diretórios.',
      ],
      questions: [
        {
          q: 'Qual destes é um sistema operacional?',
          options: ['Microsoft Word', 'Google Chrome', 'Linux', 'Excel'],
          correct: 2,
          explain: 'Linux é um SO; os outros são aplicativos.',
        },
        {
          q: 'Uma das funções principais do sistema operacional é:',
          options: [
            'Editar planilhas',
            'Gerenciar memória e processos',
            'Criar apresentações',
            'Navegar na internet',
          ],
          correct: 1,
          explain: 'O SO gerencia recursos do computador, como memória e processos.',
        },
        {
          q: 'O atalho que normalmente copia um item selecionado no Windows é:',
          options: ['Ctrl + V', 'Ctrl + C', 'Ctrl + X', 'Ctrl + Z'],
          correct: 1,
          explain: 'Ctrl + C copia; Ctrl + V cola; Ctrl + X recorta; Ctrl + Z desfaz.',
        },
      ],
    },
    {
      id: 'inf-3',
      title: 'Editor de Texto (Word)',
      xp: 50,
      theory: [
        'Editores de texto, como o Microsoft Word e o Writer do LibreOffice, servem para criar e formatar documentos. É possível mudar fonte, alinhamento, espaçamento, inserir tabelas e imagens.',
        'Atalhos úteis: Ctrl + N abre um novo documento, Ctrl + S salva, Ctrl + B aplica negrito, Ctrl + I aplica itálico e Ctrl + U aplica sublinhado.',
        'Recursos como cabeçalho, rodapé, numeração de páginas e revisão ortográfica são muito cobrados. Saber a diferença entre "Salvar" e "Salvar como" (que permite escolher nome e local) também é importante.',
      ],
      questions: [
        {
          q: 'No Word, o atalho Ctrl + B normalmente aplica:',
          options: ['Itálico', 'Negrito', 'Sublinhado', 'Centralizar'],
          correct: 1,
          explain: 'Ctrl + B (de "bold") aplica negrito.',
        },
        {
          q: '"Salvar como" difere de "Salvar" porque permite:',
          options: [
            'Apenas fechar o arquivo',
            'Escolher nome e local do arquivo',
            'Imprimir o documento',
            'Desfazer a última ação',
          ],
          correct: 1,
          explain: '"Salvar como" deixa você definir nome, formato e pasta de destino.',
        },
      ],
    },
    {
      id: 'inf-4',
      title: 'Planilhas (Excel)',
      xp: 60,
      theory: [
        'Planilhas eletrônicas, como Excel e Calc, organizam dados em células identificadas por coluna (letra) e linha (número), por exemplo A1, B2. Fórmulas começam com o sinal de igual (=).',
        'Funções comuns: =SOMA(A1:A10) soma um intervalo; =MÉDIA(A1:A10) calcula a média; =SE(condição; valor_se_verdadeiro; valor_se_falso) faz testes lógicos.',
        'O uso de referências é essencial: A1 é relativa (muda ao copiar), enquanto $A$1 é absoluta (fica fixa). Esse detalhe aparece bastante em provas de concurso.',
      ],
      questions: [
        {
          q: 'Toda fórmula em uma planilha começa com qual sinal?',
          options: ['+', '=', '@', '#'],
          correct: 1,
          explain: 'O sinal de igual (=) indica o início de uma fórmula.',
        },
        {
          q: 'A função que soma um intervalo de células é:',
          options: ['=MÉDIA()', '=SE()', '=SOMA()', '=CONT()'],
          correct: 2,
          explain: '=SOMA(intervalo) retorna a soma dos valores.',
        },
        {
          q: 'A referência $A$1 é do tipo:',
          options: ['Relativa', 'Absoluta', 'Mista invertida', 'Circular'],
          correct: 1,
          explain: 'Os cifrões travam coluna e linha, tornando a referência absoluta.',
        },
      ],
    },
    {
      id: 'inf-5',
      title: 'Internet e Navegadores',
      xp: 50,
      theory: [
        'A internet é uma rede mundial que conecta computadores. A World Wide Web (WWW) é o serviço de páginas acessadas por navegadores como Chrome, Firefox e Edge.',
        'Um endereço (URL) tem partes como o protocolo (https), o domínio (exemplo.com.br) e o caminho. O "s" em https indica conexão segura e criptografada.',
        'Conceitos cobrados: cookies (pequenos arquivos que guardam preferências), cache (cópia temporária para acelerar o acesso) e a diferença entre buscar na barra de endereços e em um site de busca.',
      ],
      questions: [
        {
          q: 'O "s" no início de um endereço https indica que a conexão é:',
          options: ['Mais rápida', 'Segura e criptografada', 'Gratuita', 'Offline'],
          correct: 1,
          explain: 'HTTPS usa criptografia, tornando a conexão segura.',
        },
        {
          q: 'Cookies são:',
          options: [
            'Vírus de navegador',
            'Pequenos arquivos que guardam preferências do usuário',
            'Programas antivírus',
            'Tipos de memória RAM',
          ],
          correct: 1,
          explain: 'Cookies armazenam informações como login e preferências.',
        },
      ],
    },
    {
      id: 'inf-6',
      title: 'Segurança da Informação',
      xp: 60,
      theory: [
        'Segurança da informação protege dados quanto à confidencialidade (só quem pode vê), integridade (não foi alterado) e disponibilidade (está acessível quando preciso). Esse trio é chamado de CID.',
        'Ameaças comuns: vírus, worms, ransomware (sequestra dados e pede resgate) e phishing (golpe que se passa por uma fonte confiável para roubar dados). O antivírus e o firewall ajudam na proteção.',
        'Boas práticas: usar senhas fortes e diferentes, ativar a verificação em duas etapas, manter o sistema atualizado e desconfiar de links e anexos suspeitos.',
      ],
      questions: [
        {
          q: 'O golpe que se passa por uma fonte confiável para roubar dados é o:',
          options: ['Backup', 'Phishing', 'Firewall', 'Cache'],
          correct: 1,
          explain: 'Phishing engana o usuário fingindo ser uma entidade confiável.',
        },
        {
          q: 'O trio da segurança da informação (CID) é:',
          options: [
            'Cópia, Internet, Download',
            'Confidencialidade, Integridade, Disponibilidade',
            'Conexão, IP, Domínio',
            'Cookie, ID, Dados',
          ],
          correct: 1,
          explain: 'CID = Confidencialidade, Integridade e Disponibilidade.',
        },
        {
          q: 'O ransomware é uma ameaça que:',
          options: [
            'Acelera o computador',
            'Sequestra dados e pede resgate',
            'Faz backup automático',
            'Protege a rede',
          ],
          correct: 1,
          explain: 'Ransomware criptografa os dados e exige pagamento para liberá-los.',
        },
      ],
    },
    {
      id: 'inf-7',
      title: 'Redes de Computadores',
      xp: 60,
      theory: [
        'Uma rede conecta dispositivos para trocar dados. A LAN é uma rede local (casa, escritório); a WAN cobre grandes distâncias, como a internet.',
        'Cada dispositivo na rede tem um endereço IP. Equipamentos importantes: o roteador (direciona o tráfego entre redes) e o switch (conecta dispositivos na mesma rede local).',
        'Wi-Fi é a conexão sem fio. Conceitos como largura de banda (capacidade) e latência (atraso) afetam a velocidade percebida da conexão.',
      ],
      questions: [
        {
          q: 'Uma rede que cobre uma área pequena, como um escritório, é chamada de:',
          options: ['WAN', 'LAN', 'URL', 'CPU'],
          correct: 1,
          explain: 'LAN (Local Area Network) é uma rede local.',
        },
        {
          q: 'O equipamento que direciona o tráfego entre redes diferentes é o:',
          options: ['Switch', 'Roteador', 'Monitor', 'Teclado'],
          correct: 1,
          explain: 'O roteador conecta e direciona dados entre redes.',
        },
      ],
    },
    {
      id: 'inf-8',
      title: 'Computação em Nuvem',
      xp: 70,
      theory: [
        'Computação em nuvem é usar recursos de computação (armazenamento, processamento, programas) pela internet, sem precisar tê-los instalados localmente. Exemplos: Google Drive, Dropbox e OneDrive.',
        'Vantagens: acesso de qualquer lugar, backup automático e economia com infraestrutura. Os modelos principais são SaaS (software como serviço), PaaS (plataforma) e IaaS (infraestrutura).',
        'Ao guardar arquivos na nuvem, é importante cuidar da segurança: senhas fortes e verificação em duas etapas evitam acessos indevidos aos seus dados.',
      ],
      questions: [
        {
          q: 'O Google Drive é um exemplo de:',
          options: ['Sistema operacional', 'Armazenamento em nuvem', 'Antivírus', 'Processador'],
          correct: 1,
          explain: 'O Drive guarda arquivos na nuvem, acessíveis pela internet.',
        },
        {
          q: 'Uma vantagem da computação em nuvem é:',
          options: [
            'Funcionar sempre sem internet',
            'Acesso aos arquivos de qualquer lugar',
            'Dispensar qualquer senha',
            'Eliminar a necessidade de backup',
          ],
          correct: 1,
          explain: 'A nuvem permite acessar os dados de qualquer lugar com internet.',
        },
        {
          q: 'No modelo SaaS, o que é entregue ao usuário?',
          options: ['Apenas hardware', 'Software pronto para uso', 'Cabos de rede', 'Memória RAM'],
          correct: 1,
          explain: 'SaaS (Software as a Service) entrega o programa pronto, usado pela internet.',
        },
      ],
    },
  ],
}
