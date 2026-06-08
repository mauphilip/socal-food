const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  // Pass through static assets
  eleventyConfig.addPassthroughCopy("public");
  eleventyConfig.addPassthroughCopy("cms.html");

  // Date filters
  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("LLL d, yyyy");
  });
  eleventyConfig.addFilter("isoDate", dateObj => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toISODate();
  });
  eleventyConfig.addFilter("cityLabel", city => {
    const map = { la: "Los Angeles", oc: "Orange County", sd: "San Diego", sf: "San Francisco" };
    return map[city] || city?.toUpperCase() || "";
  });

  // Collections by city
  eleventyConfig.addCollection("la_guides", api =>
    api.getFilteredByGlob("src/la/guides/*.md").sort((a,b) => b.date - a.date));
  eleventyConfig.addCollection("la_posts", api =>
    api.getFilteredByGlob("src/la/posts/*.md").sort((a,b) => b.date - a.date));
  eleventyConfig.addCollection("la_features", api =>
    api.getFilteredByGlob("src/la/features/*.md").sort((a,b) => b.date - a.date));
  eleventyConfig.addCollection("all_content", api =>
    api.getFilteredByGlob("src/**/*.md")
      .filter(p => !p.inputPath.includes("index"))
      .sort((a,b) => b.date - a.date));

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
