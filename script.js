document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('header nav');
    const navLinks = navMenu.querySelectorAll('ul li a');
    const body = document.body;

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = navMenu.classList.toggle('active');
            menuToggle.innerHTML = isActive ? '&times;' : '&#9776;'; // Using HTML entities for cross-browser compatibility
            menuToggle.setAttribute('aria-expanded', isActive);
            body.classList.toggle('menu-open');
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.innerHTML = '&#9776;';
                menuToggle.setAttribute('aria-expanded', 'false');
                body.classList.remove('menu-open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);

            if (!isClickInsideNav && !isClickOnToggle && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                menuToggle.innerHTML = '&#9776;';
                menuToggle.setAttribute('aria-expanded', 'false');
                body.classList.remove('menu-open');
            }
        });
    }

    // Handle resize events
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navMenu.classList.remove('active');
            menuToggle.innerHTML = '&#9776;';
            menuToggle.setAttribute('aria-expanded', 'false');
            body.classList.remove('menu-open');
        }
    });

    // Smooth scroll for anchor links (check if element exists)
    // This primarily applies to links within the same page (especially index.html)
    document.querySelectorAll('a[href^="#"], a[href*="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const hrefAttribute = this.getAttribute('href');
            const isCurrentPageAnchor = hrefAttribute.startsWith('#');
            const isIndexPageAnchor = hrefAttribute.includes('index.html#');

            // If it's a link to a section on the index page
            if (isCurrentPageAnchor || (isIndexPageAnchor && (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')))) {
                const targetSelector = isCurrentPageAnchor ? hrefAttribute : '#' + hrefAttribute.split('#').pop();

                try {
                    const targetElement = document.querySelector(targetSelector);
                    if (targetElement) {
                        e.preventDefault();
                        const headerOffset = document.querySelector('header')?.offsetHeight || 70;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });

                        // Optionally close mobile menu if open after scroll link click
                        if (window.innerWidth <= 768 && navMenu && navMenu.classList.contains('active')) {
                            navMenu.classList.remove('active');
                            menuToggle.innerHTML = '&#9776;';
                            menuToggle.setAttribute('aria-expanded', 'false');
                            body.classList.remove('menu-open');
                        }
                    }
                } catch (error) {
                    console.error("Error finding element for selector:", targetSelector, error);
                    // Element might not exist, allow default browser behavior or handle error
                }
            }
            // If it's a link to a different page, let default browser behavior handle it
        });
    });

    // Active class on nav link based on scroll position (only for index page)
    // And active class for dedicated pages
    const sections = document.querySelectorAll('main section[id]');
    const headerHeight = document.querySelector('header')?.offsetHeight || 70;
    const currentPath = window.location.pathname.split('/').pop() || 'index.html'; // Get current filename or 'index.html'

    const activateNavLink = () => {
        let activeLinkFound = false;

        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            const linkPath = linkHref.split('/').pop() || 'index.html'; // Get linked filename or 'index.html'
            const linkHash = linkHref.includes('#') ? linkHref.split('#').pop() : null;

            if (currentPath === 'index.html') {
                let currentSectionId = '';
                const scrollPosition = window.pageYOffset + headerHeight + 1; // Add header height and a small buffer

                // Check sections in view from bottom up to find the highest visible one
                for (let i = sections.length - 1; i >= 0; i--) {
                    const section = sections[i];
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;

                    // Check if the bottom of the section is above the scroll position
                    // and the top of the section is below the scroll position + some buffer (e.g., quarter screen height)
                    // This helps activate the link slightly before the section is fully in view
                    const activationPoint = scrollPosition + (window.innerHeight / 4); // Activate when section is quarter way up screen

                    if (activationPoint >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                        currentSectionId = section.getAttribute('id');
                        break; // Found the section, no need to check others
                    }
                }

                // Special handling for the top (accueil) section if no other section is clearly active
                if (window.pageYOffset <= sections[0]?.offsetTop - headerHeight + 10 || currentSectionId === '') { // Small buffer for top
                    currentSectionId = 'accueil';
                }

                // Special handling for the bottom section
                // Check if scrolled almost to the very bottom of the page
                if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 50) { // Small buffer
                    const lastSection = sections[sections.length - 1];
                    if (lastSection) currentSectionId = lastSection.id;
                }

                if (linkHash && linkHash === currentSectionId) {
                    // Also ensure it's the current page if the link is relative (e.g. #accueil)
                    // or that the link explicitly points to index.html
                    if (linkHref.startsWith('#') || linkHref.includes('index.html')) {
                        link.classList.add('active');
                        activeLinkFound = true;
                    }
                } else if (currentSectionId === 'accueil' && (linkHref.startsWith('#accueil') || linkHref.includes('index.html#accueil'))) {
                    // Ensure accueil link is active if at the very top, even if currentSectionId calculation was imperfect
                    if (!activeLinkFound) { // Only add if no other link is already active
                        link.classList.add('active');
                        activeLinkFound = true;
                    }
                }
            } else if (linkPath === currentPath) {
                // For dedicated pages (a-propos.html, qui-sommes-nous.html, organisation.html, inscription.html, contact.html)
                link.classList.add('active');
                activeLinkFound = true;
            }
        });
    };

    // Add event listeners only once
    window.addEventListener('scroll', activateNavLink);
    window.addEventListener('resize', activateNavLink); // Also check on resize
    activateNavLink(); // Initial check on load
});