import * as XLSX from 'xlsx';

export const parseExcelMenu = async (fileBuffer) => {
  try {
    // Parse Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    if (jsonData.length < 2) {
      throw new Error('Invalid Excel format: Not enough rows');
    }
    
    // Get day headers (skip first column which is category)
    const headerRow = jsonData[0];
    const dateRow = jsonData[1];
    
    // Find day columns (skip first column)
    const dayColumns = {};
    for (let i = 1; i < headerRow.length; i++) {
      const dayHeader = String(headerRow[i] || '').trim().toLowerCase();
      const dateValue = String(dateRow[i] || '').trim();
      
      if (dayHeader && (dayHeader.includes('monday') || dayHeader.includes('tuesday') || 
          dayHeader.includes('wednesday') || dayHeader.includes('thursday') || 
          dayHeader.includes('friday') || dayHeader.includes('saturday') || 
          dayHeader.includes('sunday'))) {
        const dayKey = getDayKey(dayHeader);
        if (dayKey) {
          dayColumns[i] = {
            key: dayKey,
            date: extractDate(dateValue) || dateValue,
          };
        }
      }
    }
    
    // Initialize day menus
    const menuData = {};
    Object.values(dayColumns).forEach(({ key, date }) => {
      menuData[key] = {
        date: date,
        breakfast: [],
        lunch: [],
        snacks: [],
        dinner: [],
      };
    });
    
    // Parse meal items
    let currentMeal = null;
    
    for (let rowIndex = 2; rowIndex < jsonData.length; rowIndex++) {
      const row = jsonData[rowIndex];
      if (!row || row.length === 0) continue;
      
      const category = String(row[0] || '').trim().toLowerCase();
      
      // Detect meal category
      if (category.includes('breakfast')) {
        currentMeal = 'breakfast';
        continue;
      } else if (category.includes('lunch')) {
        currentMeal = 'lunch';
        continue;
      } else if (category.includes('snack')) {
        currentMeal = 'snacks';
        continue;
      } else if (category.includes('dinner')) {
        currentMeal = 'dinner';
        continue;
      }
      
      // Skip empty rows or non-meal rows
      if (!currentMeal || !category) continue;
      
      // Parse food items for each day
      Object.entries(dayColumns).forEach(([colIndex, { key }]) => {
        const foodName = String(row[parseInt(colIndex)] || '').trim();
        
        if (foodName && foodName.length > 0 && !foodName.includes('***')) {
          // Check if item already exists (by name)
          const existingItem = menuData[key][currentMeal].find(
            item => item.name.toLowerCase() === foodName.toLowerCase()
          );
          
          if (!existingItem) {
            menuData[key][currentMeal].push({
              name: foodName,
            });
          }
        }
      });
    }
    
    return menuData;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

/**
 * Convert day name to key format
 */
const getDayKey = (dayName) => {
  const day = dayName.toLowerCase();
  if (day.includes('monday')) return 'monday';
  if (day.includes('tuesday')) return 'tuesday';
  if (day.includes('wednesday')) return 'wednesday';
  if (day.includes('thursday')) return 'thursday';
  if (day.includes('friday')) return 'friday';
  if (day.includes('saturday')) return 'saturday';
  if (day.includes('sunday')) return 'sunday';
  return null;
};

/**
 * Extract date from Excel date value
 */
const extractDate = (dateValue) => {
  if (!dateValue) return '';
  
  // If it's already a date string in YYYY-MM-DD format, return it
  if (typeof dateValue === 'string' && dateValue.match(/\d{4}-\d{2}-\d{2}/)) {
    return dateValue;
  }
  
  // If it's an Excel date number, convert it
  if (typeof dateValue === 'number') {
    // Excel date serial number (days since 1900-01-01)
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
    return date.toISOString().split('T')[0];
  }
  
  // Try to parse date string in various formats
  if (typeof dateValue === 'string') {
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Continue
    }
  }
  
  // Return as-is if we can't parse it
  return dateValue;
};



