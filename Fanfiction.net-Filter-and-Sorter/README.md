# [Fanfiction.net: Filter and Sorter](https://github.com/Nellius/UserScripts/tree/master/Fanfiction.net-Filter-and-Sorter)

## Description

Add filters and additional sorters to author, browse, community and search pages of Fanfiction.net. Add "Load all pages" button to browse, community and search pages.

[\[Install\]](https://github.com/Nellius/UserScripts/raw/master/Fanfiction.net-Filter-and-Sorter/fas.user.js) [\[Source\]](https://github.com/Nellius/UserScripts/blob/master/Fanfiction.net-Filter-and-Sorter/fas.user.js) [\[Greasy Fork\]](https://greasyfork.org/ja/scripts/377000-fanfiction-net-filter-and-sorter)

### Demo

#### Author page with filter and sorter

![demo](https://github.com/Nellius/UserScripts/raw/master/Fanfiction.net-Filter-and-Sorter/images/fas-demo.gif)

#### Community page with filter, sorter and "Load all pages" button

![demo](https://github.com/Nellius/UserScripts/raw/master/Fanfiction.net-Filter-and-Sorter/images/fas-load-button-demo.gif)

### Filters by

- Fandom
- Crossover
- Rating
- Language
- Genre
- Chapter number greater than
- Chapter number less or equal
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

## Author Biography Setting

Whether or not hide author biography automatically by clicking `hide bio` button.

```javascript
    // Author Biography Setting
    const HIDE_BIO_AUTOMATICALLY = true;
```

## Filter Setting

### Manage filters

#### Add new filters

You can add new filters by creating new property in filterDic.
For example, if you want second 'Genre' filter, add new genre filter property with unique key to filterDic.

#### Add exclude filters

Default filter is an include filter.
You can make an exclude filter by adding `reverse: true` to property in filterDic.
For example, if you want 'Exclude Updated' filter, add new updated filter with unique key to filterDic, and add `reverse: true` to new updated filter.

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
    // options: required when mode is 'gt', 'ge', 'le', 'dateRange'
    // reverse: reverse result of throughFilter()
    // condition: display filter only if filter[filterKey] has defined value
    const filterDic = {
        fandom_a: { dataId: 'fandom', text: 'Fandom A', title: "Fandom filter a", mode: 'contain' },
        crossover: { dataId: 'crossover', text: '?', title: "Crossover filter", mode: 'equal' },
        // Display only if there are crossover fictions
        fandom_b: { dataId: 'fandom', text: 'Fandom B', title: "Fandom filter b", mode: 'contain', condition: { filterKey: 'crossover', value: 'X' } },
        rating: { dataId: 'rating', text: 'Rating', title: "Rating filter", mode: 'equal' },
        //language: { dataId: 'language', text: 'Language', title: "Language filter", mode: 'equal' },
        genre_a: { dataId: 'genre', text: 'Genre A', title: "Genre a filter", mode: 'contain' },
        genre_b: { dataId: 'genre', text: 'Genre B', title: "Genre b filter", mode: 'contain' },
        not_genre: { dataId: 'genre', text: 'Not Genre', title: "Genre reverse filter", mode: 'contain', reverse: true },
        chapters_gt: { dataId: 'chapters', text: '< Chapters', title: "Chapter number greater than filter", mode: 'gt', options: chapterOptions },
        chapters_le: { dataId: 'chapters', text: 'Chapters ≤', title: "Chapter number less or equal filter", mode: 'le', options: chapterOptions },
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

For example, if you want to single out stories with updated within 3 months, add '3 months' to dateRangeOptions.

```javascript
    // Options for 'gt', 'ge', 'le', 'dateRange' mode.
    // Options for chapters filters.
    // Format: [\d+(K)?] in ascending order
    const chapterOptions = ['1', '5', '10', '20', '30', '50'];
    // Options for word_count_gt and word_count_le filters.
    // Format: [\d+(K)?] in ascending order
    const wordCountOptions = ['1K', '5K', '10K', '20K', '40K', '60K', '80K', '100K', '200K', '300K'];
    // Options for reviews, favs and follows filters.
    // Format: [\d+(K)?] in ascending order
    const kudoCountOptions = ['10', '50', '100', '200', '400', '600', '800', '1K', '2K', '3K'];
    // Options for updated and published filters.
    // Format: [\d+ (hour|day|week|month|year)(s)?] in ascending order
    const dateRangeOptions = ['24 hours', '1 week', '1 month', '3 months', '6 months', '1 year', '3 years', '5 years'];

```

### Sort characters of relationship

```javascript
    // Whether or not to sort characters of relationship in ascending order
    // true:  [foo, bar] => [bar, foo]
    // false: [foo, bar] => [foo, bar]
    const SORT_CHARACTERS_OF_RELATIONSHIP = true;
```

### Change color scheme for options

Default colorScheme is red. Blue, purple and gold colorSchemes are also prepared.
For example, if you want to try a gold color scheme, uncomment a line `const gold...` and change red to gold.

```javascript
    // Css Setting
    // ColorScheme definitions
    // [[backgroundColor, color]]
    const red = ['#ff1111', '#f96540', '#f4a26d', '#efcc99', 'white']
        .map(color => [color, getReadableColor(color, '#555')]);

    // const blue = makeGradualColorScheme('#11f', '#fff', 'rgb', 5, '#555');
    // const purple = makeGradualColorScheme('#cd47fd', '#e8eaf6', 'hsl', 5, '#555');
    const gold = makeGradualColorScheme('gold', 'darkgrey', 'rgb', 5);

    // Select colorScheme
    const colorScheme = gold;
```

You can make colorScheme manually.

```javascript
    // Select colorScheme
    // Format: [['backgroundColor', 'foregroundColor'], . . . ]
    const colorScheme = [['#05f005', 'black'], ['#f0f005', 'black'], ['#f00505', 'black'], ['white', 'black']];
```

You can also make colorScheme gradations automatically by using makeGradualColorScheme function. Change arguments to suit your preference.

```javascript
    // Select colorScheme
    // '#64DD17': start of gradations, 3 or 6 digit hex color or color name
    // '#F1F8E9': end of gradations, 3 or 6 digit hex color or color name
    // 'hsv': color space to make gradations, 'rgb', 'hsv' or 'hsl'
    // 4: length of gradations, number
    // 'black': default foreground color, 3 or 6 digit hex color or color name
    // If 'black' is unreadable on generated background color,
    // it change to readable color automatically.
    const colorScheme = makeGradualColorScheme('#64DD17', '#F1F8E9', 'hsv', 4, 'black');
```

## Sorter Setting

### Manage sorters

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
