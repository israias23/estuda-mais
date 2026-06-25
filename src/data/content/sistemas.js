// src/data/content/sistemas.js
// Trilha SISTEMAS OPERACIONAIS — formar um profissional em SO.
// Linux, Windows e uma trilha de Redes/Servidores/Virtualização.

const L = (id, title, focus) => ({ id, title, focus })
const sub = (id, title, icon, color, description, lessons) => ({
  id, title, icon, color, tracks: ['sistemas'], description, lessons,
})

export const sistemasSubjects = {
  linux: sub('linux', 'Linux', '🐧', 'ink', 'Domine o sistema que roda servidores, nuvem e segurança.', [
    L('lnx-1', 'O que é Linux e distribuições', 'kernel, distros, software livre, onde é usado'),
    L('lnx-2', 'O terminal e a shell', 'o que é a shell, abrir terminal, estrutura de um comando'),
    L('lnx-3', 'Navegação e arquivos', 'ls, cd, pwd, cp, mv, rm, mkdir, hierarquia de diretórios'),
    L('lnx-4', 'Visualizar e editar arquivos', 'cat, less, head, tail, nano, vim básico'),
    L('lnx-5', 'Permissões', 'usuário/grupo/outros, chmod, chown, rwx'),
    L('lnx-6', 'Usuários e grupos', 'useradd, sudo, /etc/passwd, gerenciamento'),
    L('lnx-7', 'Processos', 'ps, top, kill, jobs, foreground/background'),
    L('lnx-8', 'Gerenciamento de pacotes', 'apt, dpkg, repositórios, atualização'),
    L('lnx-9', 'Redirecionamento e pipes', 'stdin/stdout, |, >, >>, grep'),
    L('lnx-10', 'Filtros de texto', 'grep, sed, awk, cut, sort'),
    L('lnx-11', 'Redes no Linux', 'ip, ping, ss, ssh, scp'),
    L('lnx-12', 'Agendamento de tarefas', 'cron, crontab, systemd timers'),
    L('lnx-13', 'Scripts em Bash', 'variáveis, condicionais, laços, primeiro script'),
    L('lnx-14', 'Bash avançado', 'funções, argumentos, automação real'),
    L('lnx-15', 'Logs e systemd', 'journalctl, systemctl, serviços'),
    L('lnx-16', 'Projeto: administrar um servidor', 'cenário real de administração Linux'),
  ]),
  windows: sub('windows', 'Windows', '🪟', 'violet', 'O sistema mais usado no mundo corporativo, por dentro.', [
    L('win-1', 'Arquitetura do Windows', 'como funciona, versões, contas de usuário'),
    L('win-2', 'Sistema de arquivos NTFS', 'NTFS, pastas do sistema, permissões NTFS'),
    L('win-3', 'Registro do Windows', 'o que é, estrutura, cuidados'),
    L('win-4', 'Prompt de comando (CMD)', 'dir, cd, copy, del, ipconfig, tasklist'),
    L('win-5', 'PowerShell: introdução', 'cmdlets, pipeline, diferença para o CMD'),
    L('win-6', 'PowerShell: automação', 'scripts, variáveis, laços, tarefas administrativas'),
    L('win-7', 'Usuários, grupos e permissões', 'contas locais, UAC, controle de acesso'),
    L('win-8', 'Processos e desempenho', 'Gerenciador de Tarefas, serviços, inicialização'),
    L('win-9', 'Rede no Windows', 'configurar rede, compartilhamento, firewall'),
    L('win-10', 'Active Directory (introdução)', 'domínio, GPO, autenticação corporativa'),
    L('win-11', 'Manutenção', 'atualizações, limpeza, backup, restauração'),
    L('win-12', 'Segurança no Windows', 'Defender, BitLocker, boas práticas'),
    L('win-13', 'Solução de problemas', 'logs de eventos, diagnóstico, ferramentas'),
    L('win-14', 'Projeto: configurar uma estação', 'cenário prático de configuração'),
  ]),
  'so-infra': sub('so-infra', 'Redes, Servidores & Virtualização', '🖧', 'mint', 'Leve o SO ao próximo nível: servidores e nuvem.', [
    L('si-1', 'Conceitos de servidores', 'o que é um servidor, cliente-servidor, serviços'),
    L('si-2', 'Servidor web (Apache/Nginx)', 'hospedar um site, configuração básica'),
    L('si-3', 'SSH e administração remota', 'acesso seguro, chaves, gerenciar à distância'),
    L('si-4', 'Virtualização', 'VMs, hypervisor, VirtualBox/VMware'),
    L('si-5', 'Contêineres e Docker', 'o que são, imagens, containers, vantagens'),
    L('si-6', 'Computação em nuvem', 'IaaS, PaaS, SaaS, principais provedores'),
    L('si-7', 'Backup e armazenamento', 'estratégias, RAID, redundância'),
    L('si-8', 'Monitoramento', 'acompanhar saúde e desempenho de servidores'),
  ]),
}
