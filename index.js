const scrapeAllVideos = require('./server').scrapeAllVideos; 
const app = require('./db'); 
    setInterval(() => {
        scrapeAllVideos()
            .then(() => {
                console.log('Scraping completed');
            })
            .catch(err => {
                console.error('Scraping failed:', err.message);
            }); 
    }, 3600000);

scrapeAllVideos()
.then(() => {
    console.log('Scraping completed');
})
.catch(err => {
    console.error('Scraping failed:', err.message);
})