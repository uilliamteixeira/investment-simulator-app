// Robô de dados do Quanto Investir: gera fiis.json só com fontes oficiais e grátis.
//   Rendimentos: CVM, Informe Mensal de FII (dados.cvm.gov.br)
//   Preços:      B3, cotações históricas diárias (COTAHIST)
// Uso: node gerar.mjs [pasta_saida]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const SAIDA = process.argv[2] ?? path.join(import.meta.dirname, 'publico');
const MESES_JANELA = 12;
const VOLUME_MINIMO = 300_000; // R$ negociados no dia: filtra FIIs sem liquidez
const MAX_FIIS = 200;
const DY_MENSAL_MAX = 0.2; // acima disso o valor só pode estar em %
const MESES_VALIDOS_MIN = 9;
const DY_ANUAL_MAX = 25; // DY de 12 meses acima disso é tratado como dado suspeito

async function baixar(url, tentativas = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(180_000) });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return Buffer.from(await r.arrayBuffer());
    } catch (e) {
      if (i >= tentativas) throw new Error(`${url}: ${e.message}`);
      await new Promise((ok) => setTimeout(ok, 5000 * i));
    }
  }
}

/** Lê os arquivos de um .zip (diretório central + deflate), sem dependências. */
function lerZip(buf) {
  let fim = buf.length - 22;
  while (fim >= 0 && buf.readUInt32LE(fim) !== 0x06054b50) fim--;
  if (fim < 0) throw new Error('zip inválido');
  const total = buf.readUInt16LE(fim + 10);
  let p = buf.readUInt32LE(fim + 16);
  const arquivos = {};
  for (let i = 0; i < total; i++) {
    const metodo = buf.readUInt16LE(p + 10);
    const tamanho = buf.readUInt32LE(p + 20);
    const nLen = buf.readUInt16LE(p + 28), eLen = buf.readUInt16LE(p + 30), cLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const nome = buf.toString('latin1', p + 46, p + 46 + nLen);
    const inicio = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const dados = buf.subarray(inicio, inicio + tamanho);
    arquivos[nome] = metodo === 0 ? dados : zlib.inflateRawSync(dados);
    p += 46 + nLen + eLen + cLen;
  }
  return arquivos;
}

function csv(buf) {
  const linhas = buf.toString('latin1').split(/\r?\n/).filter(Boolean);
  const cab = linhas.shift().split(';');
  return linhas.map((l) => Object.fromEntries(l.split(';').map((v, i) => [cab[i], v])));
}

async function informesCvm() {
  const ano = new Date().getUTCFullYear();
  const geral = [], complemento = [];
  for (const a of [ano - 1, ano]) {
    const zip = await baixar(`https://dados.cvm.gov.br/dados/FII/DOC/INF_MENSAL/DADOS/inf_mensal_fii_${a}.zip`);
    if (!zip) continue;
    const arq = lerZip(zip);
    for (const [nome, conteudo] of Object.entries(arq)) {
      if (nome.includes('_geral_')) geral.push(...csv(conteudo));
      if (nome.includes('_complemento_')) complemento.push(...csv(conteudo));
    }
  }
  return { geral, complemento };
}

/** Arquivo diário mais recente da B3 (volta até 10 dias por causa de fins de semana e feriados). */
async function cotacoesB3() {
  for (let d = 0; d < 10; d++) {
    const dia = new Date(Date.now() - d * 86_400_000);
    const ddmmaaaa = dia.toISOString().slice(0, 10).split('-').reverse().join('');
    const zip = await baixar(`https://bvmf.bmfbovespa.com.br/InstDados/SerHist/COTAHIST_D${ddmmaaaa}.ZIP`, 2);
    if (!zip || zip.length < 1000) continue;
    const txt = Object.values(lerZip(zip))[0].toString('latin1');
    const porIsin = new Map();
    let data = null;
    for (const l of txt.split(/\r?\n/)) {
      // Layout oficial COTAHIST: tipo 01, mercado 010 (à vista), BDI 12 (fundos imobiliários)
      if (!l.startsWith('01') || l.slice(24, 27) !== '010' || l.slice(10, 12) !== '12') continue;
      data ??= l.slice(2, 10);
      porIsin.set(l.slice(230, 242), {
        ticker: l.slice(12, 24).trim(),
        preco: Number(l.slice(108, 121)) / 100,
        volume: Number(l.slice(170, 188)) / 100,
        negocios: Number(l.slice(147, 152)),
      });
    }
    if (!data) continue;
    return { data: `${data.slice(0, 4)}-${data.slice(4, 6)}-${data.slice(6, 8)}`, porIsin };
  }
  throw new Error('Nenhum arquivo COTAHIST nos últimos 10 dias');
}

const num = (v) => (v === undefined || v === '' ? NaN : Number(v));

