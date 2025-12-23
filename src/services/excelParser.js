import * as XLSX from 'xlsx';

/**
 * AI-Powered Excel Menu Parser
 * Intelligently analyzes Excel structure and extracts menu data
 */
export const parseExcelMenu = async (fileBuffer) => {
  const errors = [];
  const warnings = [];
  
  try {
    // Parse Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with all data
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    if (jsonData.length < 2) {
      throw new Error('Invalid Excel format: Not enough rows');
    }
    
    // AI Analysis: Analyze the entire sheet structure
    const analysis = analyzeSheetStructure(jsonData);
    
    if (!analysis.headerRow || analysis.headerRow < 0) {
      const errorMsg = 'Could not find day headers in the Excel file. Please ensure the file contains day names (Monday, Tuesday, etc.).';
      errors.push(errorMsg);
      throw new Error(errorMsg);
    }
    
    const headerRow = jsonData[analysis.headerRow];
    const dateRow = analysis.dateRow >= 0 ? jsonData[analysis.dateRow] : null;
    
    // Expected days
    const expectedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const foundDays = new Set();
    
    // Find day columns intelligently
    const dayColumns = {};
    for (let i = 0; i < headerRow.length; i++) {
      const cellValue = String(headerRow[i] || '').trim();
      const dayKey = extractDayFromText(cellValue);
      
      if (dayKey) {
        const dateValue = dateRow && dateRow[i] ? String(dateRow[i]).trim() : '';
        dayColumns[i] = {
          key: dayKey,
          date: extractDate(dateValue) || extractDateFromHeader(cellValue),
          columnIndex: i,
        };
        foundDays.add(dayKey);
      }
    }
    
    // Check for missing days
    const missingDays = expectedDays.filter(day => !foundDays.has(day));
    if (missingDays.length > 0) {
      warnings.push(`Missing days detected: ${missingDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}. These days will show as empty.`);
    }
    
    // Check if no days found at all
    if (Object.keys(dayColumns).length === 0) {
      errors.push('No valid day columns found. Please ensure your Excel file has day headers (Monday, Tuesday, etc.).');
      throw new Error('No valid day columns found');
    }
    
    // Initialize day menus for all expected days
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
    
    // AI-Powered meal detection and item extraction
    const mealSections = detectMealSections(jsonData, analysis.headerRow);
    
    // Extract menu items for each meal section
    Object.entries(mealSections).forEach(([mealType, section]) => {
      extractMenuItems(jsonData, section, dayColumns, menuData, mealType);
    });
    
    // Validate and clean extracted data
    const stats = validateAndCleanMenu(menuData, foundDays, warnings);
    
    if (stats.totalItems === 0) {
      errors.push('No menu items found in the Excel file. Please check the file format and ensure food items are listed.');
    }
    
    return {
      menuData,
      errors,
      warnings,
      stats,
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
 * AI Analysis: Analyze sheet structure to find headers, dates, and meal sections
 */
function analyzeSheetStructure(jsonData) {
  const analysis = {
    headerRow: -1,
    dateRow: -1,
    mealRows: [],
  };
  
  // Search for header row (contains day names)
  for (let rowIdx = 0; rowIdx < Math.min(15, jsonData.length); rowIdx++) {
    const row = jsonData[rowIdx];
    if (!row || row.length === 0) continue;
    
    // Count how many day names are in this row
    let dayCount = 0;
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const cellValue = String(row[colIdx] || '').trim().toLowerCase();
      if (extractDayFromText(cellValue)) {
        dayCount++;
      }
    }
    
    // If we found 3+ day names, this is likely the header row
    if (dayCount >= 3 && analysis.headerRow === -1) {
      analysis.headerRow = rowIdx;
      
      // Check next row for dates
      if (rowIdx + 1 < jsonData.length) {
        const nextRow = jsonData[rowIdx + 1];
        let dateCount = 0;
        for (let colIdx = 0; colIdx < nextRow.length; colIdx++) {
          const cellValue = String(nextRow[colIdx] || '').trim();
          // Check for date patterns
          if (cellValue.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/) || 
              (typeof nextRow[colIdx] === 'number' && nextRow[colIdx] > 40000)) {
            dateCount++;
          }
        }
        if (dateCount >= 2) {
          analysis.dateRow = rowIdx + 1;
        }
      }
      break;
    }
  }
  
  return analysis;
}

/**
 * AI-Powered: Detect meal sections in the Excel
 */
function detectMealSections(jsonData, startRow) {
  const mealSections = {
    breakfast: { startRow: -1, endRow: -1 },
    lunch: { startRow: -1, endRow: -1 },
    snacks: { startRow: -1, endRow: -1 },
    dinner: { startRow: -1, endRow: -1 },
  };
  
  const mealKeywords = {
    breakfast: ['breakfast', 'bf', 'morning'],
    lunch: ['lunch', 'afternoon'],
    snacks: ['snack', 'evening', 'tea time'],
    dinner: ['dinner', 'night', 'supper'],
  };
  
  let currentMeal = null;
  let currentStartRow = -1;
  
  for (let rowIdx = startRow + 2; rowIdx < jsonData.length; rowIdx++) {
    const row = jsonData[rowIdx];
    if (!row || row.length === 0) continue;
    
    const firstCell = String(row[0] || '').trim().toLowerCase();
    
    // Check if this row starts a new meal section
    for (const [mealType, keywords] of Object.entries(mealKeywords)) {
      if (keywords.some(keyword => firstCell.includes(keyword))) {
        // End previous meal section
        if (currentMeal && currentStartRow >= 0) {
          mealSections[currentMeal].endRow = rowIdx - 1;
        }
        // Start new meal section
        currentMeal = mealType;
        mealSections[mealType].startRow = rowIdx;
        currentStartRow = rowIdx;
        break;
      }
    }
  }
  
  // Set end row for last meal
  if (currentMeal && currentStartRow >= 0) {
    mealSections[currentMeal].endRow = jsonData.length - 1;
  }
  
  return mealSections;
}

/**
 * AI-Powered: Extract menu items from a meal section
 */
function extractMenuItems(jsonData, section, dayColumns, menuData, mealType) {
  if (section.startRow < 0) return;
  
  const startRow = section.startRow + 1; // Skip meal header row
  const endRow = section.endRow >= 0 ? section.endRow : jsonData.length;
  
  for (let rowIdx = startRow; rowIdx < endRow; rowIdx++) {
    const row = jsonData[rowIdx];
    if (!row || row.length === 0) continue;
    
    const firstCell = String(row[0] || '').trim().toLowerCase();
    
    // Skip if this is another meal header
    if (firstCell.includes('breakfast') || firstCell.includes('lunch') || 
        firstCell.includes('snack') || firstCell.includes('dinner')) {
      continue;
    }
    
    // Skip category headers (HOT FOOD, DAL, VEG, etc.)
    if (isCategoryHeader(firstCell)) {
      continue;
    }
    
    // Extract food items for each day column
    Object.entries(dayColumns).forEach(([colIndex, { key }]) => {
      const foodName = extractFoodName(row[parseInt(colIndex)]);
      
      if (foodName && foodName.length > 0) {
        // Check if item already exists
        const existingItem = menuData[key][mealType].find(
          item => item.name.toLowerCase() === foodName.toLowerCase()
        );
        
        if (!existingItem) {
          menuData[key][mealType].push({
            name: foodName,
          });
        }
      }
    });
  }
}

/**
 * AI-Powered: Extract and clean food name from cell
 */
function extractFoodName(cellValue) {
  if (!cellValue) return '';
  
  let foodName = String(cellValue).trim();
  
  // Remove common non-food indicators
  const skipPatterns = [
    /^\*+$/,  // Only asterisks
    /^pickle$/i,
    /^curd$/i,
    /^milk$/i,
    /^tea$/i,
    /^coffee$/i,
    /^water$/i,
    /^salad$/i,
    /^papad$/i,
    /^fryums$/i,
    /^sauces$/i,
    /^chutney$/i,
    /^onion$/i,
    /^lemon$/i,
    /^techha$/i,
    /^dessert/i,
    /^non-veg/i,
    /^non veg/i,
  ];
  
  // Skip if matches skip patterns
  if (skipPatterns.some(pattern => pattern.test(foodName))) {
    return '';
  }
  
  // Clean up food name
  foodName = foodName
    .replace(/\s+/g, ' ')  // Multiple spaces to single
    .replace(/^\s+|\s+$/g, '')  // Trim
    .replace(/^[\/\-\*]+|[\/\-\*]+$/g, '')  // Remove leading/trailing special chars
    .trim();
  
  // Skip if too short or empty
  if (foodName.length < 2) return '';
  
  // Skip if it's just numbers or special characters
  if (/^[\d\s\-\*\/]+$/.test(foodName)) return '';
  
  return foodName;
}

/**
 * Check if a cell value is a category header
 */
function isCategoryHeader(cellValue) {
  const categoryHeaders = [
    'hot food', 'dal', 'veg', 'rice', 'roti', 'salad', 'pickle',
    'beverages', 'fruits', 'cereals', 'dessert', 'non-veg', 'curd',
    'milk', 'refreshment', 'chutney', 'sauces', 'fryums', 'papad',
  ];
  
  return categoryHeaders.some(header => cellValue.includes(header));
}

/**
 * Extract day name from text (handles formats like "Monday 15/12/25")
 */
function extractDayFromText(text) {
  if (!text) return null;
  
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('monday')) return 'monday';
  if (lowerText.includes('tuesday')) return 'tuesday';
  if (lowerText.includes('wednesday')) return 'wednesday';
  if (lowerText.includes('thursday')) return 'thursday';
  if (lowerText.includes('friday')) return 'friday';
  if (lowerText.includes('saturday')) return 'saturday';
  if (lowerText.includes('sunday')) return 'sunday';
  
  return null;
}

