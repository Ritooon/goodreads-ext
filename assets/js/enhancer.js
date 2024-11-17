var opts = {};
const uri = window.location.pathname.split('/');
var intervalEditions, intervalNotation, localStorageCSS = '';

// Console log to announce extension is working
console.log('Goodreads enhancement - Loading preferences');

// Observer in "My books" page : Reload when infinite scroll
if(document.getElementById('booksBody') != null && document.getElementById('booksBody') != 'null') {

	const observer = new MutationObserver(() => {
		setOptions(true);
	});

	observer.observe(document.getElementById("booksBody"), { childList: true });
}


// Load CSS stored faster via localStorage
let style = document.createElement('style');
let cssStyle = '';
cssStyle += ' '+String(localStorage.getItem('hideAnnouncementCSS'));
cssStyle += ' '+String(localStorage.getItem('moveTopAnnouncementCSS'));
cssStyle += ' '+String(localStorage.getItem('homeElementsCSS'));
style.appendChild(document.createTextNode(cssStyle));
style.id = 'firstLoadCSS';
document.getElementsByTagName('html')[0].appendChild(style);


// Loading the options
document.onreadystatechange = function () {
	if (document.readyState === "complete") {
		// Get saved options
		getOptions(false);
	}
};

// Get saved options from Chrome storage
function getOptions(reset = false) {

	chrome.storage.sync.get('opts', function(data) {
		if (data.opts) {
			for (const property in data) {
				if(property == 'opts') {
					for (const [key, value] of Object.entries(data[property])) {
						opts[key] = value;
					}
				}
			}

			setOptions(reset);
		} else {
			console.log('Goodreads enhancement - First initialisation ')
			// First initialisation 
			opts['hideAnnouncements'] = true;	
			opts['expandDetailsCheck'] = true;	
			opts['moveAnnouncementHome'] = true;	
			opts['titleCoverGrid'] = true;	
			opts['bookPageFullSize'] = true;	
			opts['ShowEntireSummary'] = true;	
			opts['ShowAllGenres'] = true;	
			opts['moreInfoOnRight'] = true;	
			chrome.storage.sync.set({'opts': opts});
		}
	});
}

// Listen any option changes
chrome.storage.onChanged.addListener(function() {
	// Get and set options after changing into the extension config
	getOptions(true);
	// Remove first loaded CSS to apply new modifications
	if(document.getElementById('firstLoadCSS')) {
		document.getElementById('firstLoadCSS').remove();
	}
});

