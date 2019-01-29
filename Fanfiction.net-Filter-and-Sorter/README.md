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
- Chapters
- Word count greater than
- Word count less or equal
- Reviews
- Favs
- Follows
- Updated
- Published
- Character A
- Character B
- Not Character
- Relationship
- Status

### Additional sorters with asc/dsc order

- Favs
- Follows

## Filter setting

### Manage filters

#### Add new filters

You can add new filters by creating new property in filterDic.
For example, if you want second 'Genre' filter, add new genre filter property with unique key to filterDic.

#### Add exclude filters

Default filter is an include filter.
You can make an exclude filter by adding `reverse: true` to property in filterDic.
For example, if you want 'Exclude Updated' filter, add new updated filter with uniquer key to filterDic, and add `reverse: true` to new updated filter.

#### Disable filters

You can disable a unnecessary filter by comment out a filter property in filterDic.
For example, if you don't need 'Language' filter and 'Published' filter, comment out language property and published property.

#### Filter setting example

```javascript
    // Filters
    // dataId: property key of storyData defined in makeStoryData()
    // text: text for filter select dom
    // title: title for filter select dom
    // mode: used to determine how to compare selectValue and storyValue in throughFilter()
    // options: when mode is 'gt', 'ge', 'le' or 'dateRange', you have to specify.
    // reverse: reverse result of throughFilter()
    const filterDic = {
        fandom: { dataId: 'fandom', text: 'Fandom', title: "Fandom filter", mode: 'contain' },
        crossover: { dataId: 'crossover', text: 'Crossover ?', title: "Crossover filter", mode: 'equal' },
        rating: { dataId: 'rating', text: 'Rating', title: "Rating filter", mode: 'equal' },
        //language: { dataId: 'language', text: 'Language', title: "Language filter", mode: 'equal' },
        genre_a: { dataId: 'genre', text: 'Genre A', title: "Genre a filter", mode: 'contain' },
        genre_b: { dataId: 'genre', text: 'Genre B', title: "Genre b filter", mode: 'contain' },
        chapters: { dataId: 'chapters', text: 'Chapaters', title: "Chapter number less or equal filter", mode: 'le', options: chapterOptions },
        word_count_gt: { dataId: 'word_count', text: '< Words', title: "Word count greater than filter", mode: 'gt', options: wordCountOptions },
        word_count_le: { dataId: 'word_count', text: 'Words ≤', title: "Word count less or equal filter", mode: 'le', options: wordCountOptions },
        reviews: { dataId: 'reviews', text: 'Reviews', title: "Review count greater than or equal filter", mode: 'ge', options: kudoCountOptions },
        favs: { dataId: 'favs', text: 'Favs', title: "Fav count greater than or equal filter", mode: 'ge', options: kudoCountOptions },
        follows: { dataId: 'follows', text: 'Follows', title: "Follow count greater than or equal filter", mode: 'ge', options: kudoCountOptions },
        updated: { dataId: 'updated', text: 'Updated', title: "Updated date range filter", mode: 'dateRange', options: dateRangeOptions },
        not_updated: { dataId: 'updated', text: 'Not Updated', title: "Not Updated date range filter", mode: 'dateRange', options: dateRangeOptions, reverse: true },
        //published: { dataId: 'published', text: 'Published', title: "Published date range filter", mode: 'dateRange', options: dateRangeOptions },
        character_a: { dataId: 'character', text: 'Character A', title: "Character filter a", mode: 'contain' },
        character_b: { dataId: 'character', text: 'Character B', title: "Character filter b", mode: 'contain' },
        not_character: { dataId: 'character', text: 'Not Character', title: "Character filter b", mode: 'contain', reverse: true },
        relationship: { dataId: 'relationship', text: 'Relationship', title: "Relationship filter", mode: 'contain' },
        status: { dataId: 'status', text: 'Status', title: "Status filer", mode: 'equal' }

    };
```

### Edit numerical options

When filter mode is 'gt', 'ge', 'le' or 'dateRange', you have to specify options property. Also you can edit options by changing specified options property.

For example, if you want to single out stories with greater than 200K word counts, add '200K' to wordCountOptions.

```javascript
    // Options for 'gt', 'ge', 'le', 'dateRange' mode.
    // Options for word_count_gt and word_count_le filters.
    // Format: [\d+(K)?] in ascending order
    const wordCountOptions = ['1K', '5K', '10K', '20K', '40K', '60K', '80K', '100K', '200K'];
    // Options for reviews, favs and follows filters.
    // Format: [\d+(K)?] in ascending order
    const kudoCountOptions = ['0', '10', '50', '100', '200', '400', '600', '800', '1K'];
    // Options for updated and published filters.
    // Format: [\d+ (hour|day|week|month|year)(s)?] in ascending order
    const dateRangeOptions = ['24 hours', '1 week', '1 month', '6 months', '1 year', '3 years'];
```

### Sort characters of relationship

```javascript
    // Whether or not to sort characters of relationship in ascending order
    const SORT_CHARACTERS_OF_RELATIONSHIP = true;
```

## Sorter Setting

### Mangage sorters

```javascript
    // Sorter Setting
    // dataId: property key of storyData defined in makeStoryData()
    // text: displayed sorter name
    // order: 'asc' or 'dsc'
    const sorterDicList = [
        { dataId: 'fandom', text: 'Category', order: 'asc' },
        { dataId: 'updated', text: 'Updated', order: 'dsc' },
        { dataId: 'published', text: 'Published', order: 'dsc' },
        { dataId: 'title', text: 'Title', order: 'asc' },
        { dataId: 'word_count', text: 'Words', order: 'dsc' },
        { dataId: 'chapters', text: 'Chapters', order: 'dsc' },
        { dataId: 'reviews', text: 'Reviews', order: 'dsc' },
        { dataId: 'favs', text: 'Favs', order: 'dsc' },
        { dataId: 'follows', text: 'Follows', order: 'dsc' },
        { dataId: 'status', text: 'Status', order: 'asc' }
    ];
```

### Change 'asc', 'dsc' symbol

```javascript
    // Specify symbols to represent 'asc' and 'dsc'.
    const orderSymbol = { asc: '▲', dsc: '▼' };
```

## Compatible

- [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) on [Chromium](https://www.chromium.org/Home) desktop browser.
