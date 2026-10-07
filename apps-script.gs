/**
 * Voz do Ser · Base de dados da Ficha de Avaliação Comunicacional CONX
 *
 * Recebe cada ficha enviada pelo formulário, grava na aba "respostas",
 * recalcula as abas PAINEL e TEXTOS e manda um aviso por e-mail.
 *
 * Menu "Voz do Ser" na planilha: "Atualizar painel" recalcula tudo à mão.
 */

var EMAIL_AVISO = "silvia.vozdoser@gmail.com";
var ABA_RESP = "respostas";
var ABA_PAINEL = "PAINEL";
var ABA_TEXTOS = "TEXTOS";

var PARTICIPANTES = ["Gabriel", "Guilherme", "Luiza", "Rodrigo"];
var TERAPEUTAS = ["Gabriel Hatt", "Luana Curti", "Silvia Maciel", "Luiza Lio"];
var PREVISTO = {
  "Gabriel Hatt": ["Guilherme", "Rodrigo", "Gabriel"],
  "Luana Curti": ["Guilherme", "Luiza"],
  "Silvia Maciel": ["Rodrigo", "Gabriel"],
  "Luiza Lio": ["Luiza"]
};

var EIXOS = [
  { nome: "Autoconhecimento e leitura de perfil", itens: ["a1", "a2", "a3"] },
  { nome: "Expressividade", itens: ["b1", "b2", "b3", "b4"] },
  { nome: "Estrutura e impacto da mensagem", itens: ["c1", "c2", "c3"] },
  { nome: "Pressão, exposição e resposta", itens: ["d1", "d2", "d3"] },
  { nome: "Inteligência emocional e relacional", itens: ["e1", "e2", "e3"] }
];

var NOME_ITEM = {
  a1: "Reconhece o próprio perfil",
  a2: "Pega-se no pulo",
  a3: "Lê o perfil do interlocutor e adapta",
  b1: "Olhar e conexão",
  b2: "Presença corporal",
  b3: "Voz: clareza, modulação e ênfase",
  b4: "Pausa no lugar do vício",
  c1: "Usa a trilha da apresentação",
  c2: "Manchete primeiro",
  c3: "Adapta a profundidade técnica",
  d1: "Freio de arrumação",
  d2: "Sustenta o silêncio",
  d3: "Responde no SEG",
  e1: "Nomeia e regula a própria emoção",
  e2: "Dá feedback com CAO",
  e3: "Recebe feedback sem defesa"
};

var ITENS_GRUPO = [
  { id: "g1", nome: "Coesão e confiança entre os quatro" },
  { id: "g2", nome: "Cultura de feedback" },
  { id: "g3", nome: "Clareza sobre perfis" },
  { id: "g4", nome: "Disposição de se expor" },
  { id: "g5", nome: "Alinhamento entre as áreas" }
];

var TEXTOS_IND = [
  { id: "t_q_evid", nome: "Evidência observada" },
  { id: "t_q_avanco", nome: "Maior avanço" },
  { id: "t_q_risco", nome: "Risco se nada mudar" },
  { id: "t_q_prior", nome: "Prioridade 90 dias" }
];
var TEXTOS_GRP = [
  { id: "t_q_ganho", nome: "Ganho coletivo" },
  { id: "t_q_riscoorg", nome: "Risco organizacional" },
  { id: "t_q_priorg", nome: "Prioridade do grupo" },
  { id: "t_q_livre", nome: "Observação livre" }
];

/* ================= ENTRADA ================= */

function doPost(e) {
  var trava = LockService.getScriptLock();
  try {
    trava.waitLock(20000);
    var dados = JSON.parse(e.postData.contents);
    gravar(dados);
    try { atualizarPainel(); } catch (erroPainel) { console.error(erroPainel); }
    try { avisar(dados); } catch (erroAviso) { console.error(erroAviso); }
    return resposta({ ok: true });
  } catch (erro) {
    return resposta({ ok: false, erro: String(erro) });
  } finally {
    try { trava.releaseLock(); } catch (x) {}
  }
}

