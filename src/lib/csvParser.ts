export interface FutureSignal {
  id: number;
  sign: string;
  title: string;
  summary: string;
  intro: string;
  introQuote: string;
  detail: string;
  thumbnail: string;
}

export async function fetchFutureSignals(): Promise<FutureSignal[]> {
  try {
    const response = await fetch('/future-signals.csv');
    const csvText = await response.text();
    
    // 解析 CSV 文本
    const rows = parseCSV(csvText);
    const headers = rows[0];
    
    console.log('Total rows in CSV:', rows.length - 1); // 调试信息
    
    const signals = rows.slice(1) // 跳过标题行
      .filter(row => row.some(cell => cell.trim())) // 保留这个过滤器
      .map((row, index) => {
        const signal: any = {};
        headers.forEach((header, colIndex) => {
          const value = row[colIndex] || '';
          let cleanValue = value
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/\r\n|\n|\r/g, ' ')
            .trim();

          if (header.trim() === 'id') {
            const parsedId = parseInt(cleanValue);
            signal[header.trim()] = isNaN(parsedId) ? index + 1 : parsedId;
            return;
          }

          if (header.trim() === 'thumbnail') {
            const imageName = cleanValue.split('/').pop() || '';
            const validImageName = imageName.split(' ')[0];
            signal[header.trim()] = `/images/future-signals/${validImageName}`;
            console.log('Processing image:', signal[header.trim()]);
            return;
          }

          signal[header.trim()] = cleanValue || '';
        });
        
        return signal as FutureSignal;
      });

    console.log('Processed signals:', signals.length); // 调试信息
    return signals;
  } catch (error) {
    console.error('Error loading future signals:', error);
    return [];
  }
}

// 解析 CSV 文本为二维数组
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // 处理双引号转义
        currentValue += '"';
        i++; // 跳过下一个引号
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = '';
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // 跳过 \r\n 的 \n
      }
      if (currentValue) {
        currentRow.push(currentValue);
      }
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // 处理最后一个值和行
  if (currentValue) {
    currentRow.push(currentValue);
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  
  return rows;
} 