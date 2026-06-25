// src/services/certificateService.js
// Gera o certificado de conclusão em PDF (paisagem A4) usando jsPDF.
// Tudo desenhado em código — sem imagens externas — para o download sair leve e nítido.

import { jsPDF } from 'jspdf'
import { db, firebaseEnabled } from '../firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const SIGNER = 'Israias Alves Marques'

const VIOLET = [91, 63, 230]
const VIOLET_DEEP = [67, 38, 196]
const GOLD = [214, 158, 46]
const INK = [22, 21, 42]
const SLATE = [107, 106, 133]
const CREAM = [250, 249, 245]

export function certCode(studentName, subjectTitle, dateStr) {
  return verifyCode(`${studentName}|${subjectTitle}|${dateStr}`)
}

function verifyCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  const base = h.toString(36).toUpperCase().padStart(8, '0').slice(0, 8)
  return `${base.slice(0, 4)}-${base.slice(4, 8)}`
}

function validateUrl() {
  try { return `${window.location.origin}/validar-certificado` } catch { return 'estuda+/validar-certificado' }
}

const CERT_LS = (code) => `estudamais:cert:${code}`

// Registra o certificado de forma GLOBAL (Firestore) + cache local, para que possa ser
// validado por qualquer pessoa pelo código, em qualquer aparelho.
export async function issueCertificate({ uid, studentName, cpf, subjectId, subjectTitle, xp, dateStr }) {
  const code = certCode(studentName, subjectTitle, dateStr)
  const record = { code, studentName, cpf: maskCpf(cpf), subjectId, subjectTitle, xp, dateStr, uid: uid || 'anon', issuedAt: Date.now() }
  try { localStorage.setItem(CERT_LS(code), JSON.stringify(record)) } catch { /* */ }
  if (firebaseEnabled) {
    try { await setDoc(doc(db, 'certificates', code), record, { merge: true }) } catch { /* */ }
  }
  return code
}

// Busca um certificado pelo código (validação pública).
export async function validateCertificate(code) {
  const key = (code || '').trim().toUpperCase()
  if (!key) return null
  if (firebaseEnabled) {
    try {
      const snap = await getDoc(doc(db, 'certificates', key))
      if (snap.exists()) return snap.data()
    } catch { /* */ }
  }
  try {
    const raw = localStorage.getItem(CERT_LS(key))
    if (raw) return JSON.parse(raw)
  } catch { /* */ }
  return null
}

