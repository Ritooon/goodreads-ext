var opts = {};
const uri = window.location.pathname.split('/');
var intervalEditions;

// Observer : Reload when infinite scroll
if(document.getElementById('booksBody') != null && document.getElementById('booksBody') != 'null') {

	const observer = new MutationObserver(() => {
		setOptions(true);
	});

	observer.observe(document.getElementById("booksBody"), { childList: true });
}

document.onreadystatechange = function () {
	if (document.readyState === "complete") {
		console.log('Goodreads enhancer - Loading preferences');
		getOptions(false);
	}
};


// to initialize the all data using the storage
function getOptions(reset = false) {
	chrome.storage.sync.get('opts', function(data) {
		if (data) {
			for (const property in data) {
				if(property == 'opts') {
					for (const [key, value] of Object.entries(data[property])) {
						opts[key] = value;
					}
				}
			}

			setOptions(reset);
		}
	});
}

// Listen any option changes
chrome.storage.onChanged.addListener(function() {
	getOptions(true);
});


function setOptions(reset = false) {

	for (const [opt, value] of Object.entries(opts)) {
		//
		if(opt == 'expandDetailsCheck') {
			intervalEditions = setInterval(setExpanded, 500, value);
		} else if(opt == 'titleCoverGrid' && uri[1] === 'review' && uri[2] === 'list') {
			setCoverTitle(reset, value);
		}  else if(opt == 'bookPageFullSize' && uri[1] === 'review' && uri[2] === 'list') {
			bookPageFullSize(value);
		} else if(opt == 'hideAnnouncements') {
			hideAnnoucements(value, opts.moveAnnouncementHome, uri[1]);
		} else if(opt.indexOf('hideHome') > -1 && uri[1] === '') {
			hideHomeElements(opt, value);
		} else if(opt == 'moveAnnouncementHome' && uri[1] === '') {
			moveTopAnnouncement(value);
		}  else if(opt.indexOf('theme') > -1) {
			setTheme(opt, value);
		}
	}

	// bookDetailsEnhancement 
	if(uri[1] === 'book') {
		bookDetailsEnhancement();
	}
}

function setExpanded(expand) {

	if(intervalEditions != null) {
		clearInterval(intervalEditions);
	}

	let editionLinks = document.querySelectorAll('a.Button');

	// Loop each tooltips to find
	editionLinks.forEach(function(link) {
		if(link.href.indexOf('editions')) {
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

function setCoverTitle(reset, displayTitles) {

	if(!displayTitles) {
		document.querySelectorAll('.div-title-ext').remove();
	} else {

		if(document.getElementById('books') != null && document.getElementById('books') != 'null') {
		
			if(document.getElementById('books').classList.value.indexOf('covers') > -1) {
				let bookslist = document.querySelectorAll('.bookalike');
				let bookName = '';
				let bookNameDiv = '';
	
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

function hideAnnoucements(hide, homeAnnouncementDisplay, actualPage) {
	
	let styleDisplay = 'flex';
	
	if(hide && (!homeAnnouncementDisplay || actualPage != '')) {
		styleDisplay = 'none';
	}	
	
	if(itExists(document.querySelector('.siteHeader__topFullImageContainer'))) {
		document.querySelector('.siteHeader__topFullImageContainer').style.display = styleDisplay;
	}

	let siteHeaderEl = document.querySelector('.SiteHeaderBanner');
	if(itExists(siteHeaderEl)) {
		document.querySelector('.SiteHeaderBanner').style.display = styleDisplay;

		if(hide) {
			document.querySelector('.PageFrame--siteHeaderBanner').style.paddingTop = '6.6rem';
		} else {
			document.querySelector('.PageFrame--siteHeaderBanner').style.paddingTop = '10.6rem';
		}
	}
}

function moveTopAnnouncement(enabled) {
	let annoucnementContainer = document.querySelector('.siteHeader__topFullImageContainer');

	if(itExists(annoucnementContainer)){
		if(enabled) {
			document.querySelector('.siteHeaderBottomSpacer').after(annoucnementContainer);
			document.querySelector('html.withSiteHeaderTopFullImage .siteHeaderBottomSpacer').style.paddingBottom = '50px';
		} else {
			document.querySelector('.siteHeader__topLine').before(annoucnementContainer);
			document.querySelector('html.withSiteHeaderTopFullImage .siteHeaderBottomSpacer').style.paddingBottom = '90px';
		}
	}
}

function hideHomeElements(el, hide) {

	const arrayHomeElements = { 'hideHomeCurrentlyReading' : 'currentlyReadingShelf', 'hideHomeReadingChallenge' : 'readingChallenge' ,
		'hideHomeWantToRead' : 'shelfDisplay__bookCoverLink', 'hideHomeBookshelves' : 'userShelvesBookCounts', 'hideHomeNewsInterviews' : 'gr-editorialBlogPost', 
		'hideHomeRecommendation' : 'recommendationsWidget', 'hideHomeChoiceAwards' : 'choiceWidget'
	};

	styleDisplay = hide == true ? 'none' : 'inherit';

	if(el === 'hideHomeCompanyInfo') {
		let div = document.querySelector('.gr-footer__siteLinks');
		if(itExists(div)) {
			div.closest('footer').style.display = styleDisplay;
		}
	} else if(el === 'hideHomeImproveRecommendation') {
		let div = Array.from(document.querySelectorAll('h3')).find(el => el.textContent === 'Improve Recommendations');

		if(itExists(div)) {
			div.closest('.gr-homePageRailContainer').style.display = styleDisplay;
		}
	} else if(el === 'hideHomeBookshelves') {
		let div = document.querySelector('.'+arrayHomeElements[el]);
		if(itExists(div)) {
			div.closest('.showForLargeWidth').style.display = styleDisplay;
		}
	}  else if(el === 'hideHomeSitesAnnouncements') {
		document.querySelector('.siteAnnouncement').style.display = styleDisplay;
	} else {
		let div = document.querySelector('.'+arrayHomeElements[el]);
		if(itExists(div)) {
			div.closest('.gr-homePageRailContainer').style.display = styleDisplay;
		}
	}
}

function bookPageFullSize(enabled) {
	if(enabled) {
		if(document.getElementById('books').className.indexOf('covers') > -1) {
			document.querySelector('.mainContent').classList.add('gr-ext-mybooks');
		}
	} else {
		document.querySelector('.mainContent').classList.remove('gr-ext-mybooks');
	}
}

function bookDetailsEnhancement() {
	// Display entire summary
	let showMoreEl = Array.from(document.querySelectorAll('.BookPageMetadataSection .Button__labelItem')).find(el => el.textContent === 'Show more'); 
	if(itExists(showMoreEl) && opts.ShowEntireSummary) { showMoreEl.closest('button').click(); }
	// Display all genres
	let AllGenresEl = Array.from(document.querySelectorAll('.Button__labelItem')).find(el => el.textContent === '...more');
	if(itExists(AllGenresEl) && opts.ShowAllGenres) { AllGenresEl.closest('button').click(); }
	// Inject new class to manipulate the DOM style of book page
	document.querySelector('.PageFrame.PageFrame--siteHeaderBanner').classList.add('gr-ext-bookpage');
	// 
	if(opts.moreInfoOnRight) {
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
}
	

function itExists(el) {
	if(typeof el !== 'undefined' && typeof el !== undefined && typeof el !== 'null' && typeof el !== null
		&& el !== 'null' && el !== null) {
			return true;
		}

		return false;
}