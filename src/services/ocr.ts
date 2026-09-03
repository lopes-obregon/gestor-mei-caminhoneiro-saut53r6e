// tesseract.js does not expose declarations in the current project setup.

import Tesseract from "tesseract.js";


export interface ExtractedReceipt{
    amount: number;
    date: string | null;
    cnpj: string | null;
    category: string | null;
    description: string | null;
}

export async function ExtractReceiptFromImage(image: File | Blob): Promise<string> {
    const worker = await Tesseract.createWorker('por');
    
    try
    {
       
        const { data: { text }, } = await worker.recognize(image);
        
        return text;

    }
    finally
    {
        await worker.terminate();
    }
}

export function ParseExtractedText(text: string): ExtractedReceipt 
{
    const amountRegex = /(?:R\$|RI|RS)?\s*\d+[.,]\d{2}/i;
    const dateRegex = /(\d{2}\/\d{2}\/\d{4})/;
    const cnpjRegex = /(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/;
    const categoryRegex = /Categoria:\s*(.*)/;
    // Regex para capturar o local (N.ESTAB.)
    const localRegex = /N\.ESTAB\..*/i;
    const parts = text.match(localRegex)?.[0].split(" ");
    const local = parts[2]?.trim() + parts[3]?.trim() || ""; // Remove the "N." prefix and trim whitespace
    //descrição
    const descriptionRegex = /Descrição:\s*(.*)|DEBITO[\s:]*([\s\S]*?)CNPJ:/i;
    const descriçãoMath = text.match(descriptionRegex);
    const description = descriçãoMath?.[1] || descriçãoMath?.[2] || null; 
   // console.log("Local extraído do OCR:", parts); // Log the extracted location for debugging
    //console.log("Local:", local); // Log the extracted location for debugging
    //console.log("Descrição extraída do OCR:", descriçãoMath); // Log the extracted description for debugging
    //console.log("Descrição:", description); // Log the extracted description for debugging
   // console.log("Dados extraídos do OCR:", {})
    return {
        amount: parseFloat((text.match(amountRegex)?.[1] || '0').replace(',', '.')),
        date: text.match(dateRegex)?.[1] || null,
        cnpj: text.match(cnpjRegex)?.[1] || null,
        category: text.match(categoryRegex)?.[1] || null,
        description: description + local || null,
    };
}

// função de conveniência para extrair e analisar o texto de uma imagem de recibo
export async function ExtractReceiptOcr(image: File | Blob): Promise<ExtractedReceipt> 
{
    const rawText = await ExtractReceiptFromImage(image);
    console.log("----------------------------------------------------");// util pára ajustar o regex
    console.log("Texto extraído do OCR:", rawText);// util pára ajustar o regex
    return ParseExtractedText(rawText);
}