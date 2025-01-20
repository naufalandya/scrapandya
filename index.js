const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const fs = require('fs');
const { log } = console;
const path = require('path');

const app = express();

app.get('/fetch-cirata7-simpan', async (req, res) => {
    log('Getting data from Jawa 7');
    try {
        const day = dayjs().date();
        const month = dayjs().month() + 1;
        const year = dayjs().year();

        const units = {
            '1013101': 'Pembangkit 1',
            '1013102': 'Pembangkit 2',
        };

        const dataJawa7 = {};
        const dataKumulatif = { kwh: 0, MW: 0 };

        for (const [key, value] of Object.entries(units)) {
            try {
                const url = `https://amr.pln-jawa-bali.co.id/system.php?sethtmlprop_starttime_lday=${day}&sethtmlprop_starttime_lmonth=${month}&sethtmlprop_starttime_lyear=${year}&sethtmlprop_starttime_lhour=00&sethtmlprop_starttime_lmin=00&sethtmlprop_starttime=${year}-${month}-${day}+00%3A00%3A00&sethtmlprop_starttime_FixDatebox=TRUE&sethtmlprop_endtime_lday=${day}&sethtmlprop_endtime_lmonth=${month}&sethtmlprop_endtime_lyear=${year}&sethtmlprop_endtime_lhour=23&sethtmlprop_endtime_lmin=59&sethtmlprop_endtime=${year}-${month}-${day}+23%3A59%3A00&sethtmlprop_endtime_FixDatebox=TRUE&action_ok=+++OK+++&sSession=MAIL-XXXXXX-BZUwGoOgfyenSwbfhEmvjtLySCyGbSSF&amp&sys=Mtr_LP_Validation_KIT_20ch&subsys=List&subsyspart=Detail&action=post&set_referer=&id=${key}&isnewpopup=1&isfullscreen=0`;
                log('Fetching from', { url });

                const response = await axios.get(url);
                log('Raw HTML Response:', response.data.slice(0, 500));

                const $ = cheerio.load(response.data);

                const rows = [];
                $('table.DBGridContent tr').each((i, row) => {
                    if (i > 1) {
                        const cells = [];
                        $(row)
                            .find('td')
                            .each((_, cell) => {
                                const text = $(cell).text().trim().replace(/\u00a0/g, ' ');
                                cells.push(text);
                            });
                        rows.push(cells);
                    }
                });

                const rawHtmlPath = path.join(__dirname, 'raw-html-response.txt');
                fs.writeFileSync(rawHtmlPath, $.html());


                const kWhOut = rows.reduce((carry, row) => {
                    try {
                        const floatkWhOut = parseFloat(row[2].replace('.', '').replace(',', '.')) || 0;
                        console.log("carry", carry)
                        console.log("kwh out", floatkWhOut)

                        return carry + floatkWhOut;
                    } catch (parseError) {
                        log('Error parsing kWhOut:', parseError);
                        return carry;
                    }
                }, 0);

                const MW = rows.reduce((carry, row) => {
                    try {
                        const floatMW = parseFloat(row[14].replace('.', '').replace(',', '.')) || 0;
                        return floatMW > 0 ? floatMW : carry;
                    } catch (parseError) {
                        log('Error parsing MW:', parseError);
                        return carry;
                    }
                }, 0);

                dataKumulatif.kwh += kWhOut;
                dataKumulatif.MW += MW;

                dataJawa7[`${value} kWh Out`] = kWhOut;
                dataJawa7[`${value} MW`] = MW;
            } catch (unitError) {
                log(`Error processing unit ${key}:`, unitError);
            }
        }

        dataJawa7['kWh Out Kumulatif'] = dataKumulatif.kwh;
        dataJawa7['MW Kumulatif'] = dataKumulatif.MW;
        dataJawa7['Max MW'] = 2000;

        log('Data Jawa 7 saved:', dataJawa7);

        // Simpan ke file JSON
        const filePath = path.join(__dirname, 'data-jawa7.json');
        fs.writeFileSync(filePath, JSON.stringify({ data: dataJawa7 }, null, 2));

        res.json({ data: dataJawa7 });
    } catch (error) {
        log('Failed getting data Jawa 7:', { error });
        res.status(500).send('Jawa 7 Failed!');
    }
});
app.get('/fetch-jawa7', async (req, res) => {
    log('Getting data from Jawa 7');
    try {
        const day = dayjs().date();
        const month = dayjs().month() + 1;
        const year = dayjs().year();

        const units = {
            '1013101': 'Pembangkit 1',
            '1013102': 'Pembangkit 2',
        };

        const dataJawa7 = {};
        const dataKumulatif = { kwh: 0, MW: 0 };

        for (const [key, value] of Object.entries(units)) {
            try {
                const url = `https://amr.pln-jawa-bali.co.id/system.php?sethtmlprop_starttime_lday=${day}&sethtmlprop_starttime_lmonth=${month}&sethtmlprop_starttime_lyear=${year}&sethtmlprop_starttime_lhour=00&sethtmlprop_starttime_lmin=00&sethtmlprop_starttime=${year}-${month}-${day}+00%3A00%3A00&sethtmlprop_starttime_FixDatebox=TRUE&sethtmlprop_endtime_lday=${day}&sethtmlprop_endtime_lmonth=${month}&sethtmlprop_endtime_lyear=${year}&sethtmlprop_endtime_lhour=23&sethtmlprop_endtime_lmin=59&sethtmlprop_endtime=${year}-${month}-${day}+23%3A59%3A00&sethtmlprop_endtime_FixDatebox=TRUE&action_ok=+++OK+++&sSession=MAIL-XXXXXX-AITyWHEquEaMsRRBQuNkJvCBVyCBayYa&amp&sys=Mtr_LP_Validation_KIT_20ch&subsys=List&subsyspart=Detail&action=post&set_referer=&id=${key}&isnewpopup=1&isfullscreen=0`;
                log('Fetching from', { url });

                const response = await axios.get(url);
                log('Raw HTML Response:', response.data.slice(0, 500));

                const $ = cheerio.load(response.data);

                const rows = [];
                $('table.DBGridContent tr').each((i, row) => {
                    if (i > 1) {
                        const cells = [];
                        $(row)
                            .find('td')
                            .each((_, cell) => {
                                const text = $(cell).text().trim().replace(/\u00a0/g, ' ');
                                cells.push(text);
                            });
                        rows.push(cells);
                    }
                });

                log('Data rows fetched:', rows);

                const kWhOut = rows.reduce((carry, row) => {
                    try {
                        const floatkWhOut = parseFloat(row[2].replace('.', '').replace(',', '.')) || 0;
                        return carry + floatkWhOut;
                    } catch (parseError) {
                        log('Error parsing kWhOut:', parseError);
                        return carry;
                    }
                }, 0);

                const MW = rows.reduce((carry, row) => {
                    try {
                        const floatMW = parseFloat(row[14].replace('.', '').replace(',', '.')) || 0;
                        return floatMW > 0 ? floatMW : carry;
                    } catch (parseError) {
                        log('Error parsing MW:', parseError);
                        return carry;
                    }
                }, 0);

                dataKumulatif.kwh += kWhOut;
                dataKumulatif.MW += MW;

                dataJawa7[`${value} kWh Out`] = kWhOut;
                dataJawa7[`${value} MW`] = MW;
            } catch (unitError) {
                log(`Error processing unit ${key}:`, unitError);
            }
        }

        dataJawa7['kWh Out Kumulatif'] = dataKumulatif.kwh;
        dataJawa7['MW Kumulatif'] = dataKumulatif.MW;
        dataJawa7['Max MW'] = 2000;

        log('Data Jawa 7 saved:', dataJawa7);

        res.json({ data: dataJawa7 });
    } catch (error) {
        log('Failed getting data Jawa 7:', { error });
        res.status(500).send('Jawa 7 Failed!');
    }
});