// Function whym loop into options saved and call the functions if needed
function setOptions(reset = false) {

	for (const [opt, value] of Object.entries(opts)) {
		console.log(opt)
		// Option : Expand details on "Show editions" links
		if(opt == 'expandDetailsCheck') {
			// Interval is set, because some pages make a lot of times to add objects to DOM
			intervalEditions = setInterval(setExpanded, 500, value);
		} 
		// Option : Display title under the covers on Cover display in "My books" page 
		else if(opt == 'titleCoverGrid' && uri[1] === 'review' && uri[2] === 'list') {
			setCoverTitle(reset, value);
		}
		// Option : Make "My books" page content full size
		else if(opt == 'bookPageFullSize' && uri[1] === 'review' && uri[2] === 'list') {
			bookPageFullSize(value);
		} 
		// Option : Hide announcement top bar (If not home or moveAnnouncementHome is disabled)
		else if(opt == 'hideAnnouncements') {
			hideAnnoucements(value, opts.moveAnnouncementHome, uri[1]);
		} 
		// Option : Hide home element 
		else if(opt.indexOf('hideHome') > -1 && uri[1] === '') {
			hideHomeElements(opt, value);
		} 
		// Option to move announcement top bar under the menu, so not sticky anymore (Only on home)
		else if(opt == 'moveAnnouncementHome' && uri[1] === '') {
			moveTopAnnouncement(value);
		}  
		// Option to replace book notation by edition notation
		else if(opt == 'replaceBookNotation' && uri[1] === 'book') {
			// Interval is set, because some pages make a lot of times to add objects to DOM
			intervalNotation = setInterval(replaceBookNotation, 500, value);
		}
		// Option : Theme options
		else if(opt.indexOf('theme') > -1) {
			setTheme(opt, value);
		}
	}

	// If on a book page, load enhancements 
	if(uri[1] === 'book') {
		bookDetailsEnhancement(opts.ShowEntireSummary, opts.ShowAllGenres, opts.moreInfoOnRight);
	}
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////
//     		HOME FUNCTIONS
////////////////////////////////////////////////////
////////////////////////////////////////////////////

// Option to move announcement top bar under the menu, so not sticky anymore (Only on home)
function moveTopAnnouncement(enabled) {
	localStorageCSS = '';
	let annoucnementContainer = document.querySelector('.siteHeader__topFullImageContainer');

	if(itExists(annoucnementContainer)){
		if(enabled) {
			document.querySelector('.siteHeaderBottomSpacer').after(annoucnementContainer);
			document.querySelector('html.withSiteHeaderTopFullImage .siteHeaderBottomSpacer').style.paddingBottom = '50px';
			localStorageCSS += `html.withSiteHeaderTopFullImage .siteHeaderBottomSpacer { padding-bottom: 50px !important; }`;
		} else {
			document.querySelector('.siteHeader__topLine').before(annoucnementContainer);
			document.querySelector('html.withSiteHeaderTopFullImage .siteHeaderBottomSpacer').style.paddingBottom = '90px';
			localStorageCSS += `html.withSiteHeaderTopFullImage .siteHeaderBottomSpacer { padding-bottom: 90px !important; }`;
		}
	}

	localStorage.setItem('moveTopAnnouncementCSS', localStorageCSS);
}

// Funtion to hide home element 
function hideHomeElements(el, hide) {

	localStorageCSS = '';

	const arrayHomeElements = { 'hideHomeCurrentlyReading' : 'currentlyReadingShelf', 'hideHomeReadingChallenge' : 'readingChallenge' ,
		'hideHomeWantToRead' : 'shelfDisplay__bookCoverLink', 'hideHomeBookshelves' : 'userShelvesBookCounts', 'hideHomeNewsInterviews' : 'gr-editorialBlogPost', 
		'hideHomeRecommendation' : 'recommendationsWidget', 'hideHomeChoiceAwards' : 'choiceWidget'
	};

	styleDisplay = hide == true ? 'none' : 'inherit';

	// Goodreads info link footer
	if(el === 'hideHomeCompanyInfo') {

		let div = document.querySelector('.gr-footer__siteLinks');
		if(itExists(div)) {
			div.closest('footer').style.display = styleDisplay;
		}

		localStorageCSS += `footer:has(.gr-footer__siteLinks) { display: ${styleDisplay} !important; }`;

	} 
	// Improve recommandation bloc
	else if(el === 'hideHomeImproveRecommendation') {
		
		let div = Array.from(document.querySelectorAll('h3')).find(el => el.textContent === 'Improve Recommendations');

		if(itExists(div)) {
			div.closest('.gr-homePageRailContainer').style.display = styleDisplay;
		}
		
	} 
	// Bookshelves info bloc
	else if(el === 'hideHomeBookshelves') {

		let div = document.querySelector('.'+arrayHomeElements[el]);

		if(itExists(div)) {
			div.closest('.showForLargeWidth').style.display = styleDisplay;
		}

		localStorageCSS += `.showForLargeWidth:has(.${arrayHomeElements[el]}) { display: ${styleDisplay} !important; }`;

	}  
	// Site announcement bloc (Top of timeline)
	else if(el === 'hideHomeSitesAnnouncements') {

		document.querySelector('.siteAnnouncement').style.display = styleDisplay;
		localStorageCSS += `.siteAnnouncement { display: ${styleDisplay} !important; }`;

	} 
	// Any other bloc
	else {

		let div = document.querySelector('.'+arrayHomeElements[el]);

		if(itExists(div)) {
			div.closest('.gr-homePageRailContainer').style.display = styleDisplay;
		}

		localStorageCSS += `.gr-homePageRailContainer:has(.${arrayHomeElements[el]}) { display: ${styleDisplay} !important; }`;
	}

	localStorage.setItem('homeElementsCSS', localStorageCSS);
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////
//     		EVERYWHERE FUNCTIONS
////////////////////////////////////////////////////
////////////////////////////////////////////////////

// Expand details on "Show editions" links
function setExpanded(expand) {
	// Target links
	let editionLinks = document.querySelectorAll('a.Button');

	// Loop each tooltips to find
	editionLinks.forEach(function(link) {
		if(link.href.indexOf('editions')) {
			
			// We found a link, so considering elements are loaded in DOM, clear the interval
			if(intervalEditions != null) {
				clearInterval(intervalEditions);
			}

			// If option set to true, add parameters to the link
			if(expand) {
				if(link.href.indexOf('?expanded=true&per_page=100') == -1) {
					link.href += '?expanded=true&per_page=100';
				}
			} else {
				link.href.replace('?expanded=true&per_page=100', '');
			}
		}
	});
}

// Hide announcement top bar (If not home or moveAnnouncementHome is disabled)
function hideAnnoucements(hide, homeAnnouncementDisplay, actualPage) {
	
	let styleDisplay = 'flex';
	localStorageCSS = '';
	
	
	if(hide && (!homeAnnouncementDisplay || actualPage != '')) {
		styleDisplay = 'none';
	}	
	
	if(itExists(document.querySelector('.siteHeader__topFullImageContainer'))) {
		document.querySelector('.siteHeader__topFullImageContainer').style.display = styleDisplay;
		localStorageCSS += `.siteHeader__topFullImageContainer { display: ${styleDisplay} !important; }`;
	}

	let siteHeaderEl = document.querySelector('.SiteHeaderBanner');
	if(itExists(siteHeaderEl)) {
		document.querySelector('.SiteHeaderBanner').style.display = styleDisplay;
		localStorageCSS += `.SiteHeaderBanner { display: ${styleDisplay} !important; }`;

		if(hide) {
			document.querySelector('.PageFrame--siteHeaderBanner').style.paddingTop = '6.6rem';
			localStorageCSS += '.PageFrame--siteHeaderBanner { padding-top: 6.6rem !important; }';
		} else {
			document.querySelector('.PageFrame--siteHeaderBanner').style.paddingTop = '10.6rem';
			localStorageCSS += '.PageFrame--siteHeaderBanner { padding-top: 10.6rem !important; }';
		}
	}

	localStorage.setItem('hideAnnouncementCSS', localStorageCSS);
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////
//     		MY BOOKS FUNCTIONS
////////////////////////////////////////////////////
////////////////////////////////////////////////////

// Display title under the covers on Cover display in "My books" page
function setCoverTitle(reset, displayTitles) {

	if(!displayTitles) {
		document.querySelectorAll('.div-title-ext').remove();
	} else {

		if(document.getElementById('books') != null && document.getElementById('books') != 'null') {
		
			if(document.getElementById('books').classList.value.indexOf('covers') > -1) {
				let bookslist = document.querySelectorAll('.bookalike');
				let bookName = '', bookNameDiv = '';
	
				// If not the 1st time preferences are loaded, delete fom injected
				if(reset) {
					let elements = document.getElementsByClassName('div-title-ext');
					while(elements.length > 0) {
						elements[0].parentNode.removeChild(elements[0]);
					}
				}
	
				bookslist.forEach(function(book) {
					//
					bookName = book.querySelector('.title > .value > a').innerText;
					//
					bookNameDiv = document.createElement('div');
					bookNameDiv.setAttribute('class', 'div-title-ext');
					bookNameDiv.append(document.createTextNode(bookName));
					//
					book.querySelector('.field.cover').append(bookNameDiv);
					// Bigger cover
					book.querySelector('.field.cover').querySelector('img').src = book.querySelector('.field.cover').querySelector('img').src.replace('SY160', 'SY200').replace('SX98', 'SY200');
					
				});
			}
		}
	}	
}

// Make "My books" page content full size
function bookPageFullSize(enabled) {
	if(enabled) {
		if(document.getElementById('books').className.indexOf('covers') > -1) {
			document.querySelector('.mainContent').classList.add('gr-ext-mybooks');
		}
	} else {
		document.querySelector('.mainContent').classList.remove('gr-ext-mybooks');
	}
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////
//     		BOOK PAGE FUNCTIONS
////////////////////////////////////////////////////
////////////////////////////////////////////////////

// Update the display in a book page to make it better
function bookDetailsEnhancement(showEntireSummary, showAllGenres, showMoreInfoOnRight) {
	// Display entire summary
	let showMoreEl = Array.from(document.querySelectorAll('.BookPageMetadataSection .Button__labelItem')).find(el => el.textContent === 'Show more'); 
	if(itExists(showMoreEl) && showEntireSummary) { showMoreEl.closest('button').click(); }
	// Display all genres
	let AllGenresEl = Array.from(document.querySelectorAll('.BookPageMetadataSection__genres .Button__labelItem')).find(el => el.textContent === '...more');
	if(itExists(AllGenresEl) && showAllGenres) { AllGenresEl.closest('button').click(); }
	// Inject new class to manipulate the DOM style of book page
	document.querySelector('.PageFrame.PageFrame--siteHeaderBanner').classList.add('gr-ext-bookpage');
	// 
	if(showMoreInfoOnRight) {
		let secondRightDiv = document.createElement('div');
		secondRightDiv.classList.add('secondRightDiv');
		document.querySelector('.BookPage__rightColumn').after(secondRightDiv);
		document.querySelector('.secondRightDiv').append(document.querySelector('.AuthorPreview').closest('.PageSection'));
		document.querySelector('.secondRightDiv').append(document.querySelector('.BookPage__relatedBottomContent'));
		document.querySelector('.secondRightDiv').append(document.querySelector('.BookPage__relatedTopContent'));
	}
	// Trigger scroll 1px to trigger lazyload to load content after moving elements
	setTimeout(() => {
		window.scrollTo(0, 1);	
	}, 500);
}

function replaceBookNotation(active) {
	let elToMove = '', classNotationLeft = '';
	
	if(itExists(getEl('MyReviewCardCarousel'))) {
		elToMove = 'MyReviewCardCarousel';
		classNotationLeft = 'gr-ext-book-edition-notation-left';
	} else if(itExists(getEl('WriteReviewCTA'))) {
		elToMove = 'WriteReviewCTA';
		classNotationLeft = 'gr-ext-book-edition-notation-left-no-carousel';
	}

	if(elToMove !== '') {
		// Element found, so considering elements are loaded in DOM, clear the interval
		if(intervalNotation != null) {
			clearInterval(intervalNotation);
		}

		// Move notation
		if(active) {
			// Inject CSS to update style when it's on the left
			getEl('BookPage__leftColumn').classList.add(classNotationLeft);
			// Move element
			getEl('BookActions').before(getEl(elToMove));
		} else {
			// Remove CSS to update style when it's not on the left
			getEl('BookPage__leftColumn').classList.remove(classNotationLeft);
			// Move element
			getEl('ReviewsSection__header').after(getEl(elToMove));
		}
	}
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////
//     		THEMING FUNCTIONS
////////////////////////////////////////////////////
////////////////////////////////////////////////////

// Theming functions (In progress)
function setTheme(el, colorValue) {

	let cssStyle = '';

	if(el === 'themeBgColor') {
		cssStyle += `.gr-homePageBody, body, .mainContentFloat, .mainContent, .Alert--informational, .TruncatedContent__gradientOverlay
		 	, .Spotlight, .HeaderNavDropdown--browse > ul { 
			background-color: ${colorValue} !important;
			background: ${colorValue} !important;
		}`;
	} else if(el === 'themeNavbarColor') {
		cssStyle += `.siteHeader__topLine, .Header__siteHeaderBanner { background-color: ${colorValue} !important; }`;
	}  else if(el === 'themeTextColor') {
		cssStyle += `* { color: ${colorValue} !important; }
			.Carousel__paginationButton .Icon svg { fill: #000; }
		`;
	} else if(el === 'themeNavbarElHoverColor') {
		cssStyle += `.HeaderPrimaryNav__list > li > a:hover, .HeaderPrimaryNav__list > li > a:focus, .HeaderPrimaryNav__list > li:hover > a
			, .HeaderPrimaryNav__list > li:focus-within > a, .siteHeader__topLevelLink:hover, .primaryNavMenu__trigger:hover, .primaryNavMenu__menu
			, .primaryNavMenu__trigger--active, html.no-touchevents .dropdown__trigger--personalNav:hover, .headerPersonalNav:hover { 
			background-color: ${colorValue} !important; 
		}`;
	} else if(el === 'themeHomeFeedColor') {
		cssStyle += `.gr-newsfeedItem, .gr-newsfeedItem__details { background-color: ${colorValue} !important; }
			.gr-commentForm.gr-mediaBox, .gr-newsfeedItem, .likeInformation { border-color: ${colorValue} !important; }
			
		`;
	} else if(el === 'themeHomeLoadMoreColor') {
		cssStyle += `.gr-newsfeed__loadMore button { 
			background-color: ${colorValue} !important; 
			border-color: ${colorValue} !important; 
		}`;
	} else if(el === 'themeInvertLogo') {
		cssStyle += `.siteHeader__logo, .GoodreadsWordmark { filter: invert(1); }`;
	}
	
	let style = document.createElement('style');
	style.appendChild(document.createTextNode(cssStyle));
	document.getElementsByTagName('head')[0].appendChild(style);

	//
	localStorage.setItem('themeGoodReads', cssStyle);
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////
//     		MISC FUNCTIONS
////////////////////////////////////////////////////
////////////////////////////////////////////////////

function getEl(className) {
	return document.querySelector('.'+className);
}

// Function to verify if element is present in DOM and avoid js errors
function itExists(el) {
	if(typeof el !== 'undefined' && typeof el !== undefined && typeof el !== 'null' && typeof el !== null
		&& el !== 'null' && el !== null) {
			return true;
		}

		return false;
}
