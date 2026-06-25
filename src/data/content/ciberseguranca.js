// src/data/content/ciberseguranca.js
// Trilha CYBERSEGURANÇA — formação completa em hacking ÉTICO e defesa.
// Dividida em subtrilhas (subjects). Conteúdo gerado pela IA com diretriz
// ética/defensiva (ver server/index.js). Foco em entender, detectar e defender.

const L = (id, title, focus) => ({ id, title, focus })
const sub = (id, title, icon, color, description, lessons) => ({
  id, title, icon, color, tracks: ['ciberseguranca'], description, lessons,
})

export const cibersegurancaSubjects = {
  'cyber-fundamentos': sub('cyber-fundamentos', 'Fundamentos & Ética', '🧭', 'violet', 'A base: o que é segurança, ética, leis e mentalidade hacker.', [
    L('cf-1', 'O que é segurança da informação', 'tríade CID, ativos, ameaças, riscos'),
    L('cf-2', 'Tipos de hacker e ética', 'white/black/grey hat, hacking ético, responsabilidade'),
    L('cf-3', 'Leis e LGPD', 'crimes cibernéticos no Brasil, LGPD, limites legais do pentest'),
    L('cf-4', 'Gestão de risco', 'identificar, avaliar e tratar riscos'),
    L('cf-5', 'Engenharia social', 'como funciona, phishing, pretexting — e como se defender'),
    L('cf-6', 'Políticas de segurança', 'senhas, MFA, princípio do menor privilégio'),
    L('cf-7', 'Montando um laboratório seguro', 'máquinas virtuais, ambientes isolados para treinar legalmente'),
    L('cf-8', 'Mentalidade e metodologia', 'fases de um teste de intrusão (em ambiente autorizado)'),
  ]),
  'cyber-redes': sub('cyber-redes', 'Redes para Segurança', '🌐', 'mint', 'Entenda a rede por dentro — onde tudo acontece.', [
    L('cr-1', 'Modelo TCP/IP e OSI', 'camadas, encapsulamento, como os dados trafegam'),
    L('cr-2', 'Endereçamento IP e sub-redes', 'IPv4, máscara, sub-redes, IPv6 introdução'),
    L('cr-3', 'Portas e protocolos', 'TCP, UDP, HTTP, DNS, SSH, FTP'),
    L('cr-4', 'Análise de tráfego com Wireshark', 'captura e leitura de pacotes (uso defensivo)'),
    L('cr-5', 'DNS e como é explorado', 'resolução de nomes, ataques de DNS e defesa'),
    L('cr-6', 'Firewalls', 'tipos, regras, como protegem a rede'),
    L('cr-7', 'VPN e túneis', 'criptografia de tráfego, quando usar'),
    L('cr-8', 'Wi-Fi e segurança sem fio', 'WPA2/WPA3, riscos de redes abertas'),
    L('cr-9', 'Segmentação de rede', 'VLANs, DMZ, defesa em profundidade'),
  ]),
  'cyber-ferramentas': sub('cyber-ferramentas', 'Ferramentas & Pentest Ético', '🧰', 'ember', 'As ferramentas do profissional e para que servem cada uma.', [
    L('cft-1', 'Kali Linux e o arsenal', 'visão geral das principais ferramentas e propósitos'),
    L('cft-2', 'Reconhecimento (footprinting)', 'OSINT, coleta de informações públicas'),
    L('cft-3', 'Nmap: varredura de portas', 'descoberta de hosts e serviços (em ambiente autorizado)'),
    L('cft-4', 'Enumeração de serviços', 'identificar versões e configurações'),
    L('cft-5', 'Burp Suite', 'interceptar e analisar requisições web'),
    L('cft-6', 'Metasploit (conceito)', 'o que é um framework de exploração e seu uso ético'),
    L('cft-7', 'Quebra de senhas: como funciona', 'hashes, força bruta, dicionário — e por que senhas fortes importam'),
    L('cft-8', 'Relatório de pentest', 'documentar achados e recomendar correções'),
  ]),
  'cyber-web': sub('cyber-web', 'Vulnerabilidades Web (OWASP)', '🕸️', 'gold', 'As falhas web mais comuns: como surgem e como corrigir.', [
    L('cw-1', 'OWASP Top 10: visão geral', 'as principais categorias de risco web'),
    L('cw-2', 'Injeção de SQL (SQLi)', 'como ocorre, impacto e como prevenir (queries parametrizadas)'),
    L('cw-3', 'Cross-Site Scripting (XSS)', 'tipos, impacto, sanitização e CSP'),
    L('cw-4', 'CSRF', 'falsificação de requisição e tokens anti-CSRF'),
    L('cw-5', 'Autenticação quebrada', 'sessões, senhas, MFA, boas práticas'),
    L('cw-6', 'Controle de acesso falho', 'IDOR, escalonamento de privilégio e defesa'),
    L('cw-7', 'Configurações inseguras', 'headers, exposição de dados, hardening web'),
    L('cw-8', 'SSRF e upload de arquivos', 'riscos e mitigação'),
    L('cw-9', 'Como blindar uma aplicação', 'checklist de segurança no desenvolvimento'),
  ]),
  'cyber-cripto': sub('cyber-cripto', 'Criptografia', '🔐', 'violet', 'Como proteger dados — a matemática que segura a internet.', [
    L('cc-1', 'Conceitos de criptografia', 'confidencialidade, cifragem, chaves'),
    L('cc-2', 'Criptografia simétrica', 'AES, chave única, usos'),
    L('cc-3', 'Criptografia assimétrica', 'chave pública e privada, RSA'),
    L('cc-4', 'Funções hash', 'SHA, MD5, integridade, por que senhas viram hash'),
    L('cc-5', 'Assinatura digital e certificados', 'autenticidade, PKI, como funciona o HTTPS'),
    L('cc-6', 'TLS/SSL na prática', 'handshake, cadeado do navegador'),
    L('cc-7', 'Esteganografia', 'esconder dados, uso em CTFs'),
    L('cc-8', 'Boas práticas de criptografia', 'erros comuns, não criar a própria cripto'),
  ]),
  'cyber-defesa': sub('cyber-defesa', 'Malware, Forense & Resposta', '🛡️', 'mint', 'Entenda ameaças, detecte e responda a incidentes.', [
    L('cd-1', 'Tipos de malware', 'vírus, worm, trojan, ransomware, spyware — comportamento (sem criação)'),
    L('cd-2', 'Como detectar e remover malware', 'sinais, antivírus, análise comportamental'),
    L('cd-3', 'IDS/IPS e SIEM', 'detecção de intrusão, monitoramento, logs'),
    L('cd-4', 'Hardening de sistemas', 'reduzir superfície de ataque, atualizações, permissões'),
    L('cd-5', 'Backup e continuidade', 'estratégias de backup, recuperação de desastres'),
    L('cd-6', 'Análise forense digital', 'preservar evidências, cadeia de custódia, investigação'),
    L('cd-7', 'Resposta a incidentes', 'fases: preparar, detectar, conter, erradicar, recuperar'),
    L('cd-8', 'Blue Team vs Red Team', 'papéis defensivos e ofensivos (éticos), purple team'),
  ]),
  'cyber-python': sub('cyber-python', 'Python para Segurança', '🐍', 'ember', 'Automatize tarefas de segurança de forma legítima.', [
    L('cp-1', 'Python para segurança: por quê', 'automação defensiva, ecossistema, ética'),
    L('cp-2', 'Manipulação de strings e arquivos', 'parsear logs, ler arquivos'),
    L('cp-3', 'Requests e APIs', 'consultar serviços, automatizar verificações'),
    L('cp-4', 'Sockets e redes', 'conexões básicas, varredura simples em lab autorizado'),
    L('cp-5', 'Expressões regulares', 'encontrar padrões em logs e textos'),
    L('cp-6', 'Análise de logs', 'detectar eventos suspeitos automaticamente'),
    L('cp-7', 'Automação de tarefas defensivas', 'scripts úteis para o dia a dia do analista'),
  ]),
  'cyber-ctf': sub('cyber-ctf', 'CTFs, Inglês Técnico & Carreira', '🚩', 'gold', 'Pratique como num jogo e construa sua carreira.', [
    L('cx-1', 'O que são CTFs', 'Capture The Flag, formatos, plataformas (HTB, TryHackMe, picoCTF)'),
    L('cx-2', 'Categoria Web em CTFs', 'raciocínio para desafios web em ambiente de treino'),
    L('cx-3', 'Categoria Crypto', 'desafios de criptografia típicos'),
    L('cx-4', 'Categoria Forense', 'análise de arquivos e capturas'),
    L('cx-5', 'OSINT em CTFs', 'investigação com informação pública'),
    L('cx-6', 'Inglês técnico para segurança', 'vocabulário: payload, exploit, patch, breach, threat'),
    L('cx-7', 'Certificações', 'CompTIA Security+, CEH, OSCP — visão geral'),
    L('cx-8', 'Carreira em segurança', 'áreas, mercado, como começar e evoluir'),
  ]),
}