app.get('/fetch-jawa7-bulan', async (req, res) => {
    log('Getting data from Jawa 7 for this month');
    try {
        const startOfMonth = dayjs().startOf('month'); // Tanggal awal bulan
        const endOfMonth = dayjs().endOf('month'); // Tanggal akhir bulan

        const units = {
            '1013101': 'Pembangkit 1',
            '1013102': 'Pembangkit 2',
        };

        const dataJawa7 = {};
        const dataKumulatif = { kwh: 0, MW: 0 };

        for (const [key, value] of Object.entries(units)) {
            try {
                const url = `https://amr.pln-jawa-bali.co.id/system.php?sethtmlprop_starttime_lday=${startOfMonth.date()}&sethtmlprop_starttime_lmonth=${startOfMonth.month() + 1}&sethtmlprop_starttime_lyear=${startOfMonth.year()}&sethtmlprop_starttime_lhour=00&sethtmlprop_starttime_lmin=00&sethtmlprop_starttime=${startOfMonth.format('YYYY-MM-DD+HH%3Amm%3A00')}&sethtmlprop_starttime_FixDatebox=TRUE&sethtmlprop_endtime_lday=${endOfMonth.date()}&sethtmlprop_endtime_lmonth=${endOfMonth.month() + 1}&sethtmlprop_endtime_lyear=${endOfMonth.year()}&sethtmlprop_endtime_lhour=23&sethtmlprop_endtime_lmin=59&sethtmlprop_endtime=${endOfMonth.format('YYYY-MM-DD+HH%3Amm%3A00')}&sethtmlprop_endtime_FixDatebox=TRUE&action_ok=+++OK+++&sSession=MAIL-XXXXXX-BZUwGoOgfyenSwbfhEmvjtLySCyGbSSF&amp&sys=Mtr_LP_Validation_KIT_20ch&subsys=List&subsyspart=Detail&action=post&set_referer=&id=${key}&isnewpopup=1&isfullscreen=0`;
                log('Fetching from', { url });

                const response = await axios.get(url);
                log('Raw HTML Response:', response.data.slice(0, 500));

                const $ = cheerio.load(response.data);

                const rows = [];
                $('table.DBGridContent tr').each((i, row) => {
                    if (i > 1) {
                        const cells = [];
                        $(row)
                            .find('td')
                            .each((_, cell) => {
                                const text = $(cell).text().trim().replace(/\u00a0/g, ' ');
                                cells.push(text);
                            });
                        rows.push(cells);
                    }
                });

                const rawHtmlPath = path.join(__dirname, 'raw-html-response.txt');
                fs.writeFileSync(rawHtmlPath, $.html());

                const kWhOut = rows.reduce((carry, row) => {
                    try {
                        const floatkWhOut = parseFloat(row[2].replace('.', '').replace(',', '.')) || 0;
                        return carry + floatkWhOut;
                    } catch (parseError) {
                        log('Error parsing kWhOut:', parseError);
                        return carry;
                    }
                }, 0);

                const MW = rows.reduce((carry, row) => {
                    try {
                        const floatMW = parseFloat(row[14].replace('.', '').replace(',', '.')) || 0;
                        return floatMW > 0 ? floatMW : carry;
                    } catch (parseError) {
                        log('Error parsing MW:', parseError);
                        return carry;
                    }
                }, 0);

                dataKumulatif.kwh += kWhOut;
                dataKumulatif.MW += MW;

                dataJawa7[`${value} kWh Out`] = kWhOut;
                dataJawa7[`${value} MW`] = MW;
            } catch (unitError) {
                log(`Error processing unit ${key}:`, unitError);
            }
        }

        dataJawa7['kWh Out Kumulatif'] = dataKumulatif.kwh;
        dataJawa7['MW Kumulatif'] = dataKumulatif.MW;
        dataJawa7['Max MW'] = 2000;

        log('Data Jawa 7 saved:', dataJawa7);

        const filePath = path.join(__dirname, 'data-jawa7.json');
        fs.writeFileSync(filePath, JSON.stringify({ data: dataJawa7 }, null, 2));

        res.json({ data: dataJawa7 });
    } catch (error) {
        log('Failed getting data Jawa 7:', { error });
        res.status(500).send('Jawa 7 Failed!');
    }
});



