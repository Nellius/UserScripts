// ==UserScript==
// @name         Fanfiction.net: Filter and Sorter
// @namespace    https://greasyfork.org/en/users/163551-vannius
// @version      0.8
// @license      MIT
// @description  Add filters and additional sorters to author page of Fanfiction.net.
// @author       Vannius
// @match        https://www.fanfiction.net/u/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    // setting
    const filterDic = {
        fandom: { text: 'Fandom', title: "Fandom filter", mode: 'contain' },
        crossover: { text: 'Crossover ?', title: "Crossover filter", mode: 'equal' },
        rating: { text: 'Rating', title: "Rating filter", mode: 'equal' },
        language: { text: 'Language', title: "Language filter", mode: 'equal' },
        genre: { text: 'Genre', title: "Genre filter", mode: 'contain' },
        word_count_gt: { text: '< Words', title: "Word count greater than filter", mode: 'gt' },
        word_count_le: { text: 'Words ≤', title: "Word count less or equal filter", mode: 'le' },
        reviews: { text: 'Reviews', title: "Review count greater than or equal filter", mode: 'ge' },
        favs: { text: 'Favs', title: "Fav count greater than or equal filter", mode: 'ge' },
        follows: { text: 'Follows', title: "Follow count greater than or equal filter", mode: 'ge' },
        date_updated: { text: 'Updated', title: "Updated date range filter", mode: 'range' },
        date_published: { text: 'Published', title: "Published date range filter", mode: 'range' },
        character_a: { text: 'Character A', title: "Character filter a", mode: 'contain' },
        character_b: { text: 'Character B', title: "Character filter b", mode: 'contain' },
        status: { text: 'Status', title: "Status filer", mode: 'equal' }
    };

    // setting for filter options by number comparison
    // format: \d+(K)?
    const wordCountOptions = ['1K', '5K', '10K', '20K', '40K', '60K', '80K', '100K'];
    // format: \d+(K)?
    const kudoCountOptions = ['0', '10', '50', '100', '200', '400', '600', '800', '1K'];
    // format: \d+ (hour|day|week|month|year)(s)?
    const dateRangeOptions = ['24 hours', '1 week', '1 month', '6 months', '1 year', '3 years'];

    // css
    // eslint-disable-next-line no-undef
    GM_addStyle([
        ".fas-filter-menus {color: gray; font-size: .9em;}",
        ".fas-filter-menu {font-size: 1em; padding: 1px 1px; height: 23px; margin: .1em auto;}",
        ".fas-filter-menu_locked {background-color: #ccc;}",
        ".fas-filter-menu:disabled {border: #999; background-color: #999;}",
        ".fas-filter-menu-item {color: #555;}",
        ".fas-filter-menu-item:checked {background-color: #ccc;}",
        ".fas-filter-menu-item_locked {background-color: #ccc;}"
    ].join(''));

    function sortByTitle (a, b) {
        const aTitle = a.dataset.title.toLowerCase();
        const bTitle = b.dataset.title.toLowerCase();

        if (aTitle > bTitle) {
            return 1;
        } else if (aTitle < bTitle) {
            return -1;
        } else {
            return 0;
        }
    };

    function sortByFavs (a, b) {
        const aText = a.getElementsByClassName('z-padtop2')[0].textContent;
        const bText = b.getElementsByClassName('z-padtop2')[0].textContent;
        const aExec = / - Favs: ([\d,]+) - .+$/.exec(aText);
        const bExec = / - Favs: ([\d,]+) - .+$/.exec(bText);
        const aFavs = aExec ? parseInt(aExec[1].replace(/,/g, '')) : 0;
        const bFavs = bExec ? parseInt(bExec[1].replace(/,/g, '')) : 0;

        if (aFavs < bFavs) {
            return 1;
        } else if (aFavs > bFavs) {
            return -1;
        } else {
            return sortByTitle(a, b);
        }
    }

    function sortByFollows (a, b) {
        const aText = a.getElementsByClassName('z-padtop2')[0].textContent;
        const bText = b.getElementsByClassName('z-padtop2')[0].textContent;
        const aExec = / - Follows: ([\d,]+) - .+$/.exec(aText);
        const bExec = / - Follows: ([\d,]+) - .+$/.exec(bText);
        const aFavs = aExec ? parseInt(aExec[1].replace(/,/g, '')) : 0;
        const bFavs = bExec ? parseInt(bExec[1].replace(/,/g, '')) : 0;

        if (aFavs < bFavs) {
            return 1;
        } else if (aFavs > bFavs) {
            return -1;
        } else {
            return sortByTitle(a, b);
        }
    }

    for (let tabId of ['st', 'fs']) {
        const tab = document.getElementById(tabId);
        const tabInside = document.getElementById(tabId + '_inside');

        const continueFlag = (() => {
            if (tabInside) {
                if (tab.firstElementChild.tagName === 'DIV') {
                    return false;
                }
            }
            return true;
        })();
        if (continueFlag) {
            continue;
        }

        // sorter
        const favSpan = document.createElement('span');
        favSpan.textContent = 'Favs';
        favSpan.className = 'gray';
        favSpan.addEventListener('click', (e) => {
            // .filter_placeholder is added by
            // https://greasyfork.org/ja/scripts/13486-fanfiction-net-unwanted-result-filter
            const zListTags = tabInside.querySelectorAll('div.z-list:not(.filter_placeholder)');
            const placeHolderTags = tabInside.getElementsByClassName('filter_placeholder');
            const fragment = document.createDocumentFragment();
            [...zListTags]
                .sort(sortByFavs)
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

        const followSpan = document.createElement('span');
        followSpan.textContent = 'Follows';
        followSpan.className = 'gray';
        followSpan.addEventListener('click', (e) => {
            // .filter_placeholder is added by
            // https://greasyfork.org/ja/scripts/13486-fanfiction-net-unwanted-result-filter
            const zListTags = tabInside.querySelectorAll('div.z-list:not(.filter_placeholder)');
            const placeHolderTags = tabInside.getElementsByClassName('filter_placeholder');
            const fragment = document.createDocumentFragment();
            [...zListTags]
                .sort(sortByFollows)
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

        const fragment = document.createDocumentFragment();
        fragment.appendChild(document.createTextNode(' '));
        fragment.appendChild(favSpan);
        fragment.appendChild(document.createTextNode(' . '));
        fragment.appendChild(followSpan);
        fragment.appendChild(document.createTextNode(' . '));
        tab.firstElementChild.appendChild(fragment);

        // filter
        const makeStoryData = (zList) => {
            const storyData = {};
            storyData.title = zList.dataset.title;
            storyData.fandom = zList.dataset.category;
            storyData.story_id = parseInt(zList.dataset.storyid);
            storyData.date_published = parseInt(zList.dataset.datesubmit);
            storyData.date_updated = parseInt(zList.dataset.dateupdate);
            storyData.reviews = parseInt(zList.dataset.ratingtimes);
            storyData.chapters = parseInt(zList.dataset.chapters);
            storyData.word_count_gt = parseInt(zList.dataset.wordcount);
            storyData.word_count_le = parseInt(zList.dataset.wordcount);
            storyData.status = parseInt(zList.dataset.statusid) === 1 ? 'In-Progress' : 'Complete';

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

                storyData.character_a = [];
                storyData.character_b = [];
                storyData.relationship = [];
                const characterExec = /Published: [^-]+ - (.+)$/.exec(dataText.replace(/ - Complete$/, ''));
                if (characterExec) {
                    const bracketMatches = characterExec[1].match(/\[[^\]]+\]/g);
                    if (bracketMatches) {
                        for (let bracketMatch of bracketMatches) {
                            const characters = bracketMatch
                                .split(/\[|\]|, /).map(x => x.trim()).filter(x => x);
                            storyData.relationship.push(characters);
                        }
                    }
                    storyData.character_a = characterExec[1]
                        .split(/\[|\]|, /).map(x => x.trim()).filter(x => x);
                    storyData.character_b = [...storyData.character_a];
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

        const throughFilter = (storyValue, selectValue, filterKey) => {
            if (selectValue === 'default') {
                return true;
            } else {
                const filterMode = filterDic[filterKey].mode;
                if (filterMode === 'equal') {
                    return storyValue === selectValue;
                } else if (filterMode === 'contain') {
                    return storyValue.includes(selectValue);
                } else if (filterMode === 'range') {
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
                    Object.assign(storyDic[id], storyData);

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
            story.displayFlag = Object.keys(story.filterStatus).every(x => story.filterStatus[x]);

            if (story.placeHolder) {
                story.placeHolder.style.display = story.displayFlag ? '' : 'none';
            } else {
                story.dom.style.display = story.displayFlag ? '' : 'none';
            }
        };

        const filterStories = (selectKey, selectValue) => {
            const storyDic = makeStoryDic();
            Object.keys(storyDic).forEach(x => {
                storyDic[x].filterStatus[selectKey] =
                    throughFilter(storyDic[x][selectKey], selectValue, selectKey);
                changeStoryDisplay(storyDic[x]);
            });

            // Make selectDic
            const selectDic = {};
            Object.keys(filterDic).forEach(filterKey => {
                const selectTag = document.getElementById(tabId + '_' + filterKey + '_select');
                selectDic[filterKey] = {};
                selectDic[filterKey].dom = selectTag;
                selectDic[filterKey].value = selectDic[filterKey].dom.value;
                selectDic[filterKey].disabled = selectDic[filterKey].dom.hasAttribute('disabled');
                selectDic[filterKey].optionDic = {};
                if (!selectDic[filterKey].disabled) {
                    const optionTags = selectTag.getElementsByTagName('option');
                    [...optionTags]
                        .filter(optionTag => optionTag.value !== 'default')
                        .forEach(optionTag => {
                            selectDic[filterKey].optionDic[optionTag.value] = { dom: optionTag };
                        });
                }
            });

            // Hide useless options
            Object.keys(filterDic).forEach(filterKey => {
                const optionDic = selectDic[filterKey].optionDic;

                if (!selectDic[filterKey].disabled) {
                    const usableOptionValues = (() => {
                        const usableStoryValues = Object.keys(storyDic)
                            .filter(x => {
                                const filterStatus = { ...storyDic[x].filterStatus };
                                filterStatus[filterKey] = true;
                                return Object.keys(filterStatus).every(x => filterStatus[x]);
                            }).map(x => storyDic[x][filterKey])
                            .reduce((p, x) => p.concat(x), []) // flat()
                            .filter((x, i, self) => self.indexOf(x) === i)
                            .sort((a, b) => a - b);

                        const filterMode = filterDic[filterKey].mode;
                        if (['gt', 'ge', 'le', 'range'].includes(filterMode)) {
                            const sufficientOptionValues = usableStoryValues.map(storyValue => {
                                const optionValues = Object.keys(optionDic);
                                const throughOptionValues = optionValues
                                    .filter(optionValue => throughFilter(storyValue, optionValue, filterKey));
                                if (filterMode === 'gt' || filterMode === 'ge') {
                                    return throughOptionValues[throughOptionValues.length - 1];
                                } else if (filterMode === 'le' || filterMode === 'range') {
                                    return throughOptionValues[0];
                                }
                            }).filter((x, i, self) => self.indexOf(x) === i);
                            return sufficientOptionValues;
                        } else {
                            return usableStoryValues;
                        }
                    })();

                    // Add/remove hidden attribute to useless options by usableOptionValues
                    Object.keys(optionDic).forEach(optionValue => {
                        const usable = usableOptionValues.includes(optionValue);
                        optionDic[optionValue].usable = usable;
                        if (!usable) {
                            optionDic[optionValue].dom.setAttribute('hidden', '');
                        } else {
                            optionDic[optionValue].dom.removeAttribute('hidden');
                        }
                    });
                }
            });

            // Hide same character
            const characterDicList = [
                { c1: selectDic['character_a'], c2: selectDic['character_b'] },
                { c1: selectDic['character_b'], c2: selectDic['character_a'] }
            ];
            characterDicList.forEach(dic => {
                if (dic.c2.value !== 'default') {
                    dic.c1.optionDic[dic.c2.value].dom.setAttribute('hidden', '');
                }
            });

            // Add/remove .fas-filter-menu_locked and .fas-filter-menu-item_locked
            Object.keys(filterDic)
                .filter(filterKey => !selectDic[filterKey].disabled)
                .forEach(filterKey => {
                    const optionDic = selectDic[filterKey].optionDic;

                    // Remove .fas-filter-menu_locked and .fas-filter-menu-item_locked
                    selectDic[filterKey].dom.classList.remove('fas-filter-menu_locked');
                    Object.keys(optionDic)
                        .forEach(x => optionDic[x].dom.classList.remove('fas-filter-menu-item_locked'));

                    const visibleOptionValues = Object.keys(optionDic)
                        .filter(x => optionDic[x].usable);

                    // Add .fas-filter-menu_locked
                    if (visibleOptionValues.length === 1) {
                        selectDic[filterKey].dom.classList.add('fas-filter-menu_locked');
                    } else {
                        const filteredStoryIds = Object.keys(storyDic)
                            .filter(x => storyDic[x].displayFlag)
                            .sort();

                        const makeAlternateFilterResult = (optionValue) => {
                            return Object.keys(storyDic)
                                .filter(x => {
                                    const filterStatus = { ...storyDic[x].filterStatus };
                                    filterStatus[filterKey] =
                                        throughFilter(storyDic[x][filterKey], optionValue, filterKey);
                                    return Object.keys(filterStatus).every(x => filterStatus[x]);
                                }).sort();
                        };

                        // Add .fas-filter-menu-item_locked when alternatelyFilteredStoryIds are equal to filteredStoryIds
                        // Add .fas-lockey when every alternatelyFilteredStoryIds are equal to filteredStoryIds
                        const optionLocked = visibleOptionValues
                            .filter(optionValue => !(filterKey === selectKey && optionValue === selectValue))
                            .map(optionValue => {
                                const alternatelyFilteredStoryIds = makeAlternateFilterResult(optionValue);
                                const idsEqualFlag = JSON.stringify(filteredStoryIds) === JSON.stringify(alternatelyFilteredStoryIds);
                                if (idsEqualFlag) {
                                    optionDic[optionValue].dom.classList.add('fas-filter-menu-item_locked');
                                }
                                return idsEqualFlag;
                            }).every(x => x);

                        if (optionLocked) {
                            selectDic[filterKey].dom.classList.add('fas-filter-menu_locked');
                        }
                    }
                });

            // Change badge's story number
            const badge = document.getElementById('l_' + tabId).firstElementChild;
            const displayedStoryNumber = [...Object.keys(storyDic).filter(x => storyDic[x].displayFlag)].length;
            badge.textContent = displayedStoryNumber;

            console.log(storyDic);
        };

        const filterDiv = document.createElement('div');
        filterDiv.classList.add('fas-filter-menus');
        filterDiv.appendChild(document.createTextNode('Filter: '));

        const initialStoryDic = makeStoryDic();

        const makeSelectTag = (filterKey, defaultText) => {
            const selectTag = document.createElement('select');
            selectTag.id = tabId + '_' + filterKey + '_select';
            selectTag.title = filterDic[filterKey].title;
            selectTag.classList.add('fas-filter-menu');
            const defaultOption = document.createElement('option');
            defaultOption.textContent = defaultText;
            defaultOption.value = 'default';
            defaultOption.classList.add('fas-filter-menu-item');
            selectTag.appendChild(defaultOption);

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
                } else if (['gt', 'ge', 'le', 'range'].includes(filterMode)) {
                    const allOptionValues = (() => {
                        if (filterKey === 'word_count_gt') {
                            return ['0'].concat(wordCountOptions).map(x => x + ' <');
                        } else if (filterKey === 'word_count_le') {
                            return wordCountOptions.concat(['∞']).map(x => '≤ ' + x);
                        } else if (['reviews', 'favs', 'follows'].includes(filterKey)) {
                            return kudoCountOptions.map(x => x + ' ≤');
                        } else if (['date_published', 'date_updated'].includes(filterKey)) {
                            return dateRangeOptions.concat(['∞']).map(x => 'With in ' + x);
                        }
                    })();

                    const sufficientOptionValues = storyValues.map(storyValue => {
                        const throughOptionValues = allOptionValues
                            .filter(optionValue => throughFilter(storyValue, optionValue, filterKey));
                        if (filterMode === 'gt' || filterMode === 'ge') {
                            return throughOptionValues[throughOptionValues.length - 1];
                        } else if (filterMode === 'le' || filterMode === 'range') {
                            return throughOptionValues[0];
                        }
                    }).filter((x, i, self) => self.indexOf(x) === i);

                    return allOptionValues.filter(x => sufficientOptionValues.includes(x));
                } else {
                    return storyValues;
                }
            })();

            optionValues.forEach(optionValue => {
                const option = document.createElement('option');
                option.textContent = optionValue;
                option.value = optionValue;
                option.classList.add('fas-filter-menu-item');
                selectTag.appendChild(option);
            });

            const optionTags = selectTag.getElementsByTagName('option');
            if (optionTags.length === 2) {
                selectTag.value = optionTags[1].value;
                selectTag.setAttribute('disabled', '');
            }

            selectTag.addEventListener('change', (e) => {
                filterStories(filterKey, selectTag.value);
            });
            return selectTag;
        };

        Object.keys(filterDic).forEach(key => {
            const filterTag = makeSelectTag(key, filterDic[key].text);
            filterDiv.appendChild(filterTag);
            filterDiv.appendChild(document.createTextNode(' '));
        });

        const clear = document.createElement('span');
        clear.textContent = 'Clear';
        clear.title = "Reset filter values to default";
        clear.className = 'gray';
        clear.addEventListener('click', (e) => {
            const enabledSelectTags = Object.keys(filterDic)
                .map(x => tabId + '_' + x + '_select')
                .map(x => document.getElementById(x))
                .filter(x => !x.hasAttribute('disabled'));

            const changed = !(enabledSelectTags.every(x => x.value === 'default'));
            if (changed) {
                enabledSelectTags.forEach(x => {
                    x.value = 'default';
                });
                const storyDic = makeStoryDic();
                Object.keys(storyDic).forEach(x => changeStoryDisplay(storyDic[x]));

                enabledSelectTags.forEach(selectTag => {
                    selectTag.classList.remove('fas-filter-menu_locked');
                    selectTag.classList.remove('fas-filter-menu_selected');

                    const optionTags = selectTag.getElementsByTagName('option');
                    [...optionTags].forEach(option => {
                        option.removeAttribute('hidden');
                        option.classList.remove('fas-filter-menu-item_locked');
                    });
                });

                const badge = document.getElementById('l_' + tabId).firstElementChild;
                badge.textContent = [...Object.keys(storyDic)].length;
            }
        });
        filterDiv.appendChild(clear);
        tab.insertBefore(filterDiv, tab.firstChild);
    }
})();