// Mostra o CPF parcialmente, por privacidade, na validação pública.
function maskCpf(cpf) {
  if (!cpf) return ''
  const d = String(cpf).replace(/\D/g, '')
  if (d.length !== 11) return cpf
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`
}

function corner(pdf, x, y, dx, dy) {
  pdf.setDrawColor(...GOLD)
  pdf.setLineWidth(1.1)
  pdf.line(x, y, x + dx, y)
  pdf.line(x, y, x, y + dy)
}

export function generateCertificate({ studentName, cpf, subjectTitle, xp, dateStr, signer = SIGNER }) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = 297, H = 210
  const code = verifyCode(`${studentName}|${subjectTitle}|${dateStr}`)
  const hours = Math.max(1, Math.round((xp || 0) / 50))

  pdf.setFillColor(...CREAM)
  pdf.rect(0, 0, W, H, 'F')
  pdf.setFillColor(245, 243, 252)
  pdf.rect(0, 0, W, 6, 'F')
  pdf.rect(0, H - 6, W, 6, 'F')

  pdf.setDrawColor(...VIOLET)
  pdf.setLineWidth(1.8)
  pdf.rect(12, 12, W - 24, H - 24)
  pdf.setDrawColor(...GOLD)
  pdf.setLineWidth(0.5)
  pdf.rect(16, 16, W - 32, H - 32)

  corner(pdf, 16, 16, 12, 12)
  corner(pdf, W - 16, 16, -12, 12)
  corner(pdf, 16, H - 16, 12, -12)
  corner(pdf, W - 16, H - 16, -12, -12)

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(90)
  pdf.setTextColor(243, 240, 251)
  pdf.text('ESTUDA+', W / 2, H / 2 + 22, { align: 'center' })

  pdf.setFillColor(...VIOLET)
  pdf.circle(W / 2, 40, 13, 'F')
  pdf.setDrawColor(...GOLD)
  pdf.setLineWidth(1)
  pdf.circle(W / 2, 40, 16)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(15)
  pdf.setTextColor(255, 255, 255)
  pdf.text('E+', W / 2, 44.5, { align: 'center' })

  pdf.setTextColor(...INK)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(27)
  pdf.text('C E R T I F I C A D O', W / 2, 70, { align: 'center' })
  pdf.setFontSize(12)
  pdf.setTextColor(...SLATE)
  pdf.setFont('helvetica', 'normal')
  pdf.text('D E   C O N C L U S Ã O', W / 2, 78, { align: 'center' })

  pdf.setFontSize(12)
  pdf.setTextColor(...SLATE)
  pdf.text('A plataforma Estuda+ certifica que', W / 2, 92, { align: 'center' })

  pdf.setFont('times', 'bold')
  pdf.setFontSize(30)
  pdf.setTextColor(...VIOLET_DEEP)
  pdf.text(studentName, W / 2, 106, { align: 'center' })

  if (cpf) {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(...SLATE)
    pdf.text(`CPF: ${cpf}`, W / 2, 113, { align: 'center' })
  }

  pdf.setDrawColor(...GOLD)
  pdf.setLineWidth(0.5)
  pdf.line(W / 2 - 60, 119, W / 2 + 60, 119)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(13)
  pdf.setTextColor(...INK)
  pdf.text(`concluiu com êxito a trilha de ${subjectTitle},`, W / 2, 128, { align: 'center' })
  pdf.text(`com aproveitamento de ${xp} XP e carga estimada de ${hours} hora${hours > 1 ? 's' : ''} de estudo.`, W / 2, 136, { align: 'center' })

  pdf.setDrawColor(...INK)
  pdf.setLineWidth(0.4)
  pdf.line(48, 170, 110, 170)
  pdf.line(W - 110, 170, W - 48, 170)

  pdf.setFontSize(10)
  pdf.setTextColor(...SLATE)
  pdf.text(dateStr, 79, 176, { align: 'center' })
  pdf.text('Data de conclusão', 79, 181, { align: 'center' })

  pdf.setFont('times', 'italic')
  pdf.setFontSize(18)
  pdf.setTextColor(...INK)
  pdf.text(signer, W - 79, 168, { align: 'center' })
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(...SLATE)
  pdf.text('Fundador · Estuda+', W - 79, 176, { align: 'center' })
  pdf.text('Coordenação pedagógica', W - 79, 181, { align: 'center' })

  pdf.setFontSize(8.5)
  pdf.setTextColor(...SLATE)
  pdf.text(`Código de verificação: ${code}`, W / 2, 190, { align: 'center' })
  pdf.setTextColor(...VIOLET_DEEP)
  pdf.text(`Valide a autenticidade em: ${validateUrl()}`, W / 2, 195, { align: 'center' })
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  pdf.setTextColor(...VIOLET)
  pdf.text('estuda+', W / 2, 200.5, { align: 'center' })

  return pdf
}

export function downloadCertificate(opts) {
  const pdf = generateCertificate(opts)
  const safe = opts.subjectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  pdf.save(`certificado-${safe}.pdf`)
}

export async function shareCertificate(opts) {
  const pdf = generateCertificate(opts)
  const blob = pdf.output('blob')
  const file = new File([blob], 'certificado.pdf', { type: 'application/pdf' })
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'Meu certificado Estuda+',
      text: `Concluí a trilha de ${opts.subjectTitle} no Estuda+!`,
    })
    return true
  }
  downloadCertificate(opts)
  return false
}
