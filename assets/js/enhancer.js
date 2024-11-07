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

			// setTimeout(() => {
				setOptions(reset);
			// }, 200);
		}
	});
}

// Listen any option changes
chrome.storage.onChanged.addListener(function(changes) {
	getOptions(true);
});


function setOptions(reset = false) {

	for (const [opt, value] of Object.entries(opts)) {
		if(opt == 'expandDetailsCheck') {
			intervalEditions = setInterval(setExpanded, 500, value);
		} else if(opt == 'titleCoverGrid') {
			if(uri[1] === 'review' && uri[2] === 'list') {
				setCoverTitle(reset, value);
			}
		}  else if(opt == 'hideAnnouncements') {
			hideAnnoucements(value);
		} else if(opt.indexOf('hideHome' > -1) ) {
			if(uri[1] === '') {
				hideHomeElements(opt, value);
			}
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
	let tooltipID, matches;

	// Loop each tooltips to find
	editionLinks.forEach(function(link, index) {
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

		if(document.getElementById('books').className.indexOf('covers') > -1) {
			document.querySelector('.mainContent').classList.add('gr-ext-mybooks');
		}

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
	
				bookslist.forEach(function(book, index) {
					//
					bookName = book.querySelector('.title > .value > a').innerText;
					//
					bookNameDiv = document.createElement('div');
					bookNameDiv.setAttribute('class', 'div-title-ext');
					bookNameDiv.append(document.createTextNode(bookName));
					//
					book.querySelector('.field.cover').append(bookNameDiv);
					// Bigger cover
					book.querySelector('img').src = book.querySelector('img').src.replace('SY160', 'SY200').replace('SX98', 'SY200');
				});
			}
		}
	}	
}

function hideAnnoucements(hide) {
	
	styleDisplay = hide == true ? 'none' : 'inherit';
	
	if(document.querySelector('.siteHeader__topFullImageContainer') != null && document.querySelector('.siteHeader__topFullImageContainer') != 'null') {
		document.querySelector('.siteHeader__topFullImageContainer').style.display = styleDisplay;
	}

	let siteHeaderEl = document.querySelector('.SiteHeaderBanner');
	if(itExists(siteHeaderEl)) {
			document.querySelector('.SiteHeaderBanner').style.display = styleDisplay;
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

function bookDetailsEnhancement() {
	// Display entire summary
	let showMoreEl = Array.from(document.querySelectorAll('.BookPageMetadataSection .Button__labelItem')).find(el => el.textContent === 'Show more'); 
	if(itExists(showMoreEl)) { showMoreEl.closest('button').click(); }
	// Display all genres
	let AllGenresEl = Array.from(document.querySelectorAll('.Button__labelItem')).find(el => el.textContent === '...more');
	if(itExists(AllGenresEl)) { AllGenresEl.closest('button').click(); }
	// Inject new class to manipulate the DOM style of book page
	document.querySelector('.PageFrame.PageFrame--siteHeaderBanner').classList.add('gr-ext-bookpage');
	// 
	let secondRightDiv = document.createElement('div');
	secondRightDiv.classList.add('secondRightDiv');
	document.querySelector('.BookPage__rightColumn').after(secondRightDiv);
	document.querySelector('.secondRightDiv').append(document.querySelector('.AuthorPreview').closest('.PageSection'));
	document.querySelector('.secondRightDiv').append(document.querySelector('.BookPage__relatedBottomContent'));
	document.querySelector('.secondRightDiv').append(document.querySelector('.BookPage__relatedTopContent'));
	
	// Trigger scroll 1px to trigger lazyload to load content after moving elements
	setTimeout(() => {
		window.scrollTo(0, 1);	
		window.scrollTo(0, 0);	
	}, 500);
}
	

function itExists(el) {
	if(typeof el !== 'undefined' && typeof el !== undefined && typeof el !== 'null' && typeof el !== null
		&& el !== 'null' && el !== null) {
			return true;
		}

		return false;
}