function doGet() {
  return ContentService.createTextOutput("Receptor Voz do Ser ativo.");
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Voz do Ser")
    .addItem("Atualizar painel", "atualizarPainel")
    .addToUi();
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function gravar(d) {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(ABA_RESP) || planilha.insertSheet(ABA_RESP, 0);

  var linha = {
    "recebido_em": new Date(),
    "terapeuta": d.terapeuta,
    "tipo": d.tipo,
    "participante": d.participante,
    "indice_inicio": d.indiceInicio,
    "indice_final": d.indiceFinal,
    "versao": d.versao
  };
  var r = d.respostas || {};
  Object.keys(r).forEach(function (k) { linha[k] = r[k]; });

  var ultimaCol = aba.getLastColumn();
  var cab = ultimaCol > 0 ? aba.getRange(1, 1, 1, ultimaCol).getValues()[0] : [];
  if (cab.length === 1 && cab[0] === "") cab = [];
  Object.keys(linha).forEach(function (k) { if (cab.indexOf(k) === -1) cab.push(k); });

  aba.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight("bold");
  aba.setFrozenRows(1);
  aba.appendRow(cab.map(function (k) { return linha.hasOwnProperty(k) ? linha[k] : ""; }));
}

function avisar(d) {
  if (!EMAIL_AVISO) return;
  var dif = (d.indiceFinal != null && d.indiceInicio != null) ? (d.indiceFinal - d.indiceInicio) : "";
  MailApp.sendEmail(
    EMAIL_AVISO,
    "Avaliação CONX recebida · " + d.terapeuta + " · " + d.participante,
    [
      "Nova ficha recebida.",
      "",
      "Terapeuta: " + d.terapeuta,
      "Ficha: " + d.tipo + " · " + d.participante,
      "Índice de início: " + d.indiceInicio,
      "Índice final: " + d.indiceFinal,
      "Evolução: " + dif + " pontos",
      "",
      "A aba PAINEL da planilha já foi recalculada."
    ].join("\n")
  );
}

/* ================= LEITURA ================= */

function lerRegistros() {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_RESP);
  if (!aba || aba.getLastRow() < 2) return [];
  var v = aba.getDataRange().getValues();
  var cab = v[0];
  var out = [];
  for (var i = 1; i < v.length; i++) {
    var o = {};
    for (var j = 0; j < cab.length; j++) o[cab[j]] = v[i][j];
    if (o.terapeuta) out.push(o);
  }
  return out;
}

/* ================= CÁLCULO (puro, sem planilha) ================= */

function num(v) {
  if (v === null || v === undefined || v === "" || v === "NO") return null;
  var n = Number(v);
  return isNaN(n) ? null : n;
}

function arred(v, casas) {
  if (v === null || v === undefined || isNaN(v)) return "";
  var f = Math.pow(10, casas || 0);
  return Math.round(v * f) / f;
}

/* diferença calculada sobre os valores já arredondados, para a tabela fechar a conta */
function dif(a, b, casas) {
  if (a === null || b === null || a === undefined || b === undefined || isNaN(a) || isNaN(b)) return "";
  return arred(arred(b, casas) - arred(a, casas), casas);
}

/* última versão de cada ficha (mesmo terapeuta + mesmo participante) */
function ultimas(registros) {
  var mapa = {};
  registros.forEach(function (r) {
    var k = r.terapeuta + "|" + r.tipo + "|" + r.participante;
    mapa[k] = r;
  });
  return Object.keys(mapa).map(function (k) { return mapa[k]; });
}

/* índice 0 a 100 de uma lista de itens numa fase */
function indice(r, ids, fase) {
  var s = 0, n = 0;
  ids.forEach(function (id) {
    var x = num(r[id + "_" + fase]);
    if (x !== null) { s += x; n++; }
  });
  return n ? ((s / n) - 1) / 4 * 100 : null;
}

function peso(r) {
  var c = num(r["x_conf_uni"]);
  return c === null ? 3 : c;
}

