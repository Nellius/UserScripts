# AO3: Tag Hider

## Description

Hide tags when there are too many tags automatically on AO3.
Add hide/show tags button to browsing page and reading page.

[\[Install\]](https://github.com/Nellius/UserScripts/raw/master/AO3-Tag-Hider/th.user.js) [\[Source\]](https://github.com/Nellius/UserScripts/blob/master/AO3-Tag-Hider/th.user.js) [\[Greasy Fork\]](https://greasyfork.org/ja/scripts/369423-ao3-tag-hider)

## Config

### Browsing page: except of `https://archiveofourown.org/works/*`

```javascript
const MAX_TAGS_ON_BROWSING_PAGE = 15;
// When number_of_tags > MAX_TAGS_ON_BROWSING_PAGE, hide tags on browsing page.
// If MAX_TAGS_ON_BROWSING_PAGE = 0, hide tags always on browsing page.
// If MAX_TAGS_ON_BROWSING_PAGE = 1000, show tags always on browsing page.
```

An example of browsing page when `MAX_TAGS_ON_BROWSING_PAGE = 15`

![MAX_TAGS_ON_BROWSING_PAGE = 15](https://github.com/Nellius/UserScripts/raw/master/AO3-Tag-Hider/images/th-demo-browsing-page.gif)

### Reading page: `https://archiveofourown.org/works/*`

```javascript
const MAX_TAGS_ON_READING_PAGE = 0;
// When number_of_tags > MAX_TAGS_ON_READING_PAGE, hide tags on reading page.
// if MAX_TAGS_ON_READING_PAGE = 0, hide tags always on reading page.
// if MAX_TAGS_ON_READING_PAGE = 1000, show tags always on reading page.
// number_of_tags on reading page also include Rating, Archive Warning, Category and Fandom tags.
```

An example of reading page when `MAX_TAGS_ON_READING_PAGE = 0`

![MAX_TAGS_ON_READING_PAGE = 0](https://github.com/Nellius/UserScripts/raw/master/AO3-Tag-Hider/images/th-demo-reading-page.gif)
