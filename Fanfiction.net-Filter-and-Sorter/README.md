# [Fanfiction.net: Filter and Sorter](https://github.com/Nellius/UserScripts/tree/master/Fanfiction.net-Filter-and-Sorter)

## Description

Add filters and additional sorters to author page of Fanfiction.net.

[\[Install\]](https://github.com/Nellius/UserScripts/raw/master/Fanfiction.net-Filter-and-Sorter/fas.user.js) [\[Source\]](https://github.com/Nellius/UserScripts/blob/master/Fanfiction.net-Filter-and-Sorter/fas.user.js) [\[Greasy Fork\]](https://greasyfork.org/ja/scripts/377000-fanfiction-net-filter-and-sorter)

### Demo

![demo](https://github.com/Nellius/UserScripts/raw/master/Fanfiction.net-Filter-and-Sorter/images/fas-demo.gif)

### Filters by

- Fandom
- Crossover
- Rating
- Language
- Genre
- Word count greater than
- Word count less or equal
- Reviews
- Favs
- Follows
- Updated
- Published
- Character A
- Character B
- Relationship
- Status

### Additional sorters

- Favs
- Follows

## Filter setting

### Disable filters

You can disable filters by comment out unnecessary filters in filterDic.
For example, if you don't need 'Language' filter and 'Published' filter, comment out language property and published property.

```javascript
    // Setting
    // To disable unnecessary filters, comment out corresponding properties in filterDic.
    const filterDic = {
        fandom: { text: 'Fandom', title: "Fandom filter", mode: 'contain' },
        crossover: { text: 'Crossover ?', title: "Crossover filter", mode: 'equal' },
        rating: { text: 'Rating', title: "Rating filter", mode: 'equal' },
        // language: { text: 'Language', title: "Language filter", mode: 'equal' },
        genre: { text: 'Genre', title: "Genre filter", mode: 'contain' },
        word_count_gt: { text: '< Words', title: "Word count greater than filter", mode: 'gt' },
        word_count_le: { text: 'Words ≤', title: "Word count less or equal filter", mode: 'le' },
        reviews: { text: 'Reviews', title: "Review count greater than or equal filter", mode: 'ge' },
        favs: { text: 'Favs', title: "Fav count greater than or equal filter", mode: 'ge' },
        follows: { text: 'Follows', title: "Follow count greater than or equal filter", mode: 'ge' },
        updated: { text: 'Updated', title: "Updated date range filter", mode: 'range' },
        // published: { text: 'Published', title: "Published date range filter", mode: 'range' },
        character_a: { text: 'Character A', title: "Character filter a", mode: 'contain' },
        character_b: { text: 'Character B', title: "Character filter b", mode: 'contain' },
        relationship: { text: 'Relationship', title: "Relationship filter", mode: 'contain' },
        status: { text: 'Status', title: "Status filer", mode: 'equal' }
    };
```

### Edit filter options

You can edit options of word_count_gt, word_count_le, reviews, favs, follows and updated and published filters. For example, if you want to single out stories with greater than 200K word counts, add '200K' to wordCountOptions.

```javascript
    // Options for word_count_gt and word_count_le filters.
    // Format: [\d+(K)?] in ascending order
    const wordCountOptions = ['1K', '5K', '10K', '20K', '40K', '60K', '80K', '100K', '200K'];
    // Options for reviews, favs and follows filters.
    // format: [\d+(K)?] in ascending order
    const kudoCountOptions = ['0', '10', '50', '100', '200', '400', '600', '800', '1K'];
    // Options for updated and published filters.
    // format: [\d+ (hour|day|week|month|year)(s)?] in ascending order
    const dateRangeOptions = ['24 hours', '1 week', '1 month', '6 months', '1 year', '3 years'];
```

### Sort characters of relationship

```javascript
    // Whether or not to sort characters of relationship in ascending order
    const SORT_CHARACTERS_OF_RELATIONSHIP = true;
```

## Compatible

- [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) on [Chromium](https://www.chromium.org/Home) desktop browser.
