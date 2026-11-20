/**
 * Ocean Mallik - Top Navigation Bar Controller
 * - 4-Theme Cycling (Pitch Black, Clean White, Soft Light, Cyberpunk)
 * - View Transitions API with expanding circular clip-path reveal
 * - Smooth 400ms rotate & scale icon morphing
 * - Sliding pill highlight on desktop links
 * - Route-based active page detection with animated underline
 * - Mobile slide-down drawer with full keyboard/focus accessibility
 * - 2px scroll progress line along bottom edge of header
 */

(function () {
    window.NAVBAR_INITIALIZED = true;

    const THEMES = [
        { id: 'theme-black', label: 'Pitch Black', dataTheme: 'dark' },
        { id: 'theme-white', label: 'Clean White', dataTheme: 'light' },
        { id: 'theme-soft', label: 'Soft Light', dataTheme: 'light' },
        { id: 'theme-cyberpunk', label: 'Cyberpunk', dataTheme: 'dark' }
    ];

    /* --- Helper: Get Stored Theme Index --- */
    function getStoredThemeIndex() {
        try {
            const storedTheme = localStorage.getItem('selectedTheme');
            if (storedTheme) {
                const idx = THEMES.findIndex((t) => t.id === storedTheme);
                if (idx !== -1) return idx;
            }

            const storedIdx = parseInt(localStorage.getItem('themeIndex_v2') || localStorage.getItem('themeIndex'), 10);
            if (!Number.isNaN(storedIdx) && storedIdx >= 0 && storedIdx < THEMES.length) {
                return storedIdx;
            }

            const legacy = localStorage.getItem('theme');
            if (legacy === 'light') return 1;
            if (legacy === 'dark') return 0;
        } catch (e) {
            // Ignore storage restrictions
        }

        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 1;
        }
        return 0; // Default: Pitch Black
    }

    /* --- Theme Toggle with Morphing SVG & View Transitions API --- */
    function initNavbarTheme() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;

        let currentThemeIndex = getStoredThemeIndex();

        const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const applyTheme = (index) => {
            currentThemeIndex = (index + THEMES.length) % THEMES.length;
            const theme = THEMES[currentThemeIndex];
            const nextTheme = THEMES[(currentThemeIndex + 1) % THEMES.length];

            document.documentElement.className = theme.id;
            document.documentElement.setAttribute('data-theme', theme.dataTheme);
            document.documentElement.setAttribute('data-current-theme', theme.id);

            if (document.body) {
                document.body.className = theme.id;
            }

            try {
                localStorage.setItem('selectedTheme', theme.id);
                localStorage.setItem('themeIndex_v2', String(currentThemeIndex));
                localStorage.setItem('themeIndex', String(currentThemeIndex));
                localStorage.setItem('theme', theme.dataTheme);
            } catch (e) {
                // Ignore private browsing restrictions
            }

            const label = `Current theme: ${theme.label}. Click to switch to ${nextTheme.label}`;
            toggleBtn.setAttribute('aria-label', label);
            toggleBtn.setAttribute('title', label);
        };

        // Synchronize on startup
        applyTheme(currentThemeIndex);

        toggleBtn.addEventListener('click', (event) => {
            const nextIndex = (currentThemeIndex + 1) % THEMES.length;

            // 1. Reduced Motion: Instant switch without animation
            if (prefersReducedMotion()) {
                applyTheme(nextIndex);
                return;
            }

            // 2. View Transitions API: Expanding circular clip-path reveal
            if (typeof document.startViewTransition === 'function') {
                let x = window.innerWidth / 2;
                let y = 32;

                if (event && typeof event.clientX === 'number' && event.clientX > 0) {
                    x = event.clientX;
                    y = event.clientY;
                } else {
                    const rect = toggleBtn.getBoundingClientRect();
                    x = rect.left + rect.width / 2;
                    y = rect.top + rect.height / 2;
                }

                const endRadius = Math.hypot(
                    Math.max(x, window.innerWidth - x),
                    Math.max(y, window.innerHeight - y)
                );

                const transition = document.startViewTransition(() => {
                    applyTheme(nextIndex);
                });

                transition.ready.then(() => {
                    document.documentElement.animate(
                        {
                            clipPath: [
                                `circle(0px at ${x}px ${y}px)`,
                                `circle(${endRadius}px at ${x}px ${y}px)`
                            ]
                        },
                        {
                            duration: 500,
                            easing: 'cubic-bezier(.4, 0, .2, 1)',
                            pseudoElement: '::view-transition-new(root)'
                        }
                    );
                }).catch(() => {
                    // Fallback handled automatically
                });
                return;
            }

            // 3. Fallback: 250ms smooth color transition
            document.documentElement.classList.add('theme-fade');
            applyTheme(nextIndex);
            setTimeout(() => {
                document.documentElement.classList.remove('theme-fade');
            }, 250);
        });
    }

    /* --- Sliding Pill Highlight & Active Page Detection --- */
    function initNavbarSlidingPill() {
        const navLinksContainer = document.getElementById('nav-links');
        const pill = document.getElementById('nav-pill-indicator');
        if (!navLinksContainer || !pill) return;

        const links = Array.from(navLinksContainer.querySelectorAll('.nav-link'));
        if (!links.length) return;

        // Auto-detect current active page from route
        const currentPath = window.location.pathname.toLowerCase();
        let activeLink = null;

        links.forEach((link) => {
            const href = (link.getAttribute('href') || '').toLowerCase();
            link.classList.remove('active');
            link.removeAttribute('aria-current');

            if (href === '/' || href === 'index.html') {
                if (currentPath === '/' || currentPath.endsWith('/index.html') || currentPath.endsWith('/') || currentPath === '') {
                    activeLink = link;
                }
            } else {
                const baseName = href.replace('.html', '').replace(/^\//, '');
                if (currentPath.includes(baseName)) {
                    activeLink = link;
                }
            }
        });

        // Default to Home if root
        if (!activeLink && (currentPath === '/' || currentPath.endsWith('/index.html') || currentPath === '')) {
            activeLink = links[0];
        }

        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
        }

        // Also update mobile drawer active link
        const mobileLinks = Array.from(document.querySelectorAll('.mobile-nav-link'));
        mobileLinks.forEach((link) => {
            const href = (link.getAttribute('href') || '').toLowerCase();
            link.classList.remove('active');
            link.removeAttribute('aria-current');

            if (href === '/' || href === 'index.html') {
                if (currentPath === '/' || currentPath.endsWith('/index.html') || currentPath.endsWith('/') || currentPath === '') {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            } else {
                const baseName = href.replace('.html', '').replace(/^\//, '');
                if (currentPath.includes(baseName)) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                }
            }
        });

        const movePillTo = (target) => {
            if (!target) {
                pill.style.opacity = '0';
                return;
            }
            const offsetLeft = target.offsetLeft;
            const width = target.offsetWidth;
            pill.style.transform = `translateX(${offsetLeft}px)`;
            pill.style.width = `${width}px`;
            pill.style.opacity = '1';
        };

        // Position pill on active link without initial animation
        if (activeLink) {
            pill.style.transition = 'none';
            movePillTo(activeLink);
            void pill.offsetWidth; // Force reflow
            pill.style.transition = '';
        }

        // Mouse hover and keyboard focus listeners
        links.forEach((link) => {
            link.addEventListener('mouseenter', () => movePillTo(link));
            link.addEventListener('focus', () => movePillTo(link));
        });

        // Return to active link on mouse leave
        navLinksContainer.addEventListener('mouseleave', () => {
            if (activeLink) {
                movePillTo(activeLink);
            } else {
                pill.style.opacity = '0';
            }
        });

        // Reposition on window resize
        window.addEventListener('resize', () => {
            if (activeLink) {
                pill.style.transition = 'none';
                movePillTo(activeLink);
                void pill.offsetWidth;
                pill.style.transition = '';
            }
        });
    }

    /* --- Mobile Slide-Down Drawer (< 860px) --- */
    function initMobileDrawer() {
        const hamburgerBtn = document.getElementById('mobile-menu-btn');
        const drawer = document.getElementById('mobile-nav-drawer');
        if (!hamburgerBtn || !drawer) return;

        const openDrawer = () => {
            drawer.classList.add('open');
            hamburgerBtn.classList.add('open');
            hamburgerBtn.setAttribute('aria-expanded', 'true');
        };

        const closeDrawer = () => {
            drawer.classList.remove('open');
            hamburgerBtn.classList.remove('open');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        };

        hamburgerBtn.addEventListener('click', () => {
            const isOpen = drawer.classList.contains('open');
            if (isOpen) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });

        // Close when clicking on any mobile nav link
        drawer.querySelectorAll('.mobile-nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                closeDrawer();
            });
        });

        // Close when pressing Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && drawer.classList.contains('open')) {
                closeDrawer();
                hamburgerBtn.focus();
            }
        });

        // Close when clicking outside drawer & hamburger
        document.addEventListener('click', (event) => {
            if (
                drawer.classList.contains('open') &&
                !drawer.contains(event.target) &&
                !hamburgerBtn.contains(event.target)
            ) {
                closeDrawer();
            }
        });

        // Close drawer if window is resized above mobile breakpoint (860px)
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 860 && drawer.classList.contains('open')) {
                closeDrawer();
            }
        });
    }

    /* --- 2px Scroll Progress Line --- */
    function initScrollProgress() {
        const progressBar = document.getElementById('scroll-progress');
        if (!progressBar) return;

        let ticking = false;

        const updateProgress = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateProgress);
                ticking = true;
            }
        }, { passive: true });

        updateProgress();
    }

    /* --- DOM Ready Dispatcher --- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initNavbarTheme();
            initNavbarSlidingPill();
            initMobileDrawer();
            initScrollProgress();
        });
    } else {
        initNavbarTheme();
        initNavbarSlidingPill();
        initMobileDrawer();
        initScrollProgress();
    }
})();