app.get('/cirata-hari', async (req, res) => {
    log('Fetching data from Cirata for today');
    try {
        const todayStart = dayjs().startOf('day'); // Awal hari ini
        const todayEnd = dayjs().endOf('day'); // Akhir hari ini

        const units = {
            '2052901': 'Pembangkit 1',
            '2052902': 'Pembangkit 2',
        };

        const dataCirata = {};
        const dataKumulatif = { kwh: 0, MW: 0 };

        for (const [key, value] of Object.entries(units)) {
            try {
                const url = `https://amr.pln-jawa-bali.co.id/system.php?sethtmlprop_starttime_lday=${todayStart.date()}&sethtmlprop_starttime_lmonth=${todayStart.month() + 1}&sethtmlprop_starttime_lyear=${todayStart.year()}&sethtmlprop_starttime_lhour=00&sethtmlprop_starttime_lmin=00&sethtmlprop_starttime=${todayStart.format('YYYY-MM-DD+HH%3Amm%3A00')}&sethtmlprop_starttime_FixDatebox=TRUE&sethtmlprop_endtime_lday=${todayEnd.date()}&sethtmlprop_endtime_lmonth=${todayEnd.month() + 1}&sethtmlprop_endtime_lyear=${todayEnd.year()}&sethtmlprop_endtime_lhour=23&sethtmlprop_endtime_lmin=59&sethtmlprop_endtime=${todayEnd.format('YYYY-MM-DD+HH%3Amm%3A00')}&sethtmlprop_endtime_FixDatebox=TRUE&action_ok=+++OK+++&sSession=MAIL-XXXXXX-eOeqeuJmFgHXtUBNQReqdNcZXmYAQLxu&sys=Mtr_LP_Validation_KIT_20ch&subsys=List&subsyspart=Detail&action=post&set_referer=https%253A%252F%252Famr.pln-jawa-bali.co.id%252Fsystem.php%253Ffnp%253D1%2526setdate%253D2025-01-20%2526sSession%253DMAIL-XXXXXX-eOeqeuJmFgHXtUBNQReqdNcZXmYAQLxu%2526sys%253DMtr_LP_Validation_KIT_20ch&id=${key}&isnewpopup=1&isfullscreen=0`;
                log('Fetching from', { url });

                const response = await axios.get(url);
                log('Raw HTML Response:', response.data.slice(0, 500));

                const $ = cheerio.load(response.data);

                const rows = [];
                $('table.DBGridContent tr').each((i, row) => {
                    if (i > 1) {
                        const cells = [];
                        $(row)
                            .find('td')
                            .each((_, cell) => {
                                const text = $(cell).text().trim().replace(/\u00a0/g, ' ');
                                cells.push(text);
                            });
                        rows.push(cells);
                    }
                });

                const kWhOut = rows.reduce((carry, row) => {
                    try {
                        const floatkWhOut = parseFloat(row[2].replace('.', '').replace(',', '.')) || 0;
                        return carry + floatkWhOut;
                    } catch (parseError) {
                        log('Error parsing kWhOut:', parseError);
                        return carry;
                    }
                }, 0);

                const MW = rows.reduce((carry, row) => {
                    try {
                        const floatMW = parseFloat(row[14].replace('.', '').replace(',', '.')) || 0;
                        return floatMW > 0 ? floatMW : carry;
                    } catch (parseError) {
                        log('Error parsing MW:', parseError);
                        return carry;
                    }
                }, 0);

                dataKumulatif.kwh += kWhOut;
                dataKumulatif.MW += MW;

                dataCirata[`${value} kWh Out`] = kWhOut;
                dataCirata[`${value} MW`] = MW;
            } catch (unitError) {
                log(`Error processing unit ${key}:`, unitError);
            }
        }

        dataCirata['kWh Out Kumulatif'] = dataKumulatif.kwh;
        dataCirata['MW Kumulatif'] = dataKumulatif.MW;

        log('Data Cirata saved:', dataCirata);

        const filePath = path.join(__dirname, 'data-cirata-today.json');
        fs.writeFileSync(filePath, JSON.stringify({ data: dataCirata }, null, 2));

        res.json({ data: dataCirata });
    } catch (error) {
        log('Failed fetching data Cirata:', { error });
        res.status(500).send('Cirata Fetch Failed!');
    }
});




