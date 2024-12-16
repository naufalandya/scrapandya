const axios = require('axios');

async function scrapeData() {
    // Get the current date
    const currentDate = new Date();
    
    // Calculate the first and last date of the previous month
    const firstDayPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Extract the year, month, and day
    const year = firstDayPrevMonth.getFullYear();
    const month = String(firstDayPrevMonth.getMonth() + 1).padStart(2, '0');
    const firstDay = String(firstDayPrevMonth.getDate()).padStart(2, '0');
    const lastDay = String(lastDayPrevMonth.getDate()).padStart(2, '0');

    // Loop through each day of the previous month
    for (let day = 1; day <= lastDayPrevMonth.getDate(); day++) {
        const formattedDay = String(day).padStart(2, '0');
        
        // Construct the URL
        const url = `https://amr.pln-jawa-bali.co.id/system.php?sethtmlprop_starttime_lday=${formattedDay}&sethtmlprop_starttime_lmonth=${month}&sethtmlprop_starttime_lyear=${year}&sethtmlprop_starttime_lhour=00&sethtmlprop_starttime_lmin=00&sethtmlprop_starttime=${year}-${month}-${formattedDay}+00%3A00%3A00&sethtmlprop_starttime_FixDatebox=TRUE&sethtmlprop_endtime_lday=${formattedDay}&sethtmlprop_endtime_lmonth=${month}&sethtmlprop_endtime_lyear=${year}&sethtmlprop_endtime_lhour=23&sethtmlprop_endtime_lmin=59&sethtmlprop_endtime=${year}-${month}-${formattedDay}+23%3A59%3A00&sethtmlprop_endtime_FixDatebox=TRUE&action_ok=+++OK+++&sSession=MAIL-XXXXXX-jJjFJrzucEWWRFpXbuFCLxFXMVJtgmzr&sys=Mtr_LP_Validation_KIT_20ch&subsys=List&subsyspart=Detail&action=post&set_referer=&id=${key}&isnewpopup=1&isfullscreen=0`;

        try {
            console.log(`Fetching data for: ${formattedDay}-${month}-${year}`);
            const response = await axios.get(url);
            // Process the data (save to file, database, etc.)
            console.log(`Response for ${formattedDay}-${month}-${year}:`, response.data);
        } catch (error) {
            console.error(`Error fetching data for ${formattedDay}-${month}-${year}:`, error.message);
        }
    }
}

scrapeData();
