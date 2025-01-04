const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const dayjs = require('dayjs');
const fs = require('fs');
const { log } = console;
const path = require('path');

const app = express();

app.get('/fetch-jawa7-simpan', async (req, res) => {
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

app.get('/fetch-jawa7-kemarin', async (req, res) => {
    log('Getting data from Jawa 7 - Previous Month');
    try {
        // Hitung tanggal bulan sebelumnya
        const currentDate = dayjs();
        const startOfLastMonth = currentDate.subtract(1, 'month').startOf('month');
        const endOfLastMonth = currentDate.subtract(1, 'month').endOf('month');

        // Konfigurasi units
        const units = {
            '1013101': 'Pembangkit 1',
            '1013102': 'Pembangkit 2',
        };

        const dataJawa7 = {};
        const dataKumulatif = { kwh: 0, MW: 0 };

        // Loop per unit
        for (const [key, value] of Object.entries(units)) {
            try {
                // Loop per hari di bulan sebelumnya
                for (let date = startOfLastMonth; date.isBefore(endOfLastMonth) || date.isSame(endOfLastMonth); date = date.add(1, 'day')) {
                    const day = date.date();
                    const month = date.month() + 1; // dayjs month() is 0-indexed
                    const year = date.year();

                    const url = `https://amr.pln-jawa-bali.co.id/system.php?sethtmlprop_starttime_lday=${day}&sethtmlprop_starttime_lmonth=${month}&sethtmlprop_starttime_lyear=${year}&sethtmlprop_starttime_lhour=00&sethtmlprop_starttime_lmin=00&sethtmlprop_starttime=${year}-${month}-${day}+00%3A00%3A00&sethtmlprop_starttime_FixDatebox=TRUE&sethtmlprop_endtime_lday=${day}&sethtmlprop_endtime_lmonth=${month}&sethtmlprop_endtime_lyear=${year}&sethtmlprop_endtime_lhour=23&sethtmlprop_endtime_lmin=59&sethtmlprop_endtime=${year}-${month}-${day}+23%3A59%3A00&sethtmlprop_endtime_FixDatebox=TRUE&action_ok=+++OK+++&sSession=MAIL-XXXXXX-jJjFJrzucEWWRFpXbuFCLxFXMVJtgmzr&amp&sys=Mtr_LP_Validation_KIT_20ch&subsys=List&subsyspart=Detail&action=post&set_referer=&id=${key}&isnewpopup=1&isfullscreen=0`;

                    log(`Fetching data for ${date.format('YYYY-MM-DD')} from`, { url });

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

                    dataJawa7[`${value} ${date.format('YYYY-MM-DD')} kWh Out`] = kWhOut;
                    dataJawa7[`${value} ${date.format('YYYY-MM-DD')} MW`] = MW;
                }
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


// Mulai server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    log(`Server is running on port ${PORT}`);
});
