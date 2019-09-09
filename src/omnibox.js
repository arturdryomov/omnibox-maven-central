chrome.omnibox.setDefaultSuggestion({
  description: "Search Maven Central for <match>%s</match>"
});


chrome.omnibox.onInputChanged.addListener(function(searchQuery, sendSuggestions) {
  if (!searchQuery) {
    return;
  }

  // API reference: https://search.maven.org/classic/#api
  fetch(`https://search.maven.org/solrsearch/select?q=${searchQuery}&rows=10`)
    .then(function(response) {
      if (response.status !== 200) {
        throw Error(`Maven Central returned ${response.status}.`);
      }

      return response.json();
    })
    .then(function(response) {
      const suggestions = response["response"]["docs"].map(result => {
        const group = result["g"];
        const artifact = result["a"];
        const version = result["latestVersion"];
        const file = result["p"];

        const name = `${group}:${artifact}:${version}`.replace(searchQuery, `<match>${searchQuery}</match>`);
        const description = `<dim>${file.toUpperCase()}</dim>`;

        return {
          description: `${name} — ${description}`,
          content: `https://search.maven.org/artifact/${group}/${artifact}/${version}/${file}`
        };
      });

      sendSuggestions(suggestions);
    })
    .catch(function(error) {
      console.log("Maven Central search issue.", error);
    });
});


chrome.omnibox.onInputEntered.addListener(function(content, disposition) {
  switch (disposition) {
    // Shift + Command + Enter
    case "newForegroundTab":
      chrome.tabs.create({url: content, active: true})
      break;

    // Command + Enter
    case "newBackgroundTab":
      chrome.tabs.create({url: content, active: false})
      break;

    // Enter
    default:
      chrome.tabs.update(null, {url: content});
      break;
  }
});
