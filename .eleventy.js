require('dotenv').config();
const yaml = require("js-yaml");
const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const htmlmin = require("html-minifier");
const markdownIt = require('markdown-it');
const Image = require("@11ty/eleventy-img");
const slugify = require("@sindresorhus/slugify");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const util = require('util');
const { exit } = require("process");
const GOOGLE_STATICMAPS_KEY = process.env.GOOGLE_STATICMAPS_KEY;

const eventdateFormat = 'MM-dd-yyyy hh:mm ZZZ';

function imageShortcode({src, alt, cls, styleName, lazy = true}) {

  if(alt === undefined) {
    // You bet we throw an error on missing alt (alt="" works okay)
    throw new Error(`Missing \`alt\` on myImage from: ${src}`);
  }

  if (styleName === undefined) {
    throw new Error(`Missing \`styleName\` on myImage from: ${src}`);
  }

  let styles = {
    avatar: {
      sizes: ""
    },
    ad_small: {
      sizes: [
        "(max-width: 639px) 590px",
        "(max-width: 1023px) 350px",
        "(max-width: 1400px) 290px",
        "350px"
      ]
    },
    teasers_3: {
      sizes: [
        "(max-width: 640px) 510px",
        "350px"
      ]
    },
    medium_half: {
      sizes: "(max-width: 767px) 100vw, 600px"
    },
    large: {
      sizes: [
        "(min-width: 768px) 1024px",
        "(min-width: 1024px) 1280px"
      ]
    }
  }

  let options = {
    widths: [350, 640, 768, 1024, 1280],
    formats: ['webp', 'jpeg'],
    urlPath: "/static/img/",
    outputDir: "./_site/static/img/"
  };

  Image(src, options);

  let sizes = styles[styleName].sizes;

  let imageAttributes = {
    alt,
    sizes,
    decoding: "async",
  };

  if (cls) {
    imageAttributes.class = cls;
  }

  // sometimes hero images should not lazy load if they impact LCP metrics. (top of page)
  if (lazy == true) {
    imageAttributes.loading = "lazy";
  }
  // get metadata even the images are not fully generated
  metadata = Image.statsSync(src, options);
  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function (eleventyConfig) {
  // Disable automatic use of your .gitignore
  eleventyConfig.setUseGitIgnore(false);

  // Merge data instead of overriding
  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addFilter('toFixed', (num, digits) => {
    return parseFloat(num).toFixed(digits);
  });

  // Render markdown to html
  eleventyConfig.addFilter("markdown", (content) => {
    return markdownIt({ html: true }).render(content);
  });

  eleventyConfig.addFilter("slugify", slugify);

  // Filters for future dates in Events.
  eleventyConfig.addFilter("futureDates", (events) => {
    return events.filter((event) => {
      const eventDate = new Date(event.data.event_date);

      if (eventDate.getTime() >= Date.now()) {
        return event;
      }
    });
  });

  // Filters for past dates in Events.
  eleventyConfig.addFilter("pastDates", (events) => {
    return events.filter((event) => {
      const eventDate = new Date(event.data.event_date);

      if (eventDate.getTime() < Date.now()) {
        return event;
      }
    });
  })

  // human readable date
  eleventyConfig.addFilter("event_day", (dateObj) => {
    return DateTime.fromFormat(dateObj, eventdateFormat).toFormat(
      "d",
      { zone: 'America/New_York' }
    );
  });

  eleventyConfig.addFilter("event_month", (dateObj) => {
    return DateTime.fromFormat(dateObj, eventdateFormat).toFormat(
      "LLLL",
      { zone: 'America/New_York' }
    );
  });

  eleventyConfig.addFilter("event_month_2digit", (dateObj) => {
    return DateTime.fromFormat(dateObj, eventdateFormat).toFormat(
      "LL",
      { zone: 'America/New_York' }
    );
  });

  eleventyConfig.addFilter("event_month_abbr", (dateObj) => {
    return DateTime.fromFormat(dateObj, eventdateFormat).toFormat(
      "LLL",
      { zone: 'America/New_York' }
    );
  });

  eleventyConfig.addFilter("event_year", (dateObj) => {
    return DateTime.fromFormat(dateObj, eventdateFormat).toFormat(
      "yyyy",
      { zone: 'America/New_York' }
    );
  });

  eleventyConfig.addFilter("event_time", (dateObj) => {
    return DateTime.fromFormat(dateObj, eventdateFormat).toFormat(
      "t",
      { zone: 'America/New_York' }
    ).toLowerCase().replace(/\s/g, "");
  });

  eleventyConfig.addFilter("filterEventsByCategory", (data, category) => {
    
    return data.filter((item) => {
      if (!item.data.categories) { return false; }
      return item.data.categories.includes(category);
    });
  });

  eleventyConfig.addFilter("getCategoryNameById", (id, categories) => {
    let name;
    categories.forEach(category => {
      if (category.id == id) { name = category.name; }
    });
    return name;
  });

  eleventyConfig.addFilter("limit", function(array, limit) {
    return array.slice(0, limit);
  });

  eleventyConfig.addFilter("addressToString", (data) => {
    const address = {}
    address.name = data.name;
    address.street1 = data.street1;
    address.street2 = data.street2;
    address.city = data.city;
    address.state = data.state;
    address.zipcode = data.zipcode;

    const newobj = Object.keys(address).map((k) => {
      return address[k];
    }).filter(n => n);

    return newobj.join(", ");
  });

  // Syntax Highlighting for Code blocks
  eleventyConfig.addPlugin(syntaxHighlight);

  // RSS Plugin
  eleventyConfig.addPlugin(pluginRss, {
    posthtmlRenderOptions: {
      closingSingleTag: "default" // opt-out of <img/>-style XHTML single tags
    }
  });

  // Google Maps Static API
	eleventyConfig.addShortcode("staticmap", function(address, width=500, height=500, zoom=13, maptype="roadmap") {
    // @todo: Request this map, save it to the filesystem and return the cached path.
		return `https://maps.googleapis.com/maps/api/staticmap?markers=color:0x92BB05|${encodeURIComponent(address)}&zoom=${zoom}&size=${width}x${height}&maptype=${maptype}&key=${GOOGLE_STATICMAPS_KEY}`;
	});

  eleventyConfig.addShortcode("googleMapsSearchUrl", function(address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  });

  eleventyConfig.addShortcode("googleMapsDirectionsUrl", function(address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  });

  // To Support .yaml Extension in _data
  // You may remove this if you can use JSON
  eleventyConfig.addDataExtension("yaml", (contents) =>
    yaml.safeLoad(contents)
  );

  // Copy Static Files to /_Site
  eleventyConfig.addPassthroughCopy({
    "./src/admin/config.yml": "./admin/config.yml",
    "./node_modules/alpinejs/dist/alpine.js": "./static/js/alpine.js",
    "./node_modules/lite-youtube-embed/src/lite-yt-embed.css": "./static/css/lite-yt-embed.css",
    "./node_modules/lite-youtube-embed/src/lite-yt-embed.js": "./static/js/lite-yt-embed.js",
    "./node_modules/prismjs/themes/prism-tomorrow.css":
      "./static/css/prism-tomorrow.css",
  });

  // Copy Image Folders to /_site
  eleventyConfig.addPassthroughCopy("./src/static/img");
  eleventyConfig.addPassthroughCopy("./src/static/portraits");
  eleventyConfig.addPassthroughCopy("./src/static/recipes");
  eleventyConfig.addPassthroughCopy("./src/static/events");

  // Copy Docs to /_site
  eleventyConfig.addPassthroughCopy("./src/static/docs");

  // Copy Theme Folder to /_site
  eleventyConfig.addPassthroughCopy("./src/static/theme");

  // Copy favicon to route of /_site
  eleventyConfig.addPassthroughCopy("./src/static/favicon");

  // Get the current year
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  eleventyConfig.addShortcode("image", imageShortcode);

  // Console log variables
  eleventyConfig.addFilter('console', function(value) {
    const str = util.inspect(value);
    return `<pre class="block" style="max-height: 500px; overflow-y: scroll;">${unescape(str)}</pre>`
  });

  // Minify HTML
  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if (outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

  // Let Eleventy transform HTML files as nunjucks
  // So that we can use .html instead of .njk
  return {
    dir: {
      input: "src",
    },
    htmlTemplateEngine: "njk",
  };
};
