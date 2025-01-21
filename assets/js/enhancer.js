var opts = {};
const uri = window.location.pathname.split('/');
var intervalEditions, intervalNotation, localStorageCSS = '', nbBooks = 0, modal, htmlModal;

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
cssStyle += ' '+String(localStorage.getItem('entireSummaryCSS'));
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
		// Option : Expand details on "Show editions" links
		if(opt == 'expandDetailsCheck') {
			// Interval is set, because some pages make a lot of times to add objects to DOM
			intervalEditions = setInterval(setExpanded, 500, value);
		} 
		// Option : Display title under the covers on Cover display in "My books" page 
		else if(opt == 'titleCoverGrid' && uri[1] === 'review' && uri[2] === 'list') {
			setCoverTitle(reset, value);
			document.addEventListener('scroll', scrollBooks);
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
		bookDetailsEnhancement();
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
	
	let styleDisplay = 'flex', styleDisplayGeneral = 'flex';
	localStorageCSS = '';
	let paddingTop = '10.6rem';
	
	
	if(hide && (!homeAnnouncementDisplay || actualPage != '')) {
		styleDisplay = 'none';
		paddingTop = '6.6rem';
	}
	
	if(itExists(document.querySelector('.siteHeader__topFullImageContainer'))) {
		document.querySelector('.siteHeader__topFullImageContainer').setAttribute('style', 'display : '+styleDisplay+' !important');
	}

	// -- LocalStorage
	localStorageCSS += `.PageFrame--siteHeaderBanner { padding-top: ${paddingTop} !important; }`;

	if(hide) {
		localStorageCSS += `.SiteHeaderBanner { display: none !important; }`;
		localStorageCSS += `#SiteStrip { display: none !important; }`;
		paddingTop = '6.6rem';
	} else {
		localStorageCSS += `.SiteHeaderBanner { display: flex !important; }`;
		localStorageCSS += `#SiteStrip { display: flex !important; }`;
		paddingTop = '10.6rem';
	}

	if(homeAnnouncementDisplay) {
		localStorageCSS += `.siteHeader__topFullImageContainer { display: ${styleDisplay} !important; }`;
	}
	// --

	let siteHeaderEl = document.querySelector('.SiteHeaderBanner');
	if(itExists(siteHeaderEl)) {
		document.querySelector('.SiteHeaderBanner').setAttribute('style', 'display : '+styleDisplay);

		if(itExists(document.querySelector('#SiteStrip'))) {
			document.querySelector('#SiteStrip').setAttribute('style', 'display : '+styleDisplay);
		}

		if(hide) {
			document.querySelector('.PageFrame--siteHeaderBanner').style.paddingTop = paddingTop;
		} else {
			document.querySelector('.PageFrame--siteHeaderBanner').style.paddingTop = paddingTop;
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
		document.querySelectorAll('.div-title-ext').forEach(e => e.remove());
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

function scrollBooks() {
	if(opts.titleCoverGrid) {
		if(nbBooks < document.querySelectorAll('.field.cover').length) {
			setCoverTitle(true, opts.titleCoverGrid)
			nbBooks = document.querySelectorAll('.field.cover').length;
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
function bookDetailsEnhancement() {

	let showEntireSummary = opts.ShowEntireSummary, showAllGenres = opts.ShowAllGenres, showMoreInfoOnRight = opts.moreInfoOnRight
		, friendsNotationOnTop = opts.friendsNotationOnTop, hideAverageRatings = opts.hideAverageRatings

	// Display entire summary
	let cssStyle = '';
	
	if(showEntireSummary) {
		cssStyle = '.BookPageMetadataSection__description .TruncatedContent__text { max-height: initial !important; overflow: initial !important; word-break: initial !important; }';
		let style = document.createElement('style');
		style.appendChild(document.createTextNode(cssStyle));
		style.id = 'entireSummaryCSS';
		document.getElementsByTagName('head')[0].appendChild(style);
	} else {
		if(itExists(document.getElementById('entireSummaryCSS'))) {
			document.getElementById('entireSummaryCSS').remove();
		}
	}

	localStorage.setItem('entireSummaryCSS', cssStyle);

	// Display all genres
	let AllGenresEl = Array.from(document.querySelectorAll('.BookPageMetadataSection__genres .Button__labelItem')).find(el => el.textContent === '...more');
	if(itExists(AllGenresEl) && showAllGenres) { AllGenresEl.closest('button').click(); }
	// Inject new class to manipulate the DOM style of book page
	document.querySelector('.PageFrame.PageFrame--siteHeaderBanner').classList.add('gr-ext-bookpage');
	// 
	if(showMoreInfoOnRight) {
		document.querySelector('.gr-ext-bookpage .BookPage__rightColumn').style.cssText =  'grid-column: span var(--num-custom-col-5) !important;';

		let secondRightDiv = document.createElement('div');
		secondRightDiv.classList.add('secondRightDiv');
		document.querySelector('.BookPage__rightColumn').after(secondRightDiv);
		document.querySelector('.secondRightDiv').append(document.querySelector('.AuthorPreview').closest('.PageSection'));
		document.querySelector('.secondRightDiv').append(document.querySelector('.BookPage__relatedBottomContent'));

		//
		let nbOfLazyLoaders = document.querySelectorAll('.BookPage__relatedBottomContent .lazyload-wrapper').length;
		console.log(nbOfLazyLoaders)
		let targetChild = nbOfLazyLoaders - 2;
		console.log(targetChild)

		document.querySelector('.BookPage__relatedBottomContent .lazyload-wrapper:nth-of-type('+targetChild+')').after(document.querySelector('.BookPage__relatedTopContent'));
		document.querySelector('.BookPage__relatedTopContent .Divider').style.display = 'none';

		

		// document.querySelector('.secondRightDiv').append(document.querySelector('.BookPage__relatedTopContent'));
	}

	// Trigger scroll 1px to trigger lazyload to load content after moving elements
	setTimeout(() => {
		window.scrollTo(0, 1);	
	}, 700);


	// Hide average ratings 
	if(hideAverageRatings) {
		getEl('BookPageMetadataSection__ratingStats').style.display = 'none';
	} else {
		getEl('BookPageMetadataSection__ratingStats').style.display = 'block';
	}

	// Friends notations on top
	document.getElementById('SocialReviews').parentNode.className += ' gr-ext-friends-notation';

	if(friendsNotationOnTop) {
		getEl('BookPageMetadataSection__ratingStats').after(document.getElementById('SocialReviews').parentElement);
		document.getElementById('SocialReviews').style.display = 'none';

		setTimeout(() => {
			// HTML of the modal (if reviews)
			createModal('reviews-modal', 'Reviews');
		
			document.getElementById('open-modal').addEventListener('click', openModal);
			document.getElementById('modal-close').addEventListener('click', closeModal);
			window.addEventListener('click', outsideClick);

			document.querySelectorAll('.gr-ext-friends-notation .ReviewCard').forEach(function(review) {
				document.getElementById('modal-body').append(review);				
			});

			if(itExists(getEl('gr-ext-friends-notation .ReviewsList__listContext'))) {
				getEl('gr-ext-friends-notation .ReviewsList__listContext').style.display = 'none';
			}
		}, 500);
		
	} else {
	
		if(itExists(document.getElementById('reviews-modal'))) {
			document.querySelectorAll('.gr-ext-friends-notation .ReviewCard').forEach(function(review) {
				document.querySelector('#SocialReviews .Text__title3').after(review)
			});

			// Remove modal btn
			document.getElementById('open-modal').remove();

			// Remove modal
			document.getElementById('reviews-modal').remove();
		}

		getEl('ReviewsSection__header').after(document.getElementById('SocialReviews').parentElement);
		document.getElementById('SocialReviews').style.display = 'block';
	}
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
			
			// Note for anyone reading this : I'm sorry about that. Goodreads does not make things easym I had to trick it. Will improve this in the future
			let reviewSectionEls = document.getElementById('ReviewsSection').childNodes;
			let className = '', nbLazyLoader = 0; 

			for (let index = 0; index < reviewSectionEls.length; index++) {

				className = reviewSectionEls[index].className;

				if(className !== 'WriteReviewCTA' && className !== 'Divider Divider--largeMargin' 
					&& (className !== 'lazyload-wrapper ' || (className === 'lazyload-wrapper ' && nbLazyLoader > 0))
					&& className !== 'MyReviewCardCarousel') {
						getEl('BookPage__reviewsSection').append(reviewSectionEls[index]);
						index--;
				}

				if(className === 'lazyload-wrapper ') { nbLazyLoader++; }
			}

			getEl('BookActions').after(document.getElementById('ReviewsSection'));		
			
		} else {
			// Remove CSS to update style when it's not on the left
			getEl('BookPage__leftColumn').classList.remove(classNotationLeft);
			//
			getEl('ReviewsSection__header').after(document.getElementById('ReviewsSection'));
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

function createModal(id, headerTitle) {
	let divBackDropModal = document.createElement('div');
	divBackDropModal.id = id;
	divBackDropModal.className = 'modal-backdrop';

	let divModalContent = document.createElement('div');
	divModalContent.id = 'modal-content';

	let divModalHeader = document.createElement('div');
	divModalHeader.id = 'modal-header';
	divModalHeader.textContent = headerTitle;
	
	let divModalClose = document.createElement('span');
	divModalClose.id = 'modal-close';
	divModalClose.textContent = 'X';

	divModalHeader.appendChild(divModalClose);
	divModalContent.appendChild(divModalHeader);

	let divModalBody = document.createElement('div');
	divModalBody.id = 'modal-body';

	divModalContent.appendChild(divModalBody);
	divBackDropModal.appendChild(divModalContent);

	getEl('gr-ext-friends-notation').appendChild(divBackDropModal);
	
	let BtnModal = document.createElement('button');
	BtnModal.className = 'ShelvingSocialSignalCard';
	BtnModal.textContent = 'View friends reviews';
	BtnModal.id = 'open-modal';

	if(itExists(getEl('gr-ext-friends-notation .SignalList'))) {
		getEl('gr-ext-friends-notation .SignalList').append(BtnModal);
	} else {
		getEl('gr-ext-friends-notation #SocialReviews').after(BtnModal);
	}

		
}

function openModal(){
	document.getElementById('reviews-modal').style.display = 'block';
}

function closeModal(){
	document.getElementById('reviews-modal').style.display = 'none';
}

function outsideClick(e){
	let modal = document.getElementById('reviews-modal');
	if(e.target == modal){
		modal.style.display = 'none';
	}
}

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
