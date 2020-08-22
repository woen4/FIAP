const fs = require("fs");
const puppeteer = require("puppeteer");

const links_tedtalks = [
  "https://www.ted.com/talks/helen_czerski_the_fascinating_physics_of_everyday_life/transcript?language=pt-br#t-81674",
  "https://www.ted.com/talks/kevin_kelly_how_ai_can_bring_on_a_second_industrial_revolution/transcript?language=pt-br",
  "https://www.ted.com/talks/sarah_parcak_help_discover_ancient_ruins_before_it_s_too_late/transcript?language=pt-br",
  "https://www.ted.com/talks/sylvain_duranton_how_humans_and_ai_can_work_together_to_create_better_businesses/transcript?language=pt-br",
  "https://www.ted.com/talks/chieko_asakawa_how_new_technology_helps_blind_people_explore_the_world/transcript?language=pt-br",
  "https://www.ted.com/talks/pierre_barreau_how_ai_could_compose_a_personalized_soundtrack_to_your_life/transcript?language=pt-br",
  "https://www.ted.com/talks/tom_gruber_how_ai_can_enhance_our_memory_work_and_social_lives/transcript?language=pt-br",
];

const links_olhardigital = [
  "https://olhardigital.com.br/colunistas/wagner_sanchez/post/o_futuro_cada_vez_mais_perto/78972",
  "https://olhardigital.com.br/colunistas/wagner_sanchez/post/os_riscos_do_machine_learning/80584",
  "https://olhardigital.com.br/ciencia-e-espaco/noticia/nova-teoria-diz-que-passado-presente-e-futuro-coexistem/97786",
  "https://olhardigital.com.br/noticia/inteligencia-artificial-da-ibm-consegue-prever-cancer-de-mama/87030",
  "https://olhardigital.com.br/ciencia-e-espaco/noticia/inteligencia-artificial-ajuda-a-nasa-a-projetar-novos-trajes-espaciais/102772",
  "https://olhardigital.com.br/colunistas/jorge_vargas_neto/post/como_a_inteligencia_artificial_pode_mudar_o_cenario_de_oferta_de_credito/78999",
  "https://olhardigital.com.br/ciencia-e-espaco/noticia/cientistas-criam-programa-poderoso-que-aprimora-deteccao-de-galaxias/100683",
];

function stringFormater(string) {
  const newString = string.replace(" ", "_");

  const stringNormalized = newString
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const stringFormated = stringNormalized.toLowerCase();
  if (stringFormated.indexOf(",") !== -1) {
    const stringCuted = stringFormated.substring(
      0,
      stringFormated.indexOf(",")
    );
    return stringCuted;
  }
  return stringFormated;
}

function generateFileName(baseString) {
  const fileName =
    stringFormater(baseString) + `_${Math.random() * 100000}`.substring(0, 5);
  return fileName;
}

async function scrapTedtalk(link) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(link, { waitUntil: "load", timeout: 10000000 });
  page.setDefaultTimeout(10000000);
  page.setDefaultNavigationTimeout(10000000);
  const pageInfo = await page.evaluate(() => {
    //body scrap
    const nodeList = document.querySelectorAll('meta[name="description"]');
    const metaArray = [...nodeList];
    const body = metaArray[0].content;
    const formatedBody = body.substring(body.indexOf(":") + 2, body.length);

    //title scrap
    const title = document.title;

    //extract author
    const author = title.substring(0, title.indexOf(":"));

    const titleFormated = title.substring(
      title.indexOf(":") + 2,
      title.indexOf("|") - 1
    );

    const info = {
      author,
      body: formatedBody,
      title: titleFormated,
      type: "video",
      url: document.URL,
    };

    return info;
  });
  const fileName = generateFileName(pageInfo.author);

  const pageInfoJson = JSON.stringify(pageInfo);
  fs.writeFileSync(`tedtalk_${fileName}.json`, pageInfoJson);

  await browser.close();
}

async function scrapOhardigital(link) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(link, { waitUntil: "load", timeout: 10000000 });
  page.setDefaultTimeout(10000000);
  page.setDefaultNavigationTimeout(10000000);

  const pageInfo = await page.evaluate(() => {
    //title scrap
    const nodeListTitle = document.querySelectorAll(".mat-tit");
    const title = [...nodeListTitle];
    const titleFormated = title[0].textContent;

    //body scrap
    const nodeListBody = document.querySelectorAll(".mat-lead");
    const body = [...nodeListBody];
    const bodyFormated = body[0].textContent;

    //author scrap
    const nodeListAuthor = document.querySelectorAll("span.meta-aut");
    const author = [...nodeListAuthor];
    const authorFormated = author[0].textContent;

    const info = {
      author: authorFormated,
      body: bodyFormated,
      title: titleFormated,
      type: "article",
      url: document.URL,
    };

    return info;
  });

  const fileName = generateFileName(pageInfo.author);

  const pageInfoJson = JSON.stringify(pageInfo);
  fs.writeFileSync(`article_${fileName}.json`, pageInfoJson);
  await browser.close();
}

async function main() {
  links_tedtalks.forEach((link) => {
    scrapTedtalk(link);
  });

  links_olhardigital.forEach((link) => {
    scrapOhardigital(link);
  });
}

main();
