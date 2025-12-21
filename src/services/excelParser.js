import * as XLSX from 'xlsx';

export const parseExcelMenu = async (fileBuffer) => {
  try {
    // Parse Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Expected format: Day | Meal | Food Name | Date (optional)
    const menuData = {};

    data.forEach((row) => {
      const day = (row.Day || row.day || '').toLowerCase().trim();
      const meal = (row.Meal || row.meal || '').toLowerCase().trim();
      const foodName = (row['Food Name'] || row.Food || row.food || row.name || '').trim();
      const date = row.Date || row.date;

      if (!day || !meal || !foodName) {
        return; // Skip invalid rows
      }

      // Initialize day if not exists
      if (!menuData[day]) {
        menuData[day] = {
          date: date ? new Date(date) : null,
          breakfast: [],
          lunch: [],
          snacks: [],
          dinner: [],
        };
      }

      // Add food item to appropriate meal
      if (['breakfast', 'lunch', 'snacks', 'dinner'].includes(meal)) {
        menuData[day][meal].push({
          name: foodName,
        });
      }
    });

    return menuData;
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};


