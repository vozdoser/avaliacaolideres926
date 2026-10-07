/**
 * Voz do Ser · Receptor de respostas da Ficha de Avaliação Comunicacional CONX
 *
 * O que faz: recebe cada ficha enviada pelo formulário, grava uma linha na
 * planilha e manda um aviso por e-mail para a Silvia.
 *
 * Como instalar, uma vez só:
 *  1. Crie uma planilha nova no Google Drive e dê o nome "RESPOSTAS AVALIACAO CONX".
 *  2. Nessa planilha, menu Extensões, depois Apps Script.
 *  3. Apague o conteúdo do editor e cole este arquivo inteiro.
 *  4. Salve (ícone de disquete).
 *  5. Clique em "Implantar", depois "Nova implantação".
 *  6. Em tipo, escolha "App da Web".
 *  7. Em "Executar como", deixe "Eu". Em "Quem pode acessar", escolha "Qualquer pessoa".
 *  8. Clique em Implantar, autorize o acesso quando o Google pedir.
 *  9. Copie a URL que termina em /exec.
 * 10. Abra o index.html e cole essa URL dentro das aspas na linha
 *     var ENDPOINT = "";
 *
 * Observação: depois de qualquer alteração neste script é preciso criar uma
 * nova versão da implantação para ela valer.
 */

var EMAIL_AVISO = "silvia.vozdoser@gmail.com";
var NOME_ABA = "respostas";

function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);
    gravar(dados);
    avisar(dados);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (erro) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, erro: String(erro) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("Receptor ativo.");
}

function gravar(d) {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(NOME_ABA) || planilha.insertSheet(NOME_ABA);

  var linha = {
    "recebido_em": new Date(),
    "terapeuta": d.terapeuta,
    "tipo": d.tipo,
    "participante": d.participante,
    "indice_inicio": d.indiceInicio,
    "indice_final": d.indiceFinal,
    "versao": d.versao
  };
  var respostas = d.respostas || {};
  Object.keys(respostas).forEach(function (k) { linha[k] = respostas[k]; });

  var ultimaCol = aba.getLastColumn();
  var cabecalho = ultimaCol > 0 ? aba.getRange(1, 1, 1, ultimaCol).getValues()[0] : [];
  if (cabecalho.length === 0 || cabecalho[0] === "") cabecalho = [];

  Object.keys(linha).forEach(function (k) {
    if (cabecalho.indexOf(k) === -1) cabecalho.push(k);
  });
  aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho]);
  aba.getRange(1, 1, 1, cabecalho.length).setFontWeight("bold");
  aba.setFrozenRows(1);

  var valores = cabecalho.map(function (k) {
    return linha.hasOwnProperty(k) ? linha[k] : "";
  });
  aba.appendRow(valores);
}

function avisar(d) {
  if (!EMAIL_AVISO) return;
  var assunto = "Avaliação CONX recebida · " + d.terapeuta + " · " + d.participante;
  var corpo = [
    "Nova ficha de avaliação recebida.",
    "",
    "Terapeuta: " + d.terapeuta,
    "Ficha: " + d.tipo + " · " + d.participante,
    "Índice de início: " + d.indiceInicio,
    "Índice final: " + d.indiceFinal,
    "Evolução: " + (Number(d.indiceFinal) - Number(d.indiceInicio)) + " pontos",
    "",
    "A linha completa está na planilha de respostas."
  ].join("\n");
  MailApp.sendEmail(EMAIL_AVISO, assunto, corpo);
}