function mediaPonderada(lista) {
  var s = 0, w = 0;
  lista.forEach(function (p) {
    if (p.v !== null && p.v !== undefined && !isNaN(p.v)) { s += p.v * p.w; w += p.w; }
  });
  return w ? s / w : null;
}

function mediaSimples(lista) {
  var s = 0, n = 0;
  lista.forEach(function (v) { if (v !== null && v !== undefined && !isNaN(v)) { s += v; n++; } });
  return n ? s / n : null;
}

/* % de itens em que dois avaliadores ficaram a no máximo 1 ponto */
function concordancia(fichas, ids) {
  var dentro = 0, total = 0;
  for (var i = 0; i < fichas.length; i++) {
    for (var j = i + 1; j < fichas.length; j++) {
      ["ini", "fim"].forEach(function (fase) {
        ids.forEach(function (id) {
          var a = num(fichas[i][id + "_" + fase]), b = num(fichas[j][id + "_" + fase]);
          if (a !== null && b !== null) { total++; if (Math.abs(a - b) <= 1) dentro++; }
        });
      });
    }
  }
  return total ? dentro / total * 100 : null;
}

function todosItens() {
  var out = [];
  EIXOS.forEach(function (e) { out = out.concat(e.itens); });
  return out;
}

function montarPainel(registros) {
  var fichas = ultimas(registros);
  var ind = fichas.filter(function (r) { return r.tipo === "individual"; });
  var grp = fichas.filter(function (r) { return r.tipo === "grupo"; });
  var ITENS = todosItens();
  var blocos = [];

  /* 1. Status */
  var st = [["Terapeuta"].concat(PARTICIPANTES).concat(["Grupo"])];
  var previstasInd = 0, recebidasInd = 0, recebidasGrp = 0;
  TERAPEUTAS.forEach(function (t) {
    var linha = [t];
    PARTICIPANTES.forEach(function (p) {
      var tem = ind.some(function (r) { return r.terapeuta === t && r.participante === p; });
      var prev = (PREVISTO[t] || []).indexOf(p) > -1;
      if (prev) previstasInd++;
      if (tem) recebidasInd++;
      linha.push(tem ? "recebida" : (prev ? "pendente" : "·"));
    });
    var temG = grp.some(function (r) { return r.terapeuta === t; });
    if (temG) recebidasGrp++;
    linha.push(temG ? "recebida" : "pendente");
    st.push(linha);
  });
  blocos.push({
    titulo: "1 · Status de preenchimento",
    nota: "Fichas individuais: " + recebidasInd + " recebidas de " + previstasInd + " previstas. Fichas de grupo: " + recebidasGrp + " de 4.",
    tabela: st
  });

  /* 2. Índice por participante */
  var t2 = [["Participante", "Avaliadores", "Índice início", "Índice final", "Evolução (pontos)", "Prontidão porta-voz (1 a 5)", "Concordância entre avaliadores", "Distância média entre avaliadores (pontos)"]];
  var resumoPart = {};
  PARTICIPANTES.forEach(function (p) {
    var fs = ind.filter(function (r) { return r.participante === p; });
    var ini = mediaPonderada(fs.map(function (r) { return { v: indice(r, ITENS, "ini"), w: peso(r) }; }));
    var fim = mediaPonderada(fs.map(function (r) { return { v: indice(r, ITENS, "fim"), w: peso(r) }; }));
    var porta = mediaPonderada(fs.map(function (r) { return { v: num(r["x_porta_uni"]), w: peso(r) }; }));
    var conc = fs.length > 1 ? concordancia(fs, ITENS) : null;
    var dist = null;
    if (fs.length > 1) {
      var ds = [];
      for (var i = 0; i < fs.length; i++) for (var j = i + 1; j < fs.length; j++) {
        ["ini", "fim"].forEach(function (f) {
          var a = indice(fs[i], ITENS, f), b = indice(fs[j], ITENS, f);
          if (a !== null && b !== null) ds.push(Math.abs(a - b));
        });
      }
      dist = mediaSimples(ds);
    }
    resumoPart[p] = { ini: ini, fim: fim };
    t2.push([
      p,
      fs.map(function (r) { return r.terapeuta; }).join(", ") || "nenhum ainda",
      arred(ini), arred(fim),
      dif(ini, fim),
      arred(porta, 1),
      conc === null ? (fs.length === 1 ? "só 1 avaliador" : "") : arred(conc) + "%",
      arred(dist)
    ]);
  });
  var gi = mediaSimples(PARTICIPANTES.map(function (p) { return resumoPart[p].ini; }));
  var gf = mediaSimples(PARTICIPANTES.map(function (p) { return resumoPart[p].fim; }));
  t2.push(["MÉDIA DOS QUATRO", "", arred(gi), arred(gf), dif(gi, gf), "", "", ""]);
  blocos.push({
    titulo: "2 · Índice de Evolução Comunicacional por participante",
    nota: "Escala de 0 a 100. Quando há dois avaliadores, a nota combina os dois, com peso pela resposta de quanto cada um observou a pessoa. Concordância: % de itens em que os avaliadores ficaram a no máximo 1 ponto de distância.",
    tabela: t2
  });

  /* 3. Evolução por eixo */
  var cab3 = ["Participante"];
  EIXOS.forEach(function (e) { cab3.push(e.nome + " · início"); cab3.push(e.nome + " · final"); cab3.push(e.nome + " · evolução"); });
  var t3 = [cab3];
  var somaEixo = EIXOS.map(function () { return { ini: [], fim: [] }; });
  PARTICIPANTES.forEach(function (p) {
    var fs = ind.filter(function (r) { return r.participante === p; });
    var linha = [p];
    EIXOS.forEach(function (e, k) {
      var a = mediaPonderada(fs.map(function (r) { return { v: indice(r, e.itens, "ini"), w: peso(r) }; }));
      var b = mediaPonderada(fs.map(function (r) { return { v: indice(r, e.itens, "fim"), w: peso(r) }; }));
      somaEixo[k].ini.push(a); somaEixo[k].fim.push(b);
      linha.push(arred(a), arred(b), dif(a, b));
    });
    t3.push(linha);
  });
  var lm = ["MÉDIA DOS QUATRO"];
  somaEixo.forEach(function (s) {
    var a = mediaSimples(s.ini), b = mediaSimples(s.fim);
    lm.push(arred(a), arred(b), dif(a, b));
  });
  t3.push(lm);
  blocos.push({ titulo: "3 · Evolução por eixo", nota: "Mesma escala de 0 a 100, por eixo de trabalho.", tabela: t3 });

  /* 4. Itens: o que mais e o que menos evoluiu */
  var itens = ITENS.map(function (id) {
    var a = [], b = [];
    ind.forEach(function (r) { var x = num(r[id + "_ini"]), y = num(r[id + "_fim"]); if (x !== null) a.push(x); if (y !== null) b.push(y); });
    var ma = mediaSimples(a), mb = mediaSimples(b);
    return { id: id, ini: ma, fim: mb, del: (ma !== null && mb !== null) ? mb - ma : null };
  });
  itens.sort(function (x, y) { return (y.del === null ? -99 : y.del) - (x.del === null ? -99 : x.del); });
  var t4 = [["Item", "Média início (1 a 5)", "Média final (1 a 5)", "Evolução"]];
  itens.forEach(function (it) { t4.push([NOME_ITEM[it.id], arred(it.ini, 2), arred(it.fim, 2), dif(it.ini, it.fim, 2)]); });
  blocos.push({ titulo: "4 · Itens, do que mais evoluiu para o que menos evoluiu", nota: "Média de todas as fichas individuais, na escala original de 1 a 5.", tabela: t4 });

  /* 5. Grupo */
  var t5 = [["Eixo do grupo", "Média início (1 a 5)", "Média final (1 a 5)", "Evolução", "Fichas"]];
  ITENS_GRUPO.forEach(function (g) {
    var a = mediaSimples(grp.map(function (r) { return num(r[g.id + "_ini"]); }));
    var b = mediaSimples(grp.map(function (r) { return num(r[g.id + "_fim"]); }));
    t5.push([g.nome, arred(a, 2), arred(b, 2), dif(a, b, 2), grp.length]);
  });
  var suc = mediaSimples(grp.map(function (r) { return num(r["x_suc_uni"]); }));
  t5.push(["Prontidão comunicacional para a sucessão (hoje)", "", arred(suc, 2), "", grp.length]);
  blocos.push({ titulo: "5 · Visão de grupo", nota: "Média das fichas de grupo dos terapeutas.", tabela: t5 });

  /* TEXTOS */
  var tx = [["Participante", "Terapeuta", "Campo", "Resposta"]];
  PARTICIPANTES.forEach(function (p) {
    ind.filter(function (r) { return r.participante === p; }).forEach(function (r) {
      TEXTOS_IND.forEach(function (c) { if (r[c.id]) tx.push([p, r.terapeuta, c.nome, r[c.id]]); });
    });
  });
  grp.forEach(function (r) {
    TEXTOS_GRP.forEach(function (c) { if (r[c.id]) tx.push(["GRUPO", r.terapeuta, c.nome, r[c.id]]); });
  });

  return { blocos: blocos, textos: tx };
}