app.get('/cirata-bulan', async (req, res) => {
    log('Fetching data from Cirata for this month');
    try {
        const startOfMonth = dayjs().startOf('month'); // Tanggal awal bulan
        const endOfMonth = dayjs().endOf('month'); // Tanggal akhir bulan

        const units = {
            '2052901': 'Pembangkit 1',
            '2052902': 'Pembangkit 2',
        };

        const dataCirata = {};
        const dataKumulatif = { kwh: 0, MW: 0 };

        for (const [key, value] of Object.entries(units)) {
            try {
                const url = `https://amr.pln-jawa-bali.co.id/system.php?sethtmlprop_starttime_lday=${startOfMonth.date()}&sethtmlprop_starttime_lmonth=${startOfMonth.month() + 1}&sethtmlprop_starttime_lyear=${startOfMonth.year()}&sethtmlprop_starttime_lhour=10&sethtmlprop_starttime_lmin=00&sethtmlprop_starttime=${startOfMonth.format('YYYY-MM-DD+HH%3Amm%3A00')}&sethtmlprop_starttime_FixDatebox=TRUE&sethtmlprop_endtime_lday=${endOfMonth.date()}&sethtmlprop_endtime_lmonth=${endOfMonth.month() + 1}&sethtmlprop_endtime_lyear=${endOfMonth.year()}&sethtmlprop_endtime_lhour=10&sethtmlprop_endtime_lmin=00&sethtmlprop_endtime=${endOfMonth.format('YYYY-MM-DD+HH%3Amm%3A00')}&sethtmlprop_endtime_FixDatebox=TRUE&action_ok=+++OK+++&sSession=MAIL-XXXXXX-eOeqeuJmFgHXtUBNQReqdNcZXmYAQLxu&sys=Mtr_LP_Validation_KIT_20ch&subsys=List&subsyspart=Detail&action=post&set_referer=https%253A%252F%252Famr.pln-jawa-bali.co.id%252Fsystem.php%253Ffnp%253D1%2526setdate%253D2025-01-20%2526sSession%253DMAIL-XXXXXX-eOeqeuJmFgHXtUBNQReqdNcZXmYAQLxu%2526sys%253DMtr_LP_Validation_KIT_20ch&id=${key}&isnewpopup=1&isfullscreen=0`;
                log('Fetching from', { url });

                const response = await axios.get(url);
                log('Raw HTML Response:', response.data.slice(0, 500));

                const $ = cheerio.load(response.data);

                const rows = [];
                $('table.DBGridContent tr').each((i, row) => {
                    if (i > 1) {
                        const cells = [];
                        $(row)
                            .find('td')
                            .each((_, cell) => {
                                const text = $(cell).text().trim().replace(/\u00a0/g, ' ');
                                cells.push(text);
                            });
                        rows.push(cells);
                    }
                });

                const kWhOut = rows.reduce((carry, row) => {
                    try {
                        const floatkWhOut = parseFloat(row[2].replace('.', '').replace(',', '.')) || 0;
                        return carry + floatkWhOut;
                    } catch (parseError) {
                        log('Error parsing kWhOut:', parseError);
                        return carry;
                    }
                }, 0);

                const MW = rows.reduce((carry, row) => {
                    try {
                        const floatMW = parseFloat(row[14].replace('.', '').replace(',', '.')) || 0;
                        return floatMW > 0 ? floatMW : carry;
                    } catch (parseError) {
                        log('Error parsing MW:', parseError);
                        return carry;
                    }
                }, 0);

                dataKumulatif.kwh += kWhOut;
                dataKumulatif.MW += MW;

                dataCirata[`${value} kWh Out`] = kWhOut;
                dataCirata[`${value} MW`] = MW;
            } catch (unitError) {
                log(`Error processing unit ${key}:`, unitError);
            }
        }

        dataCirata['kWh Out Kumulatif'] = dataKumulatif.kwh;
        dataCirata['MW Kumulatif'] = dataKumulatif.MW;

        log('Data Cirata saved:', dataCirata);

        const filePath = path.join(__dirname, 'data-cirata.json');
        fs.writeFileSync(filePath, JSON.stringify({ data: dataCirata }, null, 2));

        res.json({ data: dataCirata });
    } catch (error) {
        log('Failed fetching data Cirata:', { error });
        res.status(500).send('Cirata Fetch Failed!');
    }
});






// Mulai server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    log(`Server is running on port ${PORT}`);
});
