var opts = {};

// Observer : Reload when infinite scroll
if(document.getElementById('booksBody') != null && document.getElementById('booksBody') != 'null') {

	const observer = new MutationObserver(() => {
		setOptions(true);
	});

	observer.observe(document.getElementById("booksBody"), { childList: true });
}

getOptions(false);

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

			setTimeout(() => {
				setOptions(reset);
			}, 200);
		}
	});
}

// Listen any option changes
chrome.storage.onChanged.addListener(function(changes) {
	getOptions(true);
});


function setOptions(reset = false) {

	let uri = window.location.pathname.split('/');

	for (const [opt, value] of Object.entries(opts)) {
		if(opt == 'expandDetailsCheck') {
			setExpanded(value);
		} else if(opt == 'titleCoverGrid') {
			setCoverTitle(reset, value);
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
	setTimeout(function(expand){
		let editionLinks = document.querySelectorAll('a.Button');
		let tooltipID, matches;
	
		// Loop each tooltips to find
		editionLinks.forEach(function(link, index) {
			if(link.href.indexOf('editions')) {
				if(expand) {
					link.href += '?expanded=true&per_page=100';
				} else {
					link.href.replace('?expanded=true&per_page=100', '');
				}
			}
		});
	}, 500);
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

	if(document.querySelector('.SiteHeaderBanner') != null && document.querySelector('.SiteHeaderBanner') != 'null') {
		document.querySelector('.SiteHeaderBanner').style.display = styleDisplay;
	}
}

function hideHomeElements(el, hide) {

	const arrayHomeElements = { 'hideHomeCurrentlyReading' : 'currentlyReadingShelf', 'hideHomeReadingChallenge' : 'readingChallenge__edit' ,
		'hideHomeWantToRead' : 'shelfDisplay__bookCoverLink', 'hideHomeBookshelves' : 'userShelvesBookCounts', 'hideHomeNewsInterviews' : 'gr-editorialBlogPost', 
		'hideHomeRecommendation' : 'recommendationsWidget', 'hideHomeChoiceAwards' : 'choiceWidget'
	};

	styleDisplay = hide == true ? 'none' : 'inherit';

	if(el === 'hideHomeCompanyInfo') {
		let div = document.querySelector('.gr-footer__siteLinks');
		div.closest('footer').style.display = styleDisplay;
	} else if(el === 'hideHomeImproveRecommendation') {
		let div = Array.from(document.querySelectorAll('h3')).find(el => el.textContent === 'Improve Recommendations');
		console.log(div)
		if(div != null && div != 'null') {
			div.closest('.gr-homePageRailContainer').style.display = styleDisplay;
		}
	} else if(el === 'hideHomeBookshelves') {
		let div = document.querySelector('.'+arrayHomeElements[el]);
		div.closest('.showForLargeWidth').style.display = styleDisplay;
	} else {
		let div = document.querySelector('.'+arrayHomeElements[el]);
		div.closest('.gr-homePageRailContainer').style.display = styleDisplay;
	}
}

function bookDetailsEnhancement() {
	Array.from(document.querySelectorAll('.Button__labelItem')).find(el => el.textContent === 'Show more').closest('button').click();
	Array.from(document.querySelectorAll('.Button__labelItem')).find(el => el.textContent === '...more').closest('button').click();
	document.querySelector('body').click();
}
	