/**
 * Extract date from header text (e.g., "Monday 15/12/25")
 */
function extractDateFromHeader(headerText) {
  if (!headerText) return '';
  
  // Look for date pattern in header
  const dateMatch = headerText.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    let year = parseInt(dateMatch[3]);
    if (year < 100) year = 2000 + year;
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }
  
  return '';
}

/**
 * Extract date from Excel date value
 */
function extractDate(dateValue) {
  if (!dateValue) return '';
  
  // If it's already a date string in YYYY-MM-DD format
  if (typeof dateValue === 'string' && dateValue.match(/\d{4}-\d{2}-\d{2}/)) {
    return dateValue;
  }
  
  // Try to parse date formats like "15/12/25" or "15/12/2025"
  if (typeof dateValue === 'string') {
    const dateMatch = dateValue.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1;
      let year = parseInt(dateMatch[3]);
      if (year < 100) year = 2000 + year;
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  }
  
  // If it's an Excel date number
  if (typeof dateValue === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + dateValue * 86400000);
    return date.toISOString().split('T')[0];
  }
  
  // Try to parse as date string
  if (typeof dateValue === 'string') {
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) && date.getFullYear() > 1900) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Continue
    }
  }
  
  return '';
}

/**
 * Validate and clean menu data, return statistics
 */
