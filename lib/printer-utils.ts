/* eslint-disable @typescript-eslint/ban-ts-comment */
// lib/printer-utils.ts

/**
 * Utilitários para impressão via Web Serial API
 * Versão com suporte a acentos usando codificação CP850
 */

export interface SaleData {
  operatorName: string;
  totalAmount: number;
  items: Array<{
    title: string;
    author: string;
    codFle: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discount?: number;
  }>;
  payments: Array<{
    method: string;
    amount: number;
    change?: number;
  }>;
  saleDate: Date;
  sequentialId?: number;
}

/**
 * Verifica se a Web Serial API está disponível no navegador
 */
export const isWebSerialSupported = (): boolean => {
  return (
    typeof navigator !== "undefined" &&
    "serial" in navigator &&
    navigator.serial !== null
  );
};

/**
 * Detecta se há impressoras seriais conectadas
 */
export const detectPrinterAvailability = async (): Promise<boolean> => {
  if (!isWebSerialSupported()) {
    console.warn("Web Serial API não suportada neste navegador");
    return false;
  }

  try {
    // @ts-ignore - Ignorar erro de tipos temporariamente
    const ports = await navigator.serial.getPorts();
    console.log(`🔍 Portas seriais detectadas: ${ports.length}`);
    return ports.length > 0; // Qualquer porta serve
  } catch (error) {
    console.warn("Erro ao detectar impressoras:", error);
    return false;
  }
};

/**
 * Converte string UTF-8 para array de bytes CP850
 */
const encodeCP850 = (text: string): Uint8Array => {
  // Tabela de conversão UTF-8 para CP850 (Code Page 850)
  const cp850Map: Record<string, number> = {
    // Caracteres básicos ASCII (0-127) permanecem iguais
    // Caracteres especiais CP850 (128-255)
    Ç: 128,
    ü: 129,
    é: 130,
    â: 131,
    ä: 132,
    à: 133,
    å: 134,
    ç: 135,
    ê: 136,
    ë: 137,
    è: 138,
    ï: 139,
    î: 140,
    ì: 141,
    Ä: 142,
    Å: 143,
    É: 144,
    æ: 145,
    Æ: 146,
    ô: 147,
    ö: 148,
    ò: 149,
    û: 150,
    ù: 151,
    ÿ: 152,
    Ö: 153,
    Ü: 154,
    ø: 155,
    "£": 156,
    Ø: 157,
    "×": 158,
    ƒ: 159,
    á: 160,
    í: 161,
    ó: 162,
    ú: 163,
    ñ: 164,
    Ñ: 165,
    ª: 166,
    º: 167,
    "¿": 168,
    "®": 169,
    "¬": 170,
    "½": 171,
    "¼": 172,
    "¡": 173,
    "«": 174,
    "»": 175,
    "░": 176,
    "▒": 177,
    "▓": 178,
    "│": 179,
    "┤": 180,
    Á: 181,
    Â: 182,
    À: 183,
    "©": 184,
    "╣": 185,
    "║": 186,
    "╗": 187,
    "╝": 188,
    "¢": 189,
    "¥": 190,
    "┐": 191,
    "└": 192,
    "┴": 193,
    "┬": 194,
    "├": 195,
    "─": 196,
    "┼": 197,
    ã: 198,
    Ã: 199,
    "╚": 200,
    "╔": 201,
    "╩": 202,
    "╦": 203,
    "╠": 204,
    "═": 205,
    "╬": 206,
    "¤": 207,
    ð: 208,
    Ð: 209,
    Ê: 210,
    Ë: 211,
    È: 212,
    ı: 213,
    Í: 214,
    Î: 215,
    Ï: 216,
    "┘": 217,
    "┌": 218,
    "█": 219,
    "▄": 220,
    "¦": 221,
    Ì: 222,
    "▀": 223,
    Ó: 224,
    ß: 225,
    Ô: 226,
    Ò: 227,
    õ: 228,
    Õ: 229,
    µ: 230,
    þ: 231,
    Þ: 232,
    Ú: 233,
    Û: 234,
    Ù: 235,
    ý: 236,
    Ý: 237,
    "¯": 238,
    "´": 239,
    "≡": 240,
    "±": 241,
    "‗": 242,
    "¾": 243,
    "¶": 244,
    "§": 245,
    "÷": 246,
    "¸": 247,
    "°": 248,
    "¨": 249,
    "·": 250,
    "¹": 251,
    "³": 252,
    "²": 253,
    "■": 254,
    " ": 255,
  };

  const result: number[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charCode = char.charCodeAt(0);

    if (charCode < 128) {
      // ASCII básico - mantém o mesmo
      result.push(charCode);
    } else if (cp850Map[char] !== undefined) {
      // Caractere especial mapeado para CP850
      result.push(cp850Map[char]);
    } else {
      // Caractere não mapeado - usa '?' (63)
      result.push(63);
    }
  }

  return new Uint8Array(result);
};

/**
 * Gera comandos ESC/POS para impressão do recibo com suporte a acentos
 */