async function main() {
  const [{ geral, complemento }, b3] = await Promise.all([informesCvm(), cotacoesB3()]);

  // Última versão entregue de cada fundo em cada mês.
  const porFundo = new Map();
  for (const c of complemento) {
    const cnpj = c.CNPJ_Fundo_Classe, mes = c.Data_Referencia;
    const meses = porFundo.get(cnpj) ?? new Map();
    const atual = meses.get(mes);
    if (!atual || num(c.Versao) > num(atual.Versao)) meses.set(mes, c);
    porFundo.set(cnpj, meses);
  }
  const cadastro = new Map();
  for (const g of geral) {
    const atual = cadastro.get(g.CNPJ_Fundo_Classe);
    if (!atual || g.Data_Referencia > atual.Data_Referencia) cadastro.set(g.CNPJ_Fundo_Classe, g);
  }

  const mesMaisRecente = [...new Set(complemento.map((c) => c.Data_Referencia))].sort().at(-1);
  const fiis = [];
  const descartados = [];
  for (const [cnpj, g] of cadastro) {
    const cot = b3.porIsin.get(g.Codigo_ISIN);
    if (!cot || cot.preco <= 0 || cot.volume < VOLUME_MINIMO) continue;
    const meses = [...(porFundo.get(cnpj)?.values() ?? [])]
      .sort((a, b) => a.Data_Referencia.localeCompare(b.Data_Referencia))
      .slice(-MESES_JANELA);
    if (meses.length < MESES_JANELA || meses.at(-1).Data_Referencia < mesMaisRecente) continue;

    // DY da CVM é sobre o valor patrimonial: rendimento por cota = DY do mês × VP da cota.
    // Alguns administradores informam o DY em % (1,05) em vez de fração (0,0105).
    const dyMes = (m) => {
      const v = num(m.Percentual_Dividend_Yield_Mes);
      return v > DY_MENSAL_MAX ? v / 100 : v;
    };
    // Meses com valor impossível (negativo, vazio) são erro de preenchimento na CVM: ficam de fora
    // e o ano é estimado pela média dos meses válidos.
    const rendimentos = meses
      .map((m) => dyMes(m) * num(m.Valor_Patrimonial_Cotas))
      .filter((r) => Number.isFinite(r) && r >= 0);
    const pagos = rendimentos.filter((r) => r > 0).length;
    const soma12 = rendimentos.length ? (rendimentos.reduce((a, b) => a + b, 0) / rendimentos.length) * 12 : 0;
    const dy12 = (soma12 / cot.preco) * 100;
    if (rendimentos.length < MESES_VALIDOS_MIN || pagos < 6 || dy12 > DY_ANUAL_MAX) {
      descartados.push(`${cot.ticker}:${dy12.toFixed(1)}%/${pagos}m`);
      continue;
    }
    const ultimo = meses.at(-1);
    const vp = num(ultimo.Valor_Patrimonial_Cotas);
    fiis.push({
      ticker: cot.ticker,
      nome: g.Nome_Fundo_Classe.trim(),
      segmento: g.Segmento_Atuacao?.trim() || 'Outros',
      preco: cot.preco,
      rendimentoMes: arred(rendimentos.at(-1), 4),
      rendimento12m: arred(soma12, 4),
      dy12m: arred((soma12 / cot.preco) * 100, 2),
      pvp: vp > 0 ? arred(cot.preco / vp, 2) : null,
      cotistas: num(ultimo.Total_Numero_Cotistas) || null,
      volumeDia: Math.round(cot.volume),
      mesesPagos: pagos,
    });
  }
  fiis.sort((a, b) => b.volumeDia - a.volumeDia);
  const saida = {
    versao: 1,
    geradoEm: new Date().toISOString(),
    dataCotacao: b3.data,
    referenciaRendimentos: mesMaisRecente,
    fontes: {
      rendimentos: 'CVM - Informe Mensal de FII (dados.cvm.gov.br)',
      precos: 'B3 - Cotações históricas diárias (COTAHIST)',
    },
    aviso: 'Rendimento por cota estimado pelo DY mensal informado à CVM × valor patrimonial da cota.',
    fiis: fiis.slice(0, MAX_FIIS),
  };
  fs.mkdirSync(SAIDA, { recursive: true });
  fs.writeFileSync(path.join(SAIDA, 'fiis.json'), JSON.stringify(saida));
  if (descartados.length) console.log(`Descartados (dado suspeito ou poucos pagamentos): ${descartados.join(' ')}`);
  console.log(`fiis.json: ${saida.fiis.length} FIIs · cotação ${b3.data} · rendimentos até ${mesMaisRecente}`);
}

const arred = (v, c) => Math.round(v * 10 ** c) / 10 ** c;

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
