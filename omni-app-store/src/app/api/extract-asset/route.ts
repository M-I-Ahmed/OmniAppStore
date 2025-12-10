import { NextRequest, NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'path';
import { pathToFileURL } from 'url';

// Configure worker for Node.js environment
if (typeof window === 'undefined') {
  // Server-side: use the worker file from node_modules with proper file:// URL
  const workerPath = path.join(
    process.cwd(),
    'node_modules',
    'pdfjs-dist',
    'legacy',
    'build',
    'pdf.worker.mjs'
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to .env.local',
        success: false
      }, { status: 500 });
    }

    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Extract text from PDF using pdfjs
    let extractedText = '';
    try {
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      const pdfDocument = await loadingTask.promise;
      
      const numPages = pdfDocument.numPages;
      const maxPages = Math.min(numPages, 3); // Only process first 3 pages for speed
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        extractedText += pageText + '\n';
      }
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return NextResponse.json({
        success: false,
        error: 'Could not extract text from PDF. The file may be image-based or corrupted.',
        data: { manufacturer: '', model: '', assetClass: '' }
      }, { status: 400 });
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return NextResponse.json({
        success: false,
        error: 'No text found in PDF. It may be a scanned image. Please fill manually.',
        data: { manufacturer: '', model: '', assetClass: '' }
      }, { status: 400 });
    }

    console.log('Extracted text length:', extractedText.length);
    console.log('First 200 chars:', extractedText.substring(0, 200));

    // Send to OpenAI for structured extraction
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting equipment specifications from technical datasheets. 
Extract the following information from the provided datasheet text:
- manufacturer: The manufacturer or brand name (e.g., Fanuc, ABB, Siemens)
- model: The model number or name (e.g., LR Mate 200iD, R-2000iC)
- assetClass: The category of equipment. Choose ONLY from: CNC Machine, Robot Arm, Conveyor System, Assembly Station, Inspection Equipment, Welding Equipment, Packaging Machine, Material Handling, Press Machine, Lathe, Mill, Sensor, Controller, Other

Return ONLY a JSON object with these exact keys. If you cannot find a field with high confidence, use an empty string.
Be conservative - only extract what you're absolutely certain about.`
          },
          {
            role: 'user',
            content: `Extract equipment details from this technical datasheet:\n\n${extractedText.substring(0, 4000)}`
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json({
        success: false,
        error: 'AI processing failed. Please fill manually.',
        data: { manufacturer: '', model: '', assetClass: '' }
      }, { status: 500 });
    }

    const aiResponse = await response.json();
    
    let extractedData;
    try {
      const content = aiResponse.choices[0].message.content;
      extractedData = JSON.parse(content);
      console.log('AI extracted:', extractedData);
    } catch (parseError) {
      console.error('Failed to parse AI response');
      return NextResponse.json({
        success: false,
        error: 'AI returned invalid format. Please fill manually.',
        data: { manufacturer: '', model: '', assetClass: '' }
      }, { status: 500 });
    }

    const fieldsFound = [
      extractedData.manufacturer ? 'manufacturer' : null,
      extractedData.model ? 'model' : null,
      extractedData.assetClass ? 'assetClass' : null
    ].filter(Boolean);

    return NextResponse.json({
      success: true,
      message: fieldsFound.length > 0
        ? `AI extracted ${fieldsFound.length} field(s): ${fieldsFound.join(', ')}. Please verify the data.`
        : 'AI could not extract data with confidence. Please fill manually.',
      data: {
        manufacturer: extractedData.manufacturer || '',
        model: extractedData.model || '',
        assetClass: extractedData.assetClass || ''
      }
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({ 
      error: 'Failed to process PDF',
      details: error instanceof Error ? error.message : 'Unknown error',
      success: false,
      data: { manufacturer: '', model: '', assetClass: '' }
    }, { status: 500 });
  }
}
