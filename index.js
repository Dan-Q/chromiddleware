const Puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const fs = require('fs');

const sites = JSON.parse(fs.readFileSync('sites.json').toString());

sites.forEach(site=>{
  (async () => {
    const browser = await Puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(site.url);
    const items = await page.evaluate((site) => { return([...eval(site.selector)].map(function(item){
      return {
        title: eval(site.item.title),
        description: eval(site.item.description),
        link: eval(site.item.link),
        guid: eval(site.item.guid)
      };
    })) }, site);
    site.outputs.forEach(outputDefinition=>{
      const template = Handlebars.compile(fs.readFileSync(`templates/${outputDefinition.template}`).toString());
      const result = template({ site: site, items: items });
      fs.writeFile(`output/${outputDefinition.output}`, result);
    });
    await browser.close();
  })();
});