export const generateReceiptCommands = (saleData: SaleData): string => {
  const ESC = "\x1B";
  const GS = "\x1D";

  // Comandos ESC/POS
  const RESET = ESC + "@";
  const CENTER = ESC + "a" + "\x01";
  const LEFT = ESC + "a" + "\x00";
  const BOLD_ON = ESC + "E" + "\x01";
  const BOLD_OFF = ESC + "E" + "\x00";
  const CUT = GS + "V" + "\x42" + "\x00";
  const NEWLINE = "\n";
  const RIGHT = ESC + "a" + "\x02";

  // Configuração de codificação para suportar acentos
  const SET_CP850 = ESC + "t" + "\x13"; // Code Page 850 (Europa/Brasil)
  const SET_INTERNATIONAL = ESC + "R" + "\x07"; // Conjunto de caracteres Brasil

  let receipt = "";

  // Reset da impressora e configurar codificação
  receipt += RESET;
  receipt += SET_CP850; // Configura para CP850
  receipt += SET_INTERNATIONAL; // Configura para caracteres brasileiros

  // Cabeçalho centralizado
  receipt += CENTER;
  receipt += BOLD_ON;
  receipt += "FLE - FEIRA DE LIVROS ESPÍRITA" + NEWLINE;
  receipt += "BANCA DO LIVRO ESPÍRITA" + NEWLINE;
  receipt += BOLD_OFF;
  receipt += "================================" + NEWLINE;
  receipt += LEFT;

  // Informações da venda
  receipt += "SÃO JOSÉ DOS CAMPOS - SP" + NEWLINE;
  receipt += `Data: ${saleData.saleDate.toLocaleString("pt-BR")}` + NEWLINE;
  receipt += `Operador: ${saleData.operatorName}` + NEWLINE;
  if (saleData.sequentialId) {
    receipt += `Venda #${saleData.sequentialId}` + NEWLINE;
  }
  receipt += "================================" + NEWLINE;

  // Itens da venda
  receipt += BOLD_ON + "ITENS:" + BOLD_OFF + NEWLINE;
  saleData.items.forEach((item) => {
    receipt += `${item.title}` + NEWLINE;
    receipt += `  Código: ${item.codFle}` + NEWLINE;
    receipt += `  Qtd: ${item.quantity} ` + NEWLINE;
    receipt += `  Total: R$ ${item.totalPrice.toFixed(2)}` + NEWLINE;
    receipt += "--------------------------------" + NEWLINE;
  });

  // Total
  receipt += BOLD_ON;
  receipt += `TOTAL: R$ ${saleData.totalAmount.toFixed(2)}` + NEWLINE;
  receipt += BOLD_OFF;
  receipt += "================================" + NEWLINE;

  // Formas de pagamento
  receipt += BOLD_ON + "PAGAMENTO:" + BOLD_OFF + NEWLINE;
  saleData.payments.forEach((payment) => {
    const methodLabels: Record<string, string> = {
      CASH: "Dinheiro",
      CREDIT_CARD: "Cartão de Crédito",
      DEBIT_CARD: "Cartão de Débito",
      PIX: "PIX",
    };

    const label = methodLabels[payment.method] || payment.method;
    receipt += `${label}: R$ ${payment.amount.toFixed(2)}` + NEWLINE;

    if (payment.change && payment.change > 0) {
      receipt += `Troco: R$ ${payment.change.toFixed(2)}` + NEWLINE;
    }
  });

  receipt += "================================" + NEWLINE;
  receipt += CENTER;
  receipt +=
    "Serei na vida futura aquilo que eu própio houver feito de mim nesta vida;" +
    NEWLINE;
  receipt += "Allan Kardec - O Céu e o Inferno" + NEWLINE;
  receipt += RIGHT;
  receipt += NEWLINE + NEWLINE + NEWLINE;

  // Cortar papel
  receipt += CUT;

  return receipt;
};

/**
 * Testa a conexão com a impressora
 */
export const testPrinterConnection = async (
  saleData: SaleData
): Promise<boolean> => {
  return await printReceipt(saleData);
};

/**
 * Imprime o recibo usando Web Serial API com codificação CP850
 */
export const printReceipt = async (saleData: SaleData): Promise<boolean> => {
  if (!isWebSerialSupported()) {
    throw new Error("Web Serial API não suportada neste navegador");
  }

  try {
    console.log("🖨️ Iniciando processo de impressão com suporte a acentos...");

    // Usar a primeira porta autorizada disponível
    // @ts-ignore
    const ports = await navigator.serial.getPorts();

    if (ports.length === 0) {
      throw new Error(
        "Nenhuma porta serial autorizada. Autorize a impressora primeiro."
      );
    }

    const port = ports[0]; // Usar a primeira porta
    console.log("📍 Usando porta:", port);

    // Configurar conexão serial para impressoras térmicas
    await port.open({
      baudRate: 9600, // Padrão para impressoras térmicas
      dataBits: 8,
      stopBits: 1,
      parity: "none",
    });

    console.log("🔗 Porta aberta com sucesso");

    // Gerar comandos do recibo
    const receiptCommands = generateReceiptCommands(saleData);
    console.log("📄 Comandos gerados com codificação CP850...");

    // USAR A CODIFICAÇÃO CP850 para textos com acentos
    const writer = port.writable.getWriter();

    // Converter o texto para CP850 antes de enviar
    const encodedData = encodeCP850(receiptCommands);
    await writer.write(encodedData);

    console.log("✅ Dados enviados com codificação CP850 para acentos");

    // Liberar recursos
    await writer.close();
    await port.close();

    console.log("🎉 Impressão concluída com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro detalhado na impressão:", error);

    // Melhorar mensagens de erro
    if (error instanceof Error && error.message.includes("NotFoundError")) {
      throw new Error(
        "Não foi possível conectar com a impressora. Verifique se ela está ligada e funcionando."
      );
    } else if (
      error instanceof Error &&
      error.message.includes("No device selected")
    ) {
      throw new Error("Impressora não foi selecionada corretamente.");
    } else {
      throw error;
    }
  }
};
