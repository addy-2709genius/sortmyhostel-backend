import * as XLSX from 'xlsx';

export const parseExcelMenu = async (fileBuffer) => {
  const errors = [];
  const warnings = [];
  
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
    
    // Find the header row (look for row with day names)
    let headerRowIndex = -1;
    let dateRowIndex = -1;
    let headerRow = null;
    let dateRow = null;
    
    // Search for header row (contains day names) - check first 10 rows
    for (let rowIdx = 0; rowIdx < Math.min(10, jsonData.length); rowIdx++) {
      const row = jsonData[rowIdx];
      if (!row || row.length === 0) continue;
      
      // Check if this row contains day names in any column
      let dayCount = 0;
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const cellValue = String(row[colIdx] || '').trim().toLowerCase();
        if (cellValue.includes('monday') || cellValue.includes('tuesday') || 
            cellValue.includes('wednesday') || cellValue.includes('thursday') ||
            cellValue.includes('friday') || cellValue.includes('saturday') || 
            cellValue.includes('sunday')) {
          dayCount++;
        }
      }
      
      // If we found at least 3 day names, this is likely the header row
      if (dayCount >= 3) {
        headerRowIndex = rowIdx;
        headerRow = row;
        // Date row is usually the next row (check if it has dates)
        if (rowIdx + 1 < jsonData.length) {
          const nextRow = jsonData[rowIdx + 1];
          // Check if next row has date-like values
          let hasDates = false;
          for (let colIdx = 0; colIdx < nextRow.length; colIdx++) {
            const cellValue = String(nextRow[colIdx] || '').trim();
            // Check for date patterns: DD/MM/YY, DD/MM/YYYY, or numbers
            if (cellValue.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/) || 
                (typeof nextRow[colIdx] === 'number' && nextRow[colIdx] > 40000)) {
              hasDates = true;
              break;
            }
          }
          if (hasDates) {
            dateRowIndex = rowIdx + 1;
            dateRow = nextRow;
          }
        }
        break;
      }
    }
    
    if (headerRowIndex === -1 || !headerRow) {
      const errorMsg = 'Could not find day headers (Monday, Tuesday, etc.) in the Excel file. Please ensure the file has day names in a header row.';
      errors.push(errorMsg);
      throw new Error(errorMsg);
    }
    
    // Expected days
    const expectedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const foundDays = new Set();
    
    // Find day columns (skip first column which is usually category)
    const dayColumns = {};
    for (let i = 1; i < headerRow.length; i++) {
      const dayHeader = String(headerRow[i] || '').trim().toLowerCase();
      const dateValue = dateRow ? String(dateRow[i] || '').trim() : '';
      
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
          foundDays.add(dayKey);
        }
      }
    }
    
    // Check for missing days
    const missingDays = expectedDays.filter(day => !foundDays.has(day));
    if (missingDays.length > 0) {
      warnings.push(`Missing days detected: ${missingDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}. These days will show as empty.`);
    }
    
    // Check if no days found at all
    if (Object.keys(dayColumns).length === 0) {
      errors.push('No valid day columns found. Please ensure your Excel file has day headers (Monday, Tuesday, etc.) in the first row.');
      throw new Error('No valid day columns found');
    }
    
    // Initialize day menus for all expected days (even if missing in file)
    const menuData = {};
    expectedDays.forEach(day => {
      menuData[day] = {
        date: null,
        breakfast: [],
        lunch: [],
        snacks: [],
        dinner: [],
      };
    });
    
    // Set dates for found days
    Object.values(dayColumns).forEach(({ key, date }) => {
      if (menuData[key]) {
        menuData[key].date = date;
      }
    });
    
    // Parse meal items (start from after the date row)
    let currentMeal = null;
    let mealCounts = {
      breakfast: 0,
      lunch: 0,
      snacks: 0,
      dinner: 0,
    };
    
    const startRowIndex = Math.max(headerRowIndex + 2, 2); // Start after header and date rows
    for (let rowIndex = startRowIndex; rowIndex < jsonData.length; rowIndex++) {
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
        
        if (foodName && foodName.length > 0 && !foodName.includes('***') && !foodName.includes('****')) {
          // Clean up food name (remove extra spaces, special characters)
          const cleanName = foodName.replace(/\s+/g, ' ').trim();
          
          if (cleanName.length > 0) {
            // Check if item already exists (by name)
            const existingItem = menuData[key][currentMeal].find(
              item => item.name.toLowerCase() === cleanName.toLowerCase()
            );
            
            if (!existingItem) {
              menuData[key][currentMeal].push({
                name: cleanName,
              });
              mealCounts[currentMeal]++;
            }
          }
        }
      });
    }
    
    // Check for empty meals
    Object.entries(menuData).forEach(([day, dayData]) => {
      Object.entries(dayData).forEach(([meal, items]) => {
        if (meal !== 'date' && Array.isArray(items) && items.length === 0) {
          // Only warn if the day was found in the file
          if (foundDays.has(day)) {
            warnings.push(`${day.charAt(0).toUpperCase() + day.slice(1)} ${meal} has no items.`);
          }
        }
      });
    });
    
    // Summary statistics
    const totalItems = Object.values(menuData).reduce((sum, dayData) => {
      return sum + Object.values(dayData).reduce((mealSum, meal) => {
        return mealSum + (Array.isArray(meal) ? meal.length : 0);
      }, 0);
    }, 0);
    
    if (totalItems === 0) {
      errors.push('No menu items found in the Excel file. Please check the file format.');
    }
    
    return {
      menuData,
      errors,
      warnings,
      stats: {
        daysFound: foundDays.size,
        daysMissing: missingDays.length,
        totalItems,
        mealCounts,
      },
    };
  } catch (error) {
    errors.push(`Failed to parse Excel file: ${error.message}`);
    return {
      menuData: {},
      errors,
      warnings,
      stats: {
        daysFound: 0,
        daysMissing: 7,
        totalItems: 0,
        mealCounts: { breakfast: 0, lunch: 0, snacks: 0, dinner: 0 },
      },
    };
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
  
  // Try to parse date formats like "15/12/25" or "15/12/2025"
  if (typeof dateValue === 'string') {
    // Match DD/MM/YY or DD/MM/YYYY
    const dateMatch = dateValue.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1; // Month is 0-indexed
      let year = parseInt(dateMatch[3]);
      if (year < 100) {
        year = 2000 + year; // Convert 2-digit year to 4-digit
      }
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
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
