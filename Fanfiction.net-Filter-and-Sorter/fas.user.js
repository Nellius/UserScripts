// ==UserScript==
// @name         Fanfiction.net: Filter and Sorter
// @namespace    https://greasyfork.org/en/users/163551-vannius
// @version      0.91
// @license      MIT
// @description  Add filters and additional sorters to author page of Fanfiction.net.
// @author       Vannius
// @match        https://www.fanfiction.net/u/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    // Filter Setting
    // Options for 'gt', 'ge', 'le', 'dateRange' mode.
    // Options for word_count_gt and word_count_le filters.
    // Format: [\d+(K)?] in ascending order
    const wordCountOptions = ['1K', '5K', '10K', '20K', '40K', '60K', '80K', '100K'];
    // Options for reviews, favs and follows filters.
    // Format: [\d+(K)?] in ascending order
    const kudoCountOptions = ['10', '50', '100', '200', '400', '600', '800', '1K'];
    // Options for updated and published filters.
    // Format: [\d+ (hour|day|week|month|year)(s)?] in ascending order
    const dateRangeOptions = ['24 hours', '1 week', '1 month', '6 months', '1 year', '3 years'];

    // dataId: property key of storyData defined in makeStoryData()
    // text: text for filter select dom
    // title: title for filter select dom
    // mode: used to determine how to compare selectValue and storyValue in throughFilter()
    // options: when mode is 'gt', 'ge', 'le', 'dateRange', you have to specify.
    // reverse: reverse result of throughFilter()
    const filterDic = {
        fandom: { dataId: 'fandom', text: 'Fandom', title: "Fandom filter", mode: 'contain' },
        crossover: { dataId: 'crossover', text: 'Crossover ?', title: "Crossover filter", mode: 'equal' },
        rating: { dataId: 'rating', text: 'Rating', title: "Rating filter", mode: 'equal' },
        language: { dataId: 'language', text: 'Language', title: "Language filter", mode: 'equal' },
        genre: { dataId: 'genre', text: 'Genre', title: "Genre filter", mode: 'contain' },
        word_count_gt: { dataId: 'word_count', text: '< Words', title: "Word count greater than filter", mode: 'gt', options: wordCountOptions },
        word_count_le: { dataId: 'word_count', text: 'Words ≤', title: "Word count less or equal filter", mode: 'le', options: wordCountOptions },
        reviews: { dataId: 'reviews', text: 'Reviews', title: "Review count greater than or equal filter", mode: 'ge', options: kudoCountOptions },
        favs: { dataId: 'favs', text: 'Favs', title: "Fav count greater than or equal filter", mode: 'ge', options: kudoCountOptions },
        follows: { dataId: 'follows', text: 'Follows', title: "Follow count greater than or equal filter", mode: 'ge', options: kudoCountOptions },
        updated: { dataId: 'updated', text: 'Updated', title: "Updated date range filter", mode: 'dateRange', options: dateRangeOptions },
        published: { dataId: 'published', text: 'Published', title: "Published date range filter", mode: 'dateRange', options: dateRangeOptions },
        character_a: { dataId: 'character', text: 'Character A', title: "Character filter a", mode: 'contain' },
        character_b: { dataId: 'character', text: 'Character B', title: "Character filter b", mode: 'contain' },
        not_character: { dataId: 'character', text: 'Not Character', title: "Character reverse filter", mode: 'contain', reverse: true },
        relationship: { dataId: 'relationship', text: 'Relationship', title: "Relationship filter", mode: 'contain' },
        status: { dataId: 'status', text: 'Status', title: "Status filer", mode: 'equal' }
    };

    // Whether or not to sort characters of relationship in ascending order.
    const SORT_CHARACTERS_OF_RELATIONSHIP = true;

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

    // Specify symbols to represent 'asc' and 'dsc'.
    const orderSymbol = { asc: '▲', dsc: '▼' };

    // css
    // eslint-disable-next-line no-undef
    GM_addStyle([
        ".fas-sorter { color: gray; }",
        ".fas-sorter:after { content: attr(data-order); }",
        ".fas-filter-menus { color: gray; font-size: .9em; }",
        ".fas-filter-menu { font-size: 1em; padding: 1px 1px; height: 23px; margin: .1em auto; }",
        ".fas-filter-execlude-menu { border-color: #777; }",
        ".fas-filter-menu_locked { background-color: #ccc; }",
        ".fas-filter-menu:disabled { border-color: #999; background-color: #999; }",
        ".fas-filter-menu-item { color: #555; }",
        ".fas-filter-menu-item:checked { background-color: #ccc; }",
        ".fas-filter-menu-item_locked { background-color: #ccc; }"
    ].join(''));

    // Main
    // Check standard of filterDic
    const defaultFilterDataKeys = ['dataId', 'text', 'title', 'mode', 'options', 'reverse'];
    const modesRequireOptions = ['gt', 'ge', 'le', 'dateRange'];
    const filterDicUpToStandard = Object.keys(filterDic)
        .map(filterKey => {
            const filterData = filterDic[filterKey];
            const everyKeyUpToStandard = Object.keys(filterData)
                .map(filterDataKey => {
                    const keyUpToStandard = defaultFilterDataKeys.includes(filterDataKey);
                    if (!keyUpToStandard) {
                        console.log(`${filterKey} filter: '${filterDataKey}' is an irregular key.`);
                    }
                    return keyUpToStandard;
                }).every(x => x);

            const modeRequirementUpTostandard =
                modesRequireOptions.includes(filterData.mode) ? 'options' in filterData : true;
            if (!modeRequirementUpTostandard) {
                console.log(`${filterKey} filter: '${filterData.mode}' mode filter requires to specify options.`);
            }
            return everyKeyUpToStandard && modeRequirementUpTostandard;
        }).every(x => x);
    if (!filterDicUpToStandard) {
        console.log("filterDic isn't up to standard.");
        return;
    }

    for (let tabId of ['st', 'fs']) {
        // Initiation
        const tab = document.getElementById(tabId);
        const tabInside = document.getElementById(tabId + '_inside');

        // Is there a need to add sorters and filters?
        const moreThanOneStories = tabInside && tabInside.getElementsByClassName('z-list').length >= 2;
        if (!moreThanOneStories) {
            continue;
        }

        // Sorter functions
        const makeSorterFunctionBy = (dataId, order = 'asc') => {
            const sorterFunctionBy = (a, b) => {
                const aData = makeStoryData(a);
                const bData = makeStoryData(b);
                if (aData[dataId] < bData[dataId]) {
                    return order === 'asc' ? -1 : 1;
                } else if (aData[dataId] > bData[dataId]) {
                    return order === 'asc' ? 1 : -1;
                } else {
                    const sortByTitle = makeSorterFunctionBy('title');
                    return sortByTitle(a, b);
                }
            };
            return sorterFunctionBy;
        };

        const makeSorterTag = (sorterDic) => {
            const sorterId = sorterDic.dataId;
            const sorterText = sorterDic.text;
            const firstOrder = sorterDic.order;
            const sorterSpan = document.createElement('span');
            sorterSpan.textContent = sorterText;
            sorterSpan.classList.add('fas-sorter');
            sorterSpan.dataset.order = '';
            sorterSpan.addEventListener('click', (e) => {
                const sortedWithFirstOrder = e.target.dataset.order === orderSymbol[firstOrder];
                const sorterTags = document.getElementsByClassName('fas-sorter');
                [...sorterTags].forEach(sorterTag => {
                    sorterTag.dataset.order = '';
                });
                const [secondOrder] = ['asc', 'dsc'].filter(x => x !== firstOrder);
                const nextOrder = sortedWithFirstOrder ? secondOrder : firstOrder;
                e.target.dataset.order = orderSymbol[nextOrder];
                const sortBySorterId = makeSorterFunctionBy(sorterId, nextOrder);
                // .filter_placeholder is added by
                // https://greasyfork.org/ja/scripts/13486-fanfiction-net-unwanted-result-filter
                const zListTags = tabInside.querySelectorAll('div.z-list:not(.filter_placeholder)');
                const placeHolderTags = tabInside.getElementsByClassName('filter_placeholder');
                const fragment = document.createDocumentFragment();
                [...zListTags]
                    .sort(sortBySorterId)
                    .forEach(x => {
                        if (placeHolderTags.length) {
                            [...placeHolderTags]
                                .filter(p => x.dataset.storyid === p.dataset.storyid)
                                .forEach(p => fragment.appendChild(p));
                        }
                        fragment.appendChild(x);
                    });
                tabInside.appendChild(fragment);
            });
            return sorterSpan;
        };

        // Make sorters
        // Remvoe original sorter span
        while (tab.firstElementChild.firstChild) {
            tab.firstElementChild.removeChild(tab.firstElementChild.firstChild);
        }

        // Append sorters
        const fragment = document.createDocumentFragment();
        fragment.appendChild(document.createTextNode('Sort: '));
        sorterDicList.forEach(sorterDic => {
            const sorterSpan = makeSorterTag(sorterDic);
            fragment.appendChild(sorterSpan);
            fragment.appendChild(document.createTextNode(' . '));
        });
        tab.firstElementChild.appendChild(fragment);

        // Filter functions
        // Make story data from .zList tag.
        const makeStoryData = (zList) => {
            const storyData = {};
            storyData.title = zList.dataset.title;
            storyData.fandom = zList.dataset.category;
            storyData.story_id = parseInt(zList.dataset.storyid);
            storyData.published = parseInt(zList.dataset.datesubmit);
            storyData.updated = parseInt(zList.dataset.dateupdate);
            storyData.reviews = parseInt(zList.dataset.ratingtimes);
            storyData.chapters = parseInt(zList.dataset.chapters);
            storyData.word_count = parseInt(zList.dataset.wordcount);
            storyData.status = parseInt(zList.dataset.statusid) === 1 ? 'In-Progress' : 'Complete';

            // .zList.filter_placeholder tag doesn't have .z-padtop2 tag.
            // https://greasyfork.org/ja/scripts/13486-fanfiction-net-unwanted-result-filter
            const zPadtop2Tags = zList.getElementsByClassName('z-padtop2');
            if (zPadtop2Tags.length) {
                const dataText = zPadtop2Tags[0].textContent;
                let frontText = /^(.+) - Chapter/.exec(dataText)[1];
                storyData.crossover = /^Crossover - /.test(frontText) ? 'Crossover' : 'Not Crossover';
                const rateExec = /^.+ - Rated: ([^ ]+) - (.+)/.exec(frontText);
                storyData.rating = rateExec[1];
                frontText = rateExec[2];

                const languageGenre = frontText.split(' - ');
                storyData.language = languageGenre[0];
                storyData.genre = [];
                if (languageGenre.length > 1) {
                    const genreList = [
                        'Adventure', 'Angst', 'Crime', 'Drama', 'Family', 'Fantasy',
                        'Friendship', 'General', 'Horror', 'Humor', 'Hurt/Comfort',
                        'Mystery', 'Parody', 'Poetry', 'Romance', 'Sci-Fi', 'Spiritual',
                        'Supernatural', 'Suspense', 'Tragedy', 'Western'
                    ];

                    for (let genre of genreList) {
                        if (languageGenre[1].includes(genre)) {
                            storyData.genre.push(genre);
                        }
                    }
                }

                const favExec = / - Favs: ([\d,]+) - .+$/.exec(dataText);
                storyData.favs = favExec ? parseInt(favExec[1].replace(/,/g, '')) : 0;
                const followExec = / - Follows: ([\d,]+) - .+$/.exec(dataText);
                storyData.follows = followExec ? parseInt(followExec[1].replace(/,/g, '')) : 0;

                storyData.character = [];
                storyData.relationship = [];
                const characterExec = /Published: [^-]+ - (.+)$/.exec(dataText.replace(/ - Complete$/, ''));
                if (characterExec) {
                    const bracketMatches = characterExec[1].match(/\[[^\]]+\]/g);
                    if (bracketMatches) {
                        for (let bracketMatch of bracketMatches) {
                            // [foo, bar] => [bar, foo]
                            if (SORT_CHARACTERS_OF_RELATIONSHIP) {
                                const sortedCharacters = bracketMatch
                                    .split(/\[|\]|, /)
                                    .map(x => x.trim())
                                    .filter(x => x)
                                    .sort()
                                    .join(', ');
                                storyData.relationship.push('[' + sortedCharacters + ']');
                            // [foo, bar] => [foo, bar]
                            } else {
                                storyData.relationship.push(bracketMatch);
                            }
                        }
                    }
                    storyData.character = characterExec[1]
                        .split(/\[|\]|, /).map(x => x.trim()).filter(x => x);
                }
            }
            return storyData;
        };

        const timeStrToInt = (timeStr) => {
            const hour = 3600;
            const day = hour * 24;
            const week = hour * 24 * 7;
            const month = week * 4;
            const year = month * 12;

            const matches = timeStr
                .replace(/hour(s)?/, hour.toString())
                .replace(/day(s)?/, day.toString())
                .replace(/week(s)?/, week.toString())
                .replace(/month(s)?/, month.toString())
                .replace(/year(s)?/, year.toString())
                .match(/\d+/g);

            return matches ? parseInt(matches[0]) * parseInt(matches[1]) : null;
        };

        // Judge if a story with storyValue passes through filter with selectValue.
        const throughFilter = (storyValue, selectValue, filterKey) => {
            if (selectValue === 'default') {
                return true;
            } else {
                const filterMode = filterDic[filterKey].mode;
                const resultByFilterMode = (() => {
                    if (filterMode === 'equal') {
                        return storyValue === selectValue;
                    } else if (filterMode === 'contain') {
                        return storyValue.includes(selectValue);
                    } else if (filterMode === 'dateRange') {
                        const now = Math.floor(Date.now() / 1000);
                        const intRange = timeStrToInt(selectValue);
                        return intRange === null || now - storyValue <= intRange;
                    } else if (['gt', 'ge', 'le'].includes) {
                        const execResult = /\d+/.exec(selectValue.replace(/K/, '000'));
                        const intSelectValue = execResult ? parseInt(execResult[0]) : null;
                        if (filterMode === 'gt') {
                            return storyValue > intSelectValue;
                        } else if (filterMode === 'ge') {
                            return storyValue >= intSelectValue;
                        } else if (filterMode === 'le') {
                            return intSelectValue === null || storyValue <= intSelectValue;
                        }
                    }
                })();
                return filterDic[filterKey].reverse ? !resultByFilterMode : resultByFilterMode;
            }
        };

        const makeStoryDic = () => {
            const selectFilterDic = {};
            Object.keys(filterDic).forEach(filterKey => {
                const selectId = tabId + '_' + filterKey + '_select';
                const selectTag = document.getElementById(selectId);
                selectFilterDic[filterKey] = selectTag ? selectTag.value : null;
            });

            const storyDic = {};
            const zListTags = tabInside.getElementsByClassName('z-list');
            [...zListTags].forEach(x => {
                const storyData = makeStoryData(x);
                const id = storyData.story_id;
                storyDic[id] = storyDic[id] || {};

                // .filter_placeholder is added by
                // https://greasyfork.org/ja/scripts/13486-fanfiction-net-unwanted-result-filter
                if (x.classList.contains('filter_placeholder')) {
                    storyDic[id].placeHolder = x;
                } else {
                    storyDic[id].dom = x;
                    Object.keys(filterDic).forEach(filterKey => {
                        const dataId = filterDic[filterKey].dataId;
                        storyDic[id][filterKey] = storyData[dataId];
                    });

                    storyDic[id].filterStatus = {};
                    Object.keys(selectFilterDic).forEach(filterKey => {
                        if (selectFilterDic[filterKey] === null) {
                            storyDic[id].filterStatus[filterKey] = true; // Initialization
                        } else {
                            const filterFlag =
                                throughFilter(storyDic[id][filterKey], selectFilterDic[filterKey], filterKey);
                            storyDic[id].filterStatus[filterKey] = filterFlag;
                        }
                    });
                }
            });
            return storyDic;
        };

        const changeStoryDisplay = (story) => {
            // If a story passes through every filter
            story.displayFlag = Object.keys(story.filterStatus).every(x => story.filterStatus[x]);

            // .filter_placeholder is added by
            // https://greasyfork.org/ja/scripts/13486-fanfiction-net-unwanted-result-filter
            if (story.placeHolder) {
                story.placeHolder.style.display = story.displayFlag ? '' : 'none';
            } else {
                story.dom.style.display = story.displayFlag ? '' : 'none';
            }
        };

        const makeAlternatelyFilteredStoryIds = (storyDic, alternateOptionValue, filterKey) => {
            return Object.keys(storyDic)
                .filter(x => {
                    const filterStatus = { ...storyDic[x].filterStatus };
                    filterStatus[filterKey] =
                        throughFilter(storyDic[x][filterKey], alternateOptionValue, filterKey);
                    return Object.keys(filterStatus).every(x => filterStatus[x]);
                }).sort();
        };

        // Collect all filter doms at once by making selectDic
        const makeSelectDic = () => {
            const selectDic = {};
            Object.keys(filterDic).forEach(filterKey => {
                const selectTag = document.getElementById(tabId + '_' + filterKey + '_select');
                selectDic[filterKey] = {};
                selectDic[filterKey].dom = selectTag;
                selectDic[filterKey].value = selectDic[filterKey].dom.value;
                selectDic[filterKey].displayed = selectDic[filterKey].dom.style.display === '';
                selectDic[filterKey].disabled = selectDic[filterKey].dom.hasAttribute('disabled');
                selectDic[filterKey].accessible = selectDic[filterKey].displayed && !selectDic[filterKey].disabled;
                selectDic[filterKey].optionDic = {};
                if (selectDic[filterKey].accessible) {
                    const optionTags = selectTag.getElementsByTagName('option');
                    [...optionTags].forEach(optionTag => {
                        if (optionTag.value === 'default') {
                            selectDic[filterKey].defaultOption = { dom: optionTag };
                        } else {
                            selectDic[filterKey].optionDic[optionTag.value] = { dom: optionTag };
                        }
                    });
                }
            });

            return selectDic;
        };

        // Apply selectKey filter with selectValue to all stories.
        const filterStories = (selectKey, selectValue) => {
            const storyDic = makeStoryDic();
            // Change display of each story.
            Object.keys(storyDic).forEach(x => {
                storyDic[x].filterStatus[selectKey] =
                    throughFilter(storyDic[x][selectKey], selectValue, selectKey);
                changeStoryDisplay(storyDic[x]);
            });

            // Hide useless options.
            const selectDic = makeSelectDic();
            Object.keys(selectDic)
                .filter(filterKey => selectDic[filterKey].accessible)
                .forEach(filterKey => {
                    const optionDic = selectDic[filterKey].optionDic;

                    // By changing to one of usableOptionValues, display of stories would change.
                    // Excluded options can't change display of stories.
                    const usableOptionValues = (() => {
                        // Make usableStoryValues from alternately filtered stories by neutralizing each filter.
                        const usableStoryValues = Object.keys(storyDic)
                            .filter(x => {
                                const filterStatus = { ...storyDic[x].filterStatus };
                                filterStatus[filterKey] = true;
                                return Object.keys(filterStatus).every(x => filterStatus[x]);
                            }).map(x => storyDic[x][filterKey])
                            .reduce((p, x) => p.concat(x), [])
                            .filter((x, i, self) => self.indexOf(x) === i)
                            .sort((a, b) => a - b);

                        const filterMode = filterDic[filterKey].mode;
                        // Filters with ['gt', 'ge', 'le', 'dateRange'] mode can have redundant options.
                        // Remove redundant options.
                        if (['gt', 'ge', 'le', 'dateRange'].includes(filterMode)) {
                            const reverse = (filterDic[filterKey].reverse);
                            const sufficientOptionValues = usableStoryValues.map(storyValue => {
                                const optionValues = Object.keys(optionDic);
                                const throughOptionValues = optionValues
                                    .filter(optionValue => {
                                        const result = throughFilter(storyValue, optionValue, filterKey);
                                        return reverse ? !result : result;
                                    });
                                if (filterMode === 'gt' || filterMode === 'ge') {
                                    return throughOptionValues[throughOptionValues.length - 1];
                                } else if (filterMode === 'le' || filterMode === 'dateRange') {
                                    return throughOptionValues[0];
                                }
                            }).filter((x, i, self) => self.indexOf(x) === i);
                            return sufficientOptionValues;
                        } else {
                            return usableStoryValues;
                        }
                    })();

                    // Add/remove hidden attribute to options.
                    Object.keys(optionDic).forEach(optionValue => {
                        const usable = usableOptionValues.includes(optionValue);
                        optionDic[optionValue].usable = usable;
                        if (!usable) {
                            optionDic[optionValue].dom.setAttribute('hidden', '');
                        } else {
                            optionDic[optionValue].dom.removeAttribute('hidden');
                        }
                    });
                });

            // Hide same value when filterKey uses same dataId.
            Object.keys(filterDic)
                .filter(filterKey => selectDic[filterKey].accessible)
                .filter(filterKey => !filterDic[filterKey].options)
                .forEach(filterKey => {
                    const filterKeysBySameDataId = Object.keys(filterDic)
                        .filter(x => selectDic[x].accessible)
                        .filter(x => x !== filterKey)
                        .filter(x => filterDic[x].dataId === filterDic[filterKey].dataId);

                    if (filterKeysBySameDataId.length) {
                        filterKeysBySameDataId
                            .filter(x => !filterDic[x].reverse)
                            .filter(x => selectDic[x].value !== 'default')
                            .forEach(x => {
                                const sameValue = selectDic[x].value;
                                selectDic[filterKey].optionDic[sameValue].dom.setAttribute('hidden', '');
                                selectDic[filterKey].optionDic[sameValue].usable = false;
                            });
                    }
                });

            const filteredStoryIds = Object.keys(storyDic)
                .filter(x => storyDic[x].displayFlag)
                .sort();

            Object.keys(selectDic)
                .filter(filterKey => selectDic[filterKey].accessible)
                .forEach(filterKey => {
                    const optionDic = selectDic[filterKey].optionDic;

                    // Remove .fas-filter-menu_locked and .fas-filter-menu-item_locked.
                    selectDic[filterKey].dom.classList.remove('fas-filter-menu_locked');
                    selectDic[filterKey].defaultOption.dom.classList.remove('fas-filter-menu-item_locked');
                    Object.keys(optionDic)
                        .forEach(x => optionDic[x].dom.classList.remove('fas-filter-menu-item_locked'));

                    // Add .fas-filter-menu-item_locked to default option when defaultStoryIds are equal to filteredStoryIds.
                    const defaultStoryIds = makeAlternatelyFilteredStoryIds(storyDic, 'default', filterKey);
                    const defaultOptionLocked = JSON.stringify(filteredStoryIds) === JSON.stringify(defaultStoryIds);

                    if (defaultOptionLocked) {
                        selectDic[filterKey].defaultOption.dom.classList.add('fas-filter-menu-item_locked');
                    }

                    // Add .fas-filter-menu_locked
                    // when every alternatelyFilteredStoryIds are equal to filteredStoryIds,
                    // or there are no usable options.
                    const otherOptionsLocked = Object.keys(optionDic)
                        .filter(optionValue => optionDic[optionValue].usable)
                        .filter(optionValue => !(filterKey === selectKey && optionValue === selectValue))
                        .map(optionValue => {
                            const alternatelyFilteredStoryIds = makeAlternatelyFilteredStoryIds(storyDic, optionValue, filterKey);
                            const idsEqualFlag = JSON.stringify(filteredStoryIds) === JSON.stringify(alternatelyFilteredStoryIds);
                            if (idsEqualFlag) {
                                optionDic[optionValue].dom.classList.add('fas-filter-menu-item_locked');
                            }
                            return idsEqualFlag;
                        }).every(x => x); // [].every(x => x) === true, [].some(x => x) === false

                    // Add .fas-filter-menu-item_locked
                    const optionsLocked = defaultOptionLocked && otherOptionsLocked;
                    if (optionsLocked) {
                        selectDic[filterKey].dom.classList.add('fas-filter-menu_locked');
                    }
                });

            // Change badge's story number.
            const badge = document.getElementById('l_' + tabId).firstElementChild;
            const displayedStoryNumber = [...Object.keys(storyDic).filter(x => storyDic[x].displayFlag)].length;
            badge.textContent = displayedStoryNumber;
        };

        // Add filters
        const filterDiv = document.createElement('div');
        filterDiv.classList.add('fas-filter-menus');
        filterDiv.appendChild(document.createTextNode('Filter: '));

        // Make initialStoryDic from initial state of stories.
        const initialStoryDic = makeStoryDic();
        const initialStoryIds = Object.keys(initialStoryDic).sort();

        // Log initial attributes and classList for clear feature.
        const initialLockedDic = {};

        const makeSelectTag = (filterKey, defaultText) => {
            const selectTag = document.createElement('select');
            selectTag.id = tabId + '_' + filterKey + '_select';
            selectTag.title = filterDic[filterKey].title;
            selectTag.classList.add('fas-filter-menu');
            if (filterDic[filterKey].reverse) {
                selectTag.classList.add('fas-filter-execlude-menu');
            }
            const defaultOption = document.createElement('option');
            defaultOption.textContent = defaultText;
            defaultOption.value = 'default';
            defaultOption.classList.add('fas-filter-menu-item');
            selectTag.appendChild(defaultOption);

            // Make optionValues from
            // filterKey values of each story, wordCountOptions, kudoCountOptions or dateRangeOptions.
            const optionValues = (() => {
                const storyValues = Object.keys(initialStoryDic)
                    .map(x => initialStoryDic[x][filterKey])
                    .reduce((p, x) => p.concat(x), [])
                    .filter((x, i, self) => self.indexOf(x) === i)
                    .sort();

                const filterMode = filterDic[filterKey].mode;
                if (filterKey === 'rating') {
                    const orderedOptions = ['K', 'K+', 'T', 'M'];
                    return orderedOptions.filter(x => storyValues.includes(x));
                } else if (['gt', 'ge', 'le', 'dateRange'].includes(filterMode)) {
                    const allOptionValues = (() => {
                        if (filterMode === 'gt') {
                            return ['0'].concat(filterDic[filterKey].options).map(x => x + ' <');
                        } else if (filterMode === 'ge') {
                            return ['0'].concat(filterDic[filterKey].options).map(x => x + ' ≤');
                        } else if (filterMode === 'le') {
                            return filterDic[filterKey].options.concat(['∞']).map(x => '≤ ' + x);
                        } else if (filterMode === 'dateRange') {
                            return filterDic[filterKey].options.concat(['∞']).map(x => 'With in ' + x);
                        }
                    })();

                    // Filters with ['gt', 'ge', 'le', 'dateRange'] mode can have redundant options.
                    // Remove redundant options.
                    const reverse = (filterDic[filterKey].reverse);
                    const sufficientOptionValues = storyValues.map(storyValue => {
                        const throughOptionValues = allOptionValues
                            .filter(optionValue => {
                                const result = throughFilter(storyValue, optionValue, filterKey);
                                return reverse ? !result : result;
                            });
                        if (filterMode === 'gt' || filterMode === 'ge') {
                            return throughOptionValues[throughOptionValues.length - 1];
                        } else if (filterMode === 'le' || filterMode === 'dateRange') {
                            return throughOptionValues[0];
                        }
                    }).filter((x, i, self) => self.indexOf(x) === i);

                    // "return sufficientOptionValues;" would disturb order of options.
                    return allOptionValues.filter(x => sufficientOptionValues.includes(x));
                } else {
                    return storyValues;
                }
            })();

            initialLockedDic[filterKey] = {};
            initialLockedDic[filterKey].menuDisabled = false;
            initialLockedDic[filterKey].menuLocked = false;
            initialLockedDic[filterKey].itemLockedDic = {};

            const initialOptionLocked = optionValues.map(optionValue => {
                initialLockedDic[filterKey].itemLockedDic[optionValue] = false;

                const option = document.createElement('option');
                option.textContent = optionValue;
                option.value = optionValue;
                option.classList.add('fas-filter-menu-item');

                const alternatelyFilteredStoryIds =
                    makeAlternatelyFilteredStoryIds(initialStoryDic, optionValue, filterKey);
                const idsEqualFlag = JSON.stringify(initialStoryIds) === JSON.stringify(alternatelyFilteredStoryIds);

                // Add .fas-filter-menu-item_locked when alternatelyFilteredStoryIds are equal to initialStoryIds.
                if (idsEqualFlag) {
                    initialLockedDic[filterKey].itemLockedDic[optionValue] = true;
                    option.classList.add('fas-filter-menu-item_locked');
                }
                selectTag.appendChild(option);

                return idsEqualFlag;
            }).every(x => x);

            // When every alternatelyFilteredStoryIds are equal to initialStoryIds,
            const optionTags = selectTag.getElementsByTagName('option');
            if (initialOptionLocked) {
                // if every story have no filter value, don't display filter.
                if (optionTags.length === 1) {
                    selectTag.style.display = 'none';
                // if every stories has same value, disable filter.
                } else if (optionTags.length === 2) {
                    selectTag.value = optionTags[1].value;
                    initialLockedDic[filterKey].menuDisabled = true;
                    selectTag.setAttribute('disabled', '');
                // else, add .fas-filter-menu_locked.
                } else {
                    initialLockedDic[filterKey].menuLocked = true;
                    selectTag.classList.add('fas-filter-menu_locked');
                }
            }

            // Change display of stories by selected filter value.
            selectTag.addEventListener('change', (e) => {
                filterStories(filterKey, selectTag.value);
            });
            return selectTag;
        };

        // Add filters
        Object.keys(filterDic).forEach(filterKey => {
            const filterTag = makeSelectTag(filterKey, filterDic[filterKey].text);
            filterDiv.appendChild(filterTag);
            filterDiv.appendChild(document.createTextNode(' '));
        });

        // Don't display filter when other filter which uses same dataId is disabled.
        Object.keys(filterDic)
            .forEach(filterKey => {
                const filterDisabled = Object.keys(filterDic)
                    .filter(x => x !== filterKey)
                    .filter(x => filterDic[x].dataId === filterDic[filterKey].dataId)
                    .filter(x => initialLockedDic[x].menuDisabled);

                if (filterDisabled.length) {
                    const selectTag = filterDiv.querySelector('#' + tabId + '_' + filterKey + '_select');
                    selectTag.style.display = 'none';
                }
            });

        // Clear filter settings and add attributes and class according to initialLockedDic.
        const clear = document.createElement('span');
        clear.textContent = 'Clear';
        clear.title = "Reset filter values to default";
        clear.className = 'gray';
        clear.addEventListener('click', (e) => {
            const selectDic = makeSelectDic();
            const changed = Object.keys(selectDic)
                .filter(filterKey => selectDic[filterKey].accessible)
                .map(filterKey => selectDic[filterKey].value !== 'default')
                .some(x => x);

            // Is there a need to run clear feature?
            if (changed) {
                Object.keys(selectDic)
                    .filter(filterKey => selectDic[filterKey].accessible)
                    .forEach(filterKey => {
                        selectDic[filterKey].dom.value = 'default';
                        selectDic[filterKey].dom.classList.remove('fas-filter-menu_locked');
                        selectDic[filterKey].dom.classList.remove('fas-filter-menu_selected');

                        if (initialLockedDic[filterKey].menuLocked) {
                            selectDic[filterKey].dom.classList.add('fas-filter-menu_locked');
                        }

                        const optionDic = selectDic[filterKey].optionDic;
                        Object.keys(optionDic).forEach(optionValue => {
                            optionDic[optionValue].dom.classList.remove('fas-filter-menu-item_locked');
                            optionDic[optionValue].dom.removeAttribute('hidden');

                            if (initialLockedDic[filterKey].itemLockedDic[optionValue]) {
                                optionDic[optionValue].dom.classList.add('fas-filter-menu-item_locked');
                            }
                        });
                    });

                // Change display of stories to initial state.
                const storyDic = makeStoryDic();
                Object.keys(storyDic).forEach(x => changeStoryDisplay(storyDic[x]));

                // Change story number to initial state.
                const badge = document.getElementById('l_' + tabId).firstElementChild;
                badge.textContent = [...Object.keys(storyDic)].length;
            }
        });
        filterDiv.appendChild(clear);

        // Append filters
        tab.insertBefore(filterDiv, tab.firstChild);
    }
})();