/* ================= ESCRITA ================= */

function atualizarPainel() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var res = montarPainel(lerRegistros());

  var aba = planilha.getSheetByName(ABA_PAINEL) || planilha.insertSheet(ABA_PAINEL, 0);
  aba.clear();
  var larg = 1;
  res.blocos.forEach(function (b) { larg = Math.max(larg, b.tabela[0].length); });

  var linha = 1;
  aba.getRange(linha, 1).setValue("PAINEL · Avaliação Comunicacional CONX").setFontSize(16).setFontWeight("bold").setFontColor("#193c3a");
  linha++;
  aba.getRange(linha, 1).setValue("Atualizado em " + Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm") + ". Recalcula sozinho a cada ficha recebida.").setFontColor("#5a7473");
  linha += 2;

  res.blocos.forEach(function (b) {
    aba.getRange(linha, 1).setValue(b.titulo).setFontSize(13).setFontWeight("bold").setFontColor("#193c3a");
    linha++;
    if (b.nota) { aba.getRange(linha, 1).setValue(b.nota).setFontColor("#5a7473").setFontStyle("italic"); linha++; }
    var t = b.tabela, w = t[0].length;
    var norm = t.map(function (r) { var x = r.slice(); while (x.length < w) x.push(""); return x; });
    aba.getRange(linha, 1, norm.length, w).setValues(norm);
    aba.getRange(linha, 1, 1, w).setBackground("#193c3a").setFontColor("#ffffff").setFontWeight("bold").setWrap(true);
    var ult = norm[norm.length - 1][0];
    if (String(ult).indexOf("MÉDIA") === 0) aba.getRange(linha + norm.length - 1, 1, 1, w).setBackground("#e1f4f2").setFontWeight("bold");
    linha += norm.length + 2;
  });
  aba.setColumnWidth(1, 260);
  for (var c = 2; c <= larg; c++) aba.setColumnWidth(c, 130);

  var abaT = planilha.getSheetByName(ABA_TEXTOS) || planilha.insertSheet(ABA_TEXTOS);
  abaT.clear();
  abaT.getRange(1, 1, res.textos.length, 4).setValues(res.textos);
  abaT.getRange(1, 1, 1, 4).setBackground("#193c3a").setFontColor("#ffffff").setFontWeight("bold");
  abaT.setFrozenRows(1);
  abaT.setColumnWidth(1, 110); abaT.setColumnWidth(2, 130); abaT.setColumnWidth(3, 170); abaT.setColumnWidth(4, 620);
  if (res.textos.length > 1) abaT.getRange(2, 4, res.textos.length - 1, 1).setWrap(true);
}
