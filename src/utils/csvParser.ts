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
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1) // 跳过标题行
      .filter(line => line.trim()) // 过滤空行
      .map(line => {
        // 处理包含换行符的字段
        const values: string[] = [];
        let currentValue = '';
        let insideQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim());

        // 创建对象
        const signal: any = {};
        headers.forEach((header, index) => {
          const value = values[index] || '';
          signal[header.trim()] = header === 'id' ? parseInt(value) : value.replace(/^"|"$/g, '');
        });
        
        return signal as FutureSignal;
      });
  } catch (error) {
    console.error('Error loading future signals:', error);
    return [];
  }
} 