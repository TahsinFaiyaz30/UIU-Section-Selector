import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import PDFParser from 'pdf2json';

export async function GET() {
  try {
    const pdfPath = path.join(process.cwd(), 'CLASS-ROUTINE-252.pdf');
    
    // Check if the file exists
    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json({ error: 'Pre-uploaded PDF file not found' }, { status: 404 });
    }

    return new Promise((resolve) => {
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('PDF parsing error:', errData.parserError);
        resolve(NextResponse.json({ error: 'Failed to parse the pre-uploaded PDF file' }, { status: 500 }));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          let text = '';
          pdfData.Pages.forEach((page: any) => {
            page.Texts.forEach((textItem: any) => {
              textItem.R.forEach((textRun: any) => {
                text += decodeURIComponent(textRun.T) + ' ';
              });
            });
          });

          console.log('Successfully parsed pre-uploaded PDF, text length:', text.length);
          resolve(NextResponse.json({ text }));
        } catch (error) {
          console.error('Error processing PDF data:', error);
          resolve(NextResponse.json({ error: 'Error processing the pre-uploaded PDF file' }, { status: 500 }));
        }
      });

      pdfParser.loadPDF(pdfPath);
    });
  } catch (error) {
    console.error('Error loading pre-uploaded PDF:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
