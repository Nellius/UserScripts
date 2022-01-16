# [AO3: Tag Word Cloud](https://github.com/Nellius/UserScripts/tree/master/AO3-Tag-Word-Cloud)

## Description

This script change font size of words of AO3 tags according to the word frequency in each chapter or entire works.

[\[Install\]](https://github.com/Nellius/UserScripts/raw/master/AO3-Tag-Word-Cloud/twc.user.js) [\[Source\]](https://github.com/Nellius/UserScripts/blob/master/AO3-Tag-Word-Cloud/twc.user.js) [\[Greasy Fork\]](https://greasyfork.org/ja/scripts/408055-ao3-tag-word-cloud)

## Demo

![demo](https://github.com/Nellius/UserScripts/raw/master/AO3-Tag-Word-Cloud/images/twc-demo.gif)

### Config

```javascript
    // Config
    const MAX_FONT_SCALE = 200; // %
    const MIN_FONT_SCALE = 80; // %
    const FREEFORM_TAGS = true; // Apply TWC to freeform tags.
    const AUTO_TWC_ON_READING_PAGE = true; // Apply TWC automatically on reading page.
```

## Compatible

- [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) on [Chromium](https://www.chromium.org/Home) or [Chrome](https://www.google.com/chrome/) desktop browser.
