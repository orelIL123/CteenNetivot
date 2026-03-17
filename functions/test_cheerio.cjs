const iconv = require('iconv-lite');
const cheerio = require('cheerio');
fetch('https://www.chabad.org.il/Lessons/Lessons.asp?CategoryID=175')
    .then(r => r.arrayBuffer())
    .then(ab => {
        const html = iconv.decode(Buffer.from(ab), 'win1255');
        const $ = cheerio.load(html);
        const lessons = [];
        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (!href || !href.includes('/Lessons/')) return;
            const text = $(el).text().trim().replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ');
            if (text && text.length > 2 && text !== 'חומש' && text !== 'תהלים' && text !== 'תניא' && text !== 'היום-יום' && !text.includes('רמב"ם') && !text.includes('ספר המצוות')) {
                lessons.push({ href, text });
            }
        });
        console.log(lessons);
    });
