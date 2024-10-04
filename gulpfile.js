var gulp = require('gulp');
var nunjucksRender = require('gulp-nunjucks-render');
var sitemap = require('gulp-sitemap');
const request = require('request');
const data = require('gulp-data');
const fs = require('fs');
const path = require('path');
const syncRequest = require('sync-request');
const sleep = require('sleep');
const replace = require('gulp-replace');


const { promisify } = require('util');

const requestPromise = promisify(request);

// Add a delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

require('dotenv').config();

gulp.task('build', function () {
    // Gets .html and .nunjucks files in pages
    return gulp.src('pages/**/*.+(html|nunjucks)')
        // Renders template with nunjucks
        .pipe(nunjucksRender({
            path: ['templates']
        }))
        // output files in app folder
        .pipe(gulp.dest('./'))
});

// Generate Sitemap.xml
gulp.task('sitemap', function () {
    var sources = [
        '*.html',
        './tools/*.html',
        './compare/*.html',
        './integrations/*.html'
    ];
    return gulp.src(sources, { base: './' })
        .pipe(sitemap({
            siteUrl: 'https://www.oopspam.com'
        }))
        .pipe(replace('.html', ''))
        .pipe(gulp.dest('./'))
});

gulp.task('integrationMulti', async function () {
    try {
        const clientId = process.env.CLIENT_ID;
        console.log('Starting integrationMulti task');

        let integrations = [];

        async function generatePagesFor(category, page) {
            console.log(`Generating pages for category: ${category}, page: ${page}`);
            const url = `https://api.zapier.com/v1/apps?client_id=${clientId}&category=${category}&page=${page}`;
            
            const response = await requestPromise(url);
            if (response.statusCode !== 200) {
                throw new Error(`Failed to fetch data from Zapier API: ${response.statusCode}`);
            }

            const responseFromZapier = JSON.parse(response.body);
            integrations.push(...responseFromZapier.objects);

            console.log(`Processing ${responseFromZapier.objects.length} apps for ${category}`);

            for (const app of responseFromZapier.objects) {
                await processApp(app);
            }
        }

        async function processApp(app) {
            console.log(`Processing app: ${app.title}`);
            const fileName = `spam-protection-for-${app.slug}.html`;
            const filePath = path.join('./integrations', fileName);

            // Check if the file already exists
            if (fs.existsSync(filePath)) {
                console.log(`File already exists for ${app.title}. Skipping.`);
                return;
            }

            let templates = app.links['mutual:zap_templates'].replace("referer=None", `client_id=${clientId}`);

            let retries = 3;
            while (retries > 0) {
                try {
                    const getTemplate = syncRequest('GET', templates);
                    if (getTemplate.statusCode === 429) {
                        console.log(`Rate limited when processing ${app.title}. Retrying in 6 seconds...`);
                        await delay(6000);
                        retries--;
                        continue;
                    }
                    if (getTemplate.statusCode !== 200) {
                        throw new Error(`Failed to fetch template: ${getTemplate.statusCode}`);
                    }

                    const responseBody = getTemplate.getBody('utf8');
                    let templateData = { htmlContent: "", url: "", title: "" };

                    if (responseBody && responseBody.trim() !== '') {
                        const template = JSON.parse(responseBody);
                        if (template && Array.isArray(template) && template.length > 0 && template[0].steps) {
                            templateData = processTemplate(template[0]);
                        }
                    }

                    const htmlContent = generateHtmlContent(app, templateData);
                    fs.writeFileSync(filePath, htmlContent);
                    console.log(`Generated file: ${fileName}`);
                    break;  // Success, exit the retry loop
                } catch (err) {
                    console.error(`Error processing app ${app.title}:`, err);
                    if (retries === 1) {
                        console.error(`Failed to process ${app.title} after 3 retries`);
                    }
                    retries--;
                    await delay(6000);  // Wait for 6 seconds before retrying
                }
            }

            // Add a delay between processing each app
            await delay(2000);
        }

        
                function processTemplate(template) {
            let templateData = {
                url: template.url,
                title: template.title,
                htmlContent: ""
            };

            template.steps.forEach((step, index) => {
                templateData.htmlContent += generateStepHtml(step);
                if (index < template.steps.length - 1) {
                    templateData.htmlContent += generateArrowHtml();
                }
            });

            return templateData;
        }

        function generateStepHtml(step) {
            return `
                <div class="column is-one-third">
                    <div class="box">
                        <article class="media">
                            <div class="media-left">
                                <figure class="image is-64x64">
                                    <img src="${step.image}" alt="${step.title} icon">
                                </figure>
                            </div>
                            <div class="media-content">
                                <div class="content">
                                    <p>${step.title}</p>
                                    <strong>${step.label}</strong>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            `;
        }

        function generateArrowHtml() {
            return `<div class="has-text-centered"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-step-into" width="64" height="64" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 3l0 12" />
                <path d="M16 11l-4 4" />
                <path d="M8 11l4 4" />
                <path d="M12 20m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            </svg></div>`;
        }

        function generateHtmlContent(app, templateData) {
            // ... (rest of the HTML generation code remains the same)
            // For brevity, I'm not including the entire HTML generation here
            return `
                    <!DOCTYPE html>
                    <html lang="en" data-theme="light">
                    <head>
                      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.0/css/bulma.min.css">
                      <link rel="stylesheet" href="/styles/main.min.css" />
                      <link rel="stylesheet" href="/styles/contact.css">
                    
                      <meta http-equiv="X-UA-Compatible" content="IE=edge">
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <meta name="description"
                        content="Filter spam on ${app.title} with OOPSpam using Zapier, blocking IPs, emails, countries, and stopping malicious content.">
                      <meta name="twitter:card" content="summary_large_image" />
                      <meta name="twitter:site" content="@oopspamapi" />
                      <meta property="og:url" content="https://www.oopspam.com/" />
                      <meta name="og:title" content="Spam Protection for ${app.title} - OOPSpam" />
                      <meta name="og:description" content="Filter spam on ${app.title} with OOPSpam using Zapier, blocking IPs, emails, countries, and stopping malicious content." />
                      <meta name="og:image" content="https://www.oopspam.com/assets/meta_oopspam.png" />
                      <meta name="twitter:image" content="https://www.oopspam.com/assets/meta_oopspam_tw.png" />
                      <link rel="shortcut icon" href="../favicon.ico" type="image/x-icon" />
                      <title>Spam Protection for ${app.title} - OOPSpam</title>
                      <script type="module" src="https://cdn.zapier.com/packages/partner-sdk/v0/zapier-elements/zapier-elements.esm.js"></script>
                     <link rel="stylesheet" href="https://cdn.zapier.com/packages/partner-sdk/v0/zapier-elements/zapier-elements.css"/>
                      {% include "partials/headScript.njk" %}
                      <style>
                      .box:hover {
                        transition: all 0.2s ease-in-out;
                        box-shadow: rgba(0,0,0,.15) 0px 3px 10px;
                      }
                      a {
                        background-image: none;
                      }
                    </style>
                    </head>
                    
                    <body>
                      <div class="app-container">
                        {% include "partials/navigation.njk" %}
                    
                    <main class="app-content">
                    <!-- The Main Section -->
                      <section id="main" class="section is-hero" style="background-color: #FBFBED;">    
                          <div class="container has-text-centered is-fluid px-0">
                            <div class="columns is-vcentered">
                           
                              <div class="column is-5 has-text-left is-5-fullhd is-offset-1-fullhd p-6">
                               
                                  <div class="content is-flex is-flex-direction-column mb-0">
                                    <h1 class="title has-text-black is-flex is-flex-direction-row  is-flex-wrap-nowrap is-size-4  has-text-weight-bold mb-0" 
                                    style="font-family: 'Playfair Display',serif;">         
                                  Spam Protection for ${app.title}
                                    </h1>
                                    <p class="has-text-black subtitle my-5" >
                                    Filter spam on ${app.title} with OOPSpam using Zapier.
                                    </p>
                                  </div>
                                  <div class="is-flex is-flex-direction-column  is-flex-wrap-wrap  ">
                                    <div class="control">
                                    <a rel="nofollow noopener noreferrer" class="button-has-shadow button has-text-black  is-warning is-rounded is-bg-orange" style="border:solid; border-width: 1px;"
                                        href="${app.url}">
                                        View on Zapier →
                                    </a>
                                    </div>
                                    <a class="pt-6" href="/integrations/">← Integrations</a>
                                </div>
                                         </div>
                             
                              <div class="column">
                                   <img class="" loading="lazy" src="/assets/IntegrationsHeader.svg" alt="OOPSpam illustration">
                              </div>
                    
                            </div>
                          </div>
                        
                      </section>
                      
                      <section  class="section" >
                      <div class="container">
                        <div class="columns is-vcentered is-centered">
                          <div class="column is-half has-text-centered">
                            <p class="title has-text-black">Who are we?</p>
                            <div class="columns">
                                <div class="column content is-flex is-flex-direction-column is-align-items-center">
                                    <img src="../assets/oopspam-logo.svg" width="64" alt="OOPSpam icon" />
                                    <h3 class="has-text-black">OOPSpam</h3>
                                    <p>OOPSpam is a privacy friendly and accessible anti-spam solution. OOPSpam helps you protect your business from annoying spam.
                                    Daily updated millions of blocked emails, IPs and the machine learning to help you fight spam in your automated flow.</p>
                                </div>
                                <div class="column content is-flex is-flex-direction-column is-align-items-center">
                                    <img src="${app.image}" width="64" alt="${app.title} icon" />
                                    <h3 class="has-text-black">${app.title}</h3>
                                    <p>${app.description}</p>
                             </div>

                            </div>
                          </div>
                        </div>
                      </div>
                    </section>



                    ${templateData.htmlContent != '' ? `
                    <section class="section">
    <div class="container ">
    <h2 class="title has-text-black has-text-centered">Get started with a Zap template designed just for you</h2>
    <p class="subtitle has-text-black py-3 has-text-centered">${templateData.title}</p>
        <div class="columns is-multiline is-flex-direction-column is-align-content-center">
            ${templateData.htmlContent}
                </div>
            </div>
                                <div class="pt-6 control has-text-centered">
                                    <a class="button-has-shadow button has-text-black  is-warning is-rounded is-bg-orange" style="border:solid; border-width: 1px;" href="${templateData.url}">
                                    View the template on Zapier
                                    </a>
                                    </div>
        </section>
        ` : ''}


                    <section  class="section" style="background-color: #FBFBED;">
                    <div class="container">
                      <div class="columns is-vcentered is-centered">
                        <div class="column has-text-centered">
                          <h2 class="title has-text-black">How people use OOPSpam</h2>
                          <p class="subtitle has-text-black py-3">To stop spam in its track, just drop OOPSpam app into your automation flow.</p>
                          <div class="columns">
                              <div class="column content is-flex is-flex-direction-column is-align-items-center">
                                  <img class="m-5" src="../assets/integration/world.png" width="128" alt="" />
                                  <h4>Block by country</h4>
                                  <p>Block countries or allow messages only from your audience's country.</p>
                              </div>
                              <div class="column content is-flex is-flex-direction-column is-align-items-center">
                                  <img class="m-5" src="../assets/integration/message.png" width="128" alt="" />
                                  <h4>Block spam messages</h4>
                                  <p>OOPSpam analyzes message content using a machine learning model. We also check for malicious links, words and more.</p>
                              </div>
                              <div class="column content is-flex is-flex-direction-column is-align-items-center">
                                  <img class="m-5" src="../assets/integration/lang.png" width="128" alt="" />
                                  <h4>Block by language</h4>
                                  <p>Do you expect your messages to be in English (or any other language)? Use OOPSpam to restrict messages from other languages.</p>
                              </div>
                              <div class="column content is-flex is-flex-direction-column is-align-items-center">
                              <img class="m-5" src="../assets/integration/shield.png" width="128" alt="" />
                              <h4>Block malicious IPs and emails</h4>
                              <p>Automatically check IPs and emails against millions of malicious IP and email lists.</p>
                          </div>
                             

                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                     
                  <section id="customers" class="section has-background-black " style="padding-top:5em; padding-bottom:5em;">
  <div class="container">
    <h2 class="title is-size-3 has-text-centered has-text-white pb-6">OOPSpam is helping to keep hundreds of businesses spam-free every day</h2>
    <div class="columns">
      <div class="column is-full">
        <div class="content has-text-centered is-hidden-touch mb-0">
          <img class="p-3" src="/assets/cs/logos.png" loading="lazy" alt="OOPSpam customers logo">
        </div>
        <div class="content is-flex-desktop is-justify-content-center is-align-content-center is-hidden-desktop">
          <img src="/assets/cs/mobile-view.png" loading="lazy" alt="">
        </div>
      </div>
    </div>
    <div class="level is-mobile" style="padding-top: 2.5em;">
      <div class="level-item has-text-left">
        <div>
          <p class="title has-text-white">3.5M+</p>
          <p class="heading has-text-white">protected websites</p>
        </div>
      </div>
      <div class="level-item has-text-left">
        <div>
          <p class="title has-text-white">12+</p>
          <p class="heading has-text-white">industries</p>
        </div>
      </div>
      <div class="level-item has-text-left">
        <div>
          <p class="title has-text-white">1B+</p>
          <p class="heading has-text-white">caught spam</p>
        </div>
      </div>
    </div>
  </div> 
</section>

                <section class="section">
                <div class="container">
                    <div class="columns">
                        <div class="column is-flex is-flex-direction-column is-align-items-center">
                            <div style="margin-bottom: 50px;">
                                <h2 class="title has-text-black">Related Articles</h2>
                            </div>
                        </div>
                    </div>
                    <div class="columns is-5">
                        <div class="column m-3 is-shadow is-flex is-flex-direction-column is-align-items-center has-text-centered p-0"
                            style="border:solid;border-color: black;">
                            <a href="https://www.oopspam.com/blog/netlify-contactform-spam" target="_blank">
                                <figure class="image ">
                                    <img src="https://www.oopspam.com/blog/assets/posts/social-media-meta.png"
                                        alt="">
                                </figure>
                                <div class="content has-text-black">
                                    <p class="p-3 has-text-left  is-opensans-semibold" style="font-size: 23px;">
                                    Stop spam on Netlify Forms using Zapier and OOPSpam ->
                                    </p>
                                </div>
                            </a>
                        </div>
                        <div class="column m-3 is-shadow is-flex is-flex-direction-column is-align-items-center has-text-centered p-0"
                            style="border:solid;border-color: black;">
                            <a href="https://www.oopspam.com/blog/typeform-form-spam" target="_blank">
                                <figure class="image ">
                                    <img src="https://www.oopspam.com/blog/assets/posts/typeform/social-meta.png"
                                        alt="">
                                </figure>
                                <div class="content has-text-black">
                                    <p class="p-3 has-text-left  is-opensans-semibold" style="font-size: 23px;">
                                    Stop spam on Typeform using Zapier and OOPSpam ->
                                    </p>
                                </div>
                            </a>
                        </div>
                        <div class="column m-3  is-shadow is-flex is-flex-direction-column is-align-items-center has-text-centered p-0"
                            style="border:solid;border-color: black;">
                            <a href="https://www.oopspam.com/blog/hubspot-contactform-spam" target="_blank">
                                <figure class="image ">
                                    <img src="https://www.oopspam.com/blog/assets/posts/social-media-meta.png"
                                        alt="">
                                </figure>
                                <div class="content has-text-black">
                                    <p class="p-3 has-text-left  is-opensans-semibold" style="font-size: 23px;">
                                    Stop spam on HubSpot contact forms using Zapier and OOPSpam ->
                                    </p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
                    
                       <section id="get-started" class="section" style="background-color: rgb(255, 221, 87);">
                        <div class="container">
                          <div class="columns is-vcentered is-centered">
                            <div class="column is-half has-text-centered">
                              <p class="title has-text-black">Join a new age of spam prevention</p>
                              <div class="content">
                                  <a class="button has-text-black is-medium is-default is-rounded button-has-shadow is-size-6-mobile"
                                    href="https://app.oopspam.com/Identity/Account/Register">
                                    Get started with free spam checks
                                  </a>
                                </div>
                            </div>
                          </div>
                        </div>
                      </section>
                      
                      {% include "partials/contact.njk" %}</main >
                      {% include "partials/footer.njk" %}
                      {% include "partials/footerScript.njk" %}
                     
                    </div>
                    </body>
                    
                    </html>
                    
                    `; // Return the full HTML content
        }

        console.log('Starting to generate pages for all categories');
        await Promise.all([
            generatePagesFor("customer-support", 1),
            generatePagesFor("customer-support", 2),
            generatePagesFor("reviews", 1),
            generatePagesFor("forms", 1),
            generatePagesFor("forms", 2),
            generatePagesFor("forms", 3),
            generatePagesFor("cms", 1),
            generatePagesFor("cms", 2),
            generatePagesFor("crm", 1),
            generatePagesFor("crm", 2),
            generatePagesFor("crm", 3),
            generatePagesFor("crm", 4),
            generatePagesFor("crm", 5),
            generatePagesFor("crm", 6),
            generatePagesFor("crm", 7),
            generatePagesFor("crm", 8),
            generatePagesFor("crm", 9),
        ]);

        console.log('Finished generating all pages');

        console.log('Starting to render index page');
        await new Promise((resolve, reject) => {
            gulp.src('pages/integrations/index.html')
                .pipe(data(function () {
                    return { appsData1: integrations };
                }))
                .pipe(nunjucksRender({ path: ['templates'] }))
                .pipe(gulp.dest('./integrations'))
                .on('end', resolve)
                .on('error', reject);
        });

        console.log('Starting to render all pages');
        await new Promise((resolve, reject) => {
            gulp.src('./integrations/*.+(html|nunjucks)')
                .pipe(nunjucksRender({ path: ['templates'] }))
                .pipe(gulp.dest('./integrations'))
                .on('end', resolve)
                .on('error', reject);
        });

        console.log('Task completed successfully');
    } catch (error) {
        console.error('Error in integrationMulti task:', error);
    }
});