function validateAndCleanMenu(menuData, foundDays, warnings) {
  const stats = {
    daysFound: foundDays.size,
    daysMissing: 7 - foundDays.size,
    totalItems: 0,
    mealCounts: { breakfast: 0, lunch: 0, snacks: 0, dinner: 0 },
  };
  
  // Count items and clean data
  Object.entries(menuData).forEach(([day, dayData]) => {
    Object.entries(dayData).forEach(([meal, items]) => {
      if (meal !== 'date' && Array.isArray(items)) {
        // Remove duplicates and empty items
        const uniqueItems = [];
        const seenNames = new Set();
        
        items.forEach(item => {
          const name = item.name.trim();
          if (name && name.length > 0 && !seenNames.has(name.toLowerCase())) {
            seenNames.add(name.toLowerCase());
            uniqueItems.push({ name });
          }
        });
        
        menuData[day][meal] = uniqueItems;
        stats.mealCounts[meal] += uniqueItems.length;
        stats.totalItems += uniqueItems.length;
        
        // Warn if day was found but meal is empty
        if (foundDays.has(day) && uniqueItems.length === 0) {
          warnings.push(`${day.charAt(0).toUpperCase() + day.slice(1)} ${meal} has no items.`);
        }
      }
    });
  });
  
  return stats;
}
