require('dotenv').config();

module.exports = function (eleventyConfig) {

  eleventyConfig.addGlobalData("clientKey", process.env.DEVCYCLE_CLIENT_KEY);

  eleventyConfig.addPassthroughCopy("src/devcycle.js");

  eleventyConfig.setServerOptions({
    watch: ['_site/**/*.css'],
  });

  return {
    dir: {
      input: 'src',
    },
  };